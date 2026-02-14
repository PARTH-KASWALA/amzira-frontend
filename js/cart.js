/*
  Shopping cart manager.
  - Guest users: local cart (amziraGuestCart) for temporary browsing.
  - Logged-in users: backend cart only via /api/v1/cart/*.
  - On login: guest cart is synced to backend, then local guest cart is cleared.
*/

let productsCache = null;

const LOCALE_CONFIG = {
    currency: '₹',
    currencyCode: 'INR',
    locale: 'en-IN',
    taxRate: 0.18,
    taxLabel: 'GST',
    shippingThreshold: 2000,
    shippingFee: 99
};

function formatMoney(value, decimals = 0) {
    const amount = Number(value) || 0;
    return amount.toLocaleString(LOCALE_CONFIG.locale, {
        style: 'currency',
        currency: LOCALE_CONFIG.currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function normalizeForDisplay(product) {
    if (window.ProductNormalizer && typeof window.ProductNormalizer.normalize === 'function') {
        const normalized = window.ProductNormalizer.normalize(product);
        if (normalized) return { ...product, ...normalized };
    }
    return product;
}

async function ensureApiLayer() {
    if (window.AMZIRA && window.AMZIRA.apiRequest) return;

    await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-amzira-api="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load API layer')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'js/api.js';
        script.async = false;
        script.dataset.amziraApi = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load API layer'));
        document.head.appendChild(script);
    });
}

async function loadProductsData() {
    if (productsCache) return productsCache;

    try {
        await ensureApiLayer();
        const response = await window.AMZIRA.products.getProducts({ limit: 100 });
        productsCache = response?.products || response?.results || (Array.isArray(response) ? response : []);
        return productsCache;
    } catch (error) {
        console.error('Failed to load products:', error);
        return [];
    }
}

async function getProductById(productId) {
    const products = await loadProductsData();
    return products.find((p) => String(p.id) === String(productId));
}

class ShoppingCart {
    constructor() {
        this.guestStorageKey = 'amziraGuestCart';
        this.legacyGuestStorageKey = 'amziraCart';
        this.savedStorageKey = 'amziraSavedForLater';
        this.restoreNoticeKey = 'cartRestoreNotice';
        this.forceReloadKey = 'cartForceReload';
        this.productFallbackImage = 'images/products/product-1-front.jpg';
        this.backendSummary = null;
        this.pendingQuantityUpdates = new Set();
        this.items = this.loadGuestCart();
        this.init();
    }

    normalizeQuantity(quantity) {
        const parsed = Number(quantity);
        if (!Number.isFinite(parsed)) return null;
        return Math.min(10, Math.max(1, Math.floor(parsed)));
    }

    esc(value) {
        if (window.AMZIRA?.utils?.escapeHtml) return window.AMZIRA.utils.escapeHtml(value);
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    getPriceValue(product) {
        const normalized = normalizeForDisplay(product);
        // Audit Ref: [BLOCKER] Price Can Be Zero (Free Products) + backend contract alignment.
        const sale = Number(normalized?.sale_price ?? normalized?.salePrice ?? NaN);
        const current = Number(normalized?.price ?? NaN);
        const base = Number(normalized?.base_price ?? normalized?.basePrice ?? NaN);
        const price = Number.isFinite(sale) && sale > 0
            ? sale
            : (Number.isFinite(current) && current > 0
                ? current
                : (Number.isFinite(base) ? base : 0));
        if (!Number.isFinite(price) || price <= 0) {
            console.error('Invalid price for product:', product?.id, 'Price:', price);
            if (window.errorHandler?.showError) {
                window.errorHandler.showError('Cannot add product: Invalid price. Please contact support.');
            }
            return null;
        }
        return price;
    }

    getOriginalPriceValue(product) {
        const normalized = normalizeForDisplay(product);
        return Number(
            normalized?.basePrice ??
            normalized?.base_price ??
            normalized?.price ??
            normalized?.sale_price ??
            normalized?.salePrice ??
            0
        );
    }

    hardenPlaceholderLinks() {
        // Audit Ref: [BLOCKER] Dead nav/footer links using href="#".
        const selectors = [
            'header a[href="#"]',
            'footer a[href="#"]',
            '.mobile-menu a[href="#"]'
        ];
        document.querySelectorAll(selectors.join(', ')).forEach((anchor) => {
            anchor.setAttribute('href', 'javascript:void(0)');
            anchor.setAttribute('aria-disabled', 'true');
            anchor.classList.add('is-disabled-link');
            anchor.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    }

    setupGlobalImageFallbacks() {
        // Audit Ref: Data integrity/safety - Harden image fallbacks everywhere.
        document.addEventListener('error', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLImageElement)) return;
            if (target.dataset.fallbackApplied === 'true') return;
            target.dataset.fallbackApplied = 'true';
            target.src = this.productFallbackImage;
        }, true);
    }

    setButtonLoading(button, isLoading, loadingText = null) {
        if (!button) return;

        if (window.loadingManager && typeof window.loadingManager.setButtonLoading === 'function') {
            window.loadingManager.setButtonLoading(button, isLoading);
            if (isLoading && loadingText) button.textContent = loadingText;
            return;
        }

        if (isLoading) {
            if (!button.dataset.originalText) button.dataset.originalText = button.textContent;
            button.disabled = true;
            if (loadingText) button.textContent = loadingText;
            return;
        }

        button.disabled = false;
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }

    resolveVariantId(product, size = null, color = null) {
        if (!product || typeof product !== 'object') return null;

        const variants = Array.isArray(product.variants) ? product.variants : [];
        const selectedSize = size ?? product.selectedSize ?? null;
        const selectedColor = color ?? product.selectedColor ?? null;

        const explicitVariant = Number(product.selectedVariantId || product.variant_id || product.default_variant_id || product.defaultVariantId);
        if (Number.isInteger(explicitVariant) && explicitVariant > 0) {
            return explicitVariant;
        }

        if (selectedSize !== null && selectedSize !== undefined) {
            const numericSize = Number(selectedSize);
            if (Number.isInteger(numericSize) && numericSize > 0) {
                return numericSize;
            }
        }

        if (window.selectedVariantId) {
            const selected = Number(window.selectedVariantId);
            if (Number.isInteger(selected) && selected > 0) return selected;
        }

        if (variants.length === 1 && Number.isInteger(Number(variants[0]?.id))) {
            return Number(variants[0].id);
        }

        if (variants.length > 1 && selectedSize != null) {
            const requestedSize = String(selectedSize).trim().toLowerCase();
            const requestedColor = selectedColor == null ? '' : String(selectedColor).trim().toLowerCase();
            const matched = variants.find((variant) => {
                const variantSize = String(variant?.size || '').trim().toLowerCase();
                const variantColor = String(variant?.color || '').trim().toLowerCase();
                if (!variantSize) return false;
                if (variantSize !== requestedSize) return false;
                if (!requestedColor) return true;
                return variantColor === requestedColor;
            });

            const matchedId = Number(matched?.id);
            if (Number.isInteger(matchedId) && matchedId > 0) {
                return matchedId;
            }
        }

        return null;
    }

    async init() {
        this.hardenPlaceholderLinks();
        this.setupGlobalImageFallbacks();
        this.updateCartCount();

        window.addEventListener('auth:login', async () => {
            await this.syncGuestCartToBackend();
            await this.refreshBackendCart();
            this.renderCart();
        });

        window.addEventListener('auth:logout', () => {
            this.items = this.loadGuestCart();
            this.backendSummary = null;
            this.updateCartCount();
            this.renderCart();
        });

        try {
            await ensureApiLayer();
            if (this.isAuthenticated()) {
                await this.syncGuestCartToBackend();
                await this.refreshBackendCart();
            }
        } catch (error) {
            // Backend/API offline: keep guest cart and fail gracefully.
            console.warn('Cart initialized in offline/fallback mode:', error?.message || error);
        }

        if (window.location.pathname.includes('cart.html')) {
            await this.handleRestoreNotice();
            this.renderCart();
        }
    }

    /**
     * Display cart restore message and force backend reload when requested by payment flow.
     * @returns {Promise<void>}
     */
    async handleRestoreNotice() {
        const notice = sessionStorage.getItem(this.restoreNoticeKey);
        const forceReload = sessionStorage.getItem(this.forceReloadKey) === '1';
        if (!notice && !forceReload) return;

        sessionStorage.removeItem(this.restoreNoticeKey);
        sessionStorage.removeItem(this.forceReloadKey);

        if (this.isAuthenticated()) {
            await this.refreshBackendCart();
        }

        if (notice) {
            this.showNotification(notice, 'error');
        }
    }

    isAuthenticated() {
        return Boolean(window.Auth && typeof window.Auth.isLoggedIn === 'function' && window.Auth.isLoggedIn());
    }

    loadGuestCart() {
        const raw = localStorage.getItem(this.guestStorageKey) || localStorage.getItem(this.legacyGuestStorageKey);
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            localStorage.removeItem(this.guestStorageKey);
            localStorage.removeItem(this.legacyGuestStorageKey);
            return [];
        }
    }

    saveGuestCart() {
        localStorage.setItem(this.guestStorageKey, JSON.stringify(this.items));
        localStorage.removeItem(this.legacyGuestStorageKey);
        this.updateCartCount();
    }

    clearGuestCart() {
        localStorage.removeItem(this.guestStorageKey);
        localStorage.removeItem(this.legacyGuestStorageKey);
    }

    normalizeBackendItems(cartData) {
        const sourceItems = cartData?.items || cartData?.cart_items || [];

        return sourceItems.map((item) => {
            const product = item.product || {};
            const variant = item.variant || {};
            const price = Number(item.unit_price || item.price || product.sale_price || product.price || 0);
            const originalPrice = Number(item.original_price || product.price || price);

            return {
                cartItemId: String(item.id || item.cart_item_id || `${item.product_id || product.id}-${item.variant_id || variant.id || 'default'}`),
                backendItemId: item.id || item.cart_item_id || null,
                id: item.product_id || product.id,
                variant_id: item.variant_id || variant.id || null,
                name: item.product_name || product.name || item.name || 'Product',
                price,
                originalPrice,
                image: item.image || product.image || product.images?.[0] || '',
                quantity: Number(item.quantity || 1),
                size: variant.size || item.size || '-',
                color: variant.color || item.color || '-'
            };
        });
    }

    async refreshBackendCart() {
        try {
            await ensureApiLayer();
            const data = await window.AMZIRA.cart.getCart();
            this.items = this.normalizeBackendItems(data);
            this.backendSummary = data || null;
            this.updateCartCount();
            return this.items;
        } catch (error) {
            this.showNotification(error?.message || 'Failed to load cart', 'error');
            return this.items;
        }
    }

    async syncGuestCartToBackend() {
        if (!this.isAuthenticated()) return;

        const guestItems = this.loadGuestCart();
        if (!guestItems.length) return;

        try {
            await ensureApiLayer();

            for (const item of guestItems) {
                if (!item.id) continue;
                if (!Number.isInteger(Number(item.variant_id)) || Number(item.variant_id) <= 0) continue;
                const safeVariantId = Number(item.variant_id);

                await window.AMZIRA.cart.addToCart(item.id, safeVariantId, item.quantity || 1);
            }

            this.clearGuestCart();
        } catch (error) {
            console.warn('Guest cart sync failed:', error?.message || error);
            // Keep local guest cart if sync fails.
        }
    }

    async addItem(productIdOrObject, quantity = 1, size = null, color = null) {
        const normalizedQty = this.normalizeQuantity(quantity);
        if (normalizedQty === null) {
            this.showNotification('Please enter a valid quantity', 'error');
            return false;
        }

        let product;

        if (typeof productIdOrObject === 'object') {
            product = productIdOrObject;
        } else {
            product = await getProductById(productIdOrObject);
            if (!product) {
                this.showNotification('Product not found', 'error');
                return false;
            }
        }

        const variantId = this.resolveVariantId(product, size, color);
        if (!Number.isInteger(Number(variantId)) || Number(variantId) <= 0) {
            this.showNotification('Please select size/color', 'error');
            return false;
        }

        const price = this.getPriceValue(product);
        if (price === null) {
            return false;
        }

        const addToGuestCart = () => {
            let selectedSize = size || product.selectedSize || (product.sizes && product.sizes[0]) || '-';
            let selectedColor = color || product.selectedColor || (product.colors && product.colors[0]?.name) || '-';

            if (variantId && Array.isArray(product.variants)) {
                const variant = product.variants.find((v) => String(v.id) === String(variantId));
                if (variant) {
                    selectedSize = variant.size || selectedSize;
                    selectedColor = variant.color || selectedColor;
                }
            }

            const cartItemId = variantId ? `${product.id}-${variantId}` : `${product.id}-${selectedSize}-${selectedColor}`;
            const existing = this.items.find((item) => item.cartItemId === cartItemId);

            if (existing) {
                existing.quantity = this.normalizeQuantity(existing.quantity + normalizedQty);
                if (existing.quantity >= 10) {
                    this.showNotification('Maximum quantity per item is 10', 'info');
                }
            } else {
                this.items.push({
                    cartItemId,
                    backendItemId: null,
                    id: product.id,
                    variant_id: variantId,
                    name: product.name,
                    price,
                    originalPrice: this.getOriginalPriceValue(product),
                    image: normalizeForDisplay(product)?.mainImage || product.primary_image || (product.images ? product.images[0] : product.image),
                    quantity: normalizedQty,
                    size: selectedSize,
                    color: selectedColor
                });
            }

            this.saveGuestCart();
            this.showNotification('Product added to cart!', 'success');
            if (window.location.pathname.includes('cart.html')) this.renderCart();
            return true;
        };

        if (this.isAuthenticated()) {
            try {
                await ensureApiLayer();
                await window.AMZIRA.cart.addToCart(product.id, variantId, normalizedQty);
                await this.refreshBackendCart();
                this.showNotification('Product added to cart!', 'success');
                if (window.location.pathname.includes('cart.html')) this.renderCart();
                return true;
            } catch (error) {
                if (error?.status === 401 || error?.status === 403) {
                    // Auth cookie missing/expired: fallback to guest cart
                    return addToGuestCart();
                }
                this.showNotification(error?.message || 'Failed to add product', 'error');
                return false;
            }
        }

        return addToGuestCart();
    }

    async removeItem(cartItemId) {
        const item = this.items.find((entry) => entry.cartItemId === cartItemId);
        if (!item) return;

        if (this.isAuthenticated()) {
            try {
                await ensureApiLayer();
                const backendId = item.backendItemId || cartItemId;
                await window.AMZIRA.cart.removeFromCart(backendId);
                await this.refreshBackendCart();
                this.showNotification('Item removed from cart', 'info');
                this.renderCart();
            } catch (error) {
                this.showNotification(error?.message || 'Failed to remove item', 'error');
            }
            return;
        }

        this.items = this.items.filter((entry) => entry.cartItemId !== cartItemId);
        this.saveGuestCart();
        this.showNotification('Item removed from cart', 'info');
        this.renderCart();
    }

    async updateQuantity(cartItemId, quantity) {
        const normalizedQty = this.normalizeQuantity(quantity);
        if (normalizedQty === null) {
            this.showNotification('Please enter a valid quantity', 'error');
            return;
        }

        const item = this.items.find((entry) => entry.cartItemId === cartItemId);
        if (!item) return;
        if (this.pendingQuantityUpdates.has(cartItemId)) return;
        this.pendingQuantityUpdates.add(cartItemId);

        try {
            if (this.isAuthenticated()) {
                await ensureApiLayer();
                const backendId = item.backendItemId || cartItemId;
                await window.AMZIRA.cart.updateCartItem(backendId, normalizedQty);
                await this.refreshBackendCart();
                this.renderCart();
                return;
            }

            item.quantity = normalizedQty;
            this.saveGuestCart();
            this.renderCart();
        } catch (error) {
            this.showNotification(error?.message || 'Failed to update quantity', 'error');
        } finally {
            this.pendingQuantityUpdates.delete(cartItemId);
        }
    }

    async clearCart() {
        if (this.isAuthenticated()) {
            try {
                await ensureApiLayer();
                await window.AMZIRA.cart.clearCart();
                this.items = [];
                this.updateCartCount();
                this.renderCart();
                this.showNotification('Cart cleared', 'info');
            } catch (error) {
                this.showNotification(error?.message || 'Failed to clear cart', 'error');
            }
            return;
        }

        this.items = [];
        this.saveGuestCart();
        this.showNotification('Cart cleared', 'info');
        this.renderCart();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
    }

    getOriginalTotal() {
        return this.items.reduce((total, item) => total + (Number(item.originalPrice) * Number(item.quantity)), 0);
    }

    getSavings() {
        return this.getOriginalTotal() - this.getTotal();
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + Number(item.quantity), 0);
    }

    updateCartCount() {
        const countElement = document.querySelector('.cart-count');
        if (!countElement) return;

        const count = this.getItemCount();
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }

    saveForLater(cartItemId) {
        const item = this.items.find((entry) => entry.cartItemId === cartItemId);
        if (!item) return;

        const saved = JSON.parse(localStorage.getItem(this.savedStorageKey) || '[]');
        saved.push(item);
        localStorage.setItem(this.savedStorageKey, JSON.stringify(saved));

        this.removeItem(cartItemId);
        this.showNotification('Item saved for later', 'success');
    }

    moveToCartFromSaved(cartItemId) {
        let saved = JSON.parse(localStorage.getItem(this.savedStorageKey) || '[]');
        const item = saved.find((entry) => entry.cartItemId === cartItemId);
        if (!item) return;

        this.items.push(item);
        if (!this.isAuthenticated()) {
            this.saveGuestCart();
        }

        saved = saved.filter((entry) => entry.cartItemId !== cartItemId);
        localStorage.setItem(this.savedStorageKey, JSON.stringify(saved));

        this.showNotification('Item moved to cart', 'success');
        this.renderCart();
    }

    removeFromSaved(cartItemId) {
        let saved = JSON.parse(localStorage.getItem(this.savedStorageKey) || '[]');
        saved = saved.filter((entry) => entry.cartItemId !== cartItemId);
        localStorage.setItem(this.savedStorageKey, JSON.stringify(saved));
        this.showNotification('Item removed', 'info');
        this.renderCart();
    }

    getSavedItems() {
        return JSON.parse(localStorage.getItem(this.savedStorageKey) || '[]');
    }

    renderSavedItems() {
        const savedItems = this.getSavedItems();
        if (!savedItems.length) return '';

        return `
            <div class="saved-items-section">
                <h2 class="saved-items-title">Saved For Later (${savedItems.length})</h2>
                <div class="saved-items-grid">
                    ${savedItems.map((item) => `
                        <div class="saved-item" data-id="${item.cartItemId}">
                            <div class="saved-item-image">
                                <img src="${this.esc(item.image)}" alt="${this.esc(item.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/product-1-front.jpg';">
                            </div>
                            <div class="saved-item-info">
                                <h3>${this.esc(item.name)}</h3>
                                <div class="saved-item-meta">
                                    <span>Size: ${this.esc(item.size)}</span>
                                    <span>Color: ${this.esc(item.color)}</span>
                                </div>
                                <div class="saved-item-price">${formatMoney(item.price)}</div>
                                <div class="saved-item-actions">
                                    <button class="btn btn-sm btn-primary move-to-cart-btn" data-id="${this.esc(item.cartItemId)}">Move to Cart</button>
                                    <button class="btn btn-sm btn-secondary remove-saved-btn" data-id="${this.esc(item.cartItemId)}">Remove</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCart() {
        const cartContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');

        if (!cartContainer) return;

        if (!this.items.length) {
            cartContainer.innerHTML = this.getEmptyCartHTML();
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        cartContainer.innerHTML = `
            <div class="cart-items-list">
                ${this.items.map((item) => this.getCartItemHTML(item)).join('')}
            </div>
            ${this.renderSavedItems()}
        `;

        if (cartSummary) {
            cartSummary.innerHTML = this.getCartSummaryHTML();
            cartSummary.style.display = 'block';
        }

        this.attachCartEventListeners();
        this.attachSavedItemsListeners();
    }

    getCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${this.esc(item.cartItemId)}">
                <div class="cart-item-image">
                    <img src="${this.esc(item.image)}" alt="${this.esc(item.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/product-1-front.jpg';">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${this.esc(item.name)}</h3>
                    <div class="cart-item-meta">
                        <span>Size: ${this.esc(item.size || '-')}</span>
                        <span>Color: ${this.esc(item.color || '-')}</span>
                    </div>
                    <div class="cart-item-price">
                        <span class="price-current">${formatMoney(item.price, 2)}</span>
                        ${Number(item.originalPrice) > Number(item.price) ? `<span class="price-original">${formatMoney(item.originalPrice, 2)}</span>` : ''}
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="qty-btn qty-minus" data-id="${this.esc(item.cartItemId)}"><i class="fas fa-minus"></i></button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10" data-id="${this.esc(item.cartItemId)}">
                        <button class="qty-btn qty-plus" data-id="${this.esc(item.cartItemId)}"><i class="fas fa-plus"></i></button>
                    </div>
                    <div class="item-total">${formatMoney(Number(item.price) * Number(item.quantity), 2)}</div>
                    <div class="cart-item-buttons">
                        <button class="btn-text save-for-later-btn" data-id="${this.esc(item.cartItemId)}"><i class="far fa-bookmark"></i> Save for Later</button>
                        <button class="btn-text remove-item" data-id="${this.esc(item.cartItemId)}"><i class="far fa-trash-alt"></i> Remove</button>
                    </div>
                </div>
            </div>
        `;
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you have not added anything to your cart yet.</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
    }

    getCartSummaryHTML() {
        // High-impact UX hardening (pre-launch)
        const backendSubtotal = Number(this.backendSummary?.subtotal);
        const backendDiscount = Number(this.backendSummary?.discount);
        const backendShipping = Number(this.backendSummary?.shipping_amount);
        const backendTax = Number(this.backendSummary?.tax);
        const backendTotal = Number(this.backendSummary?.total);

        const subtotal = Number.isFinite(backendSubtotal) ? backendSubtotal : this.getTotal();
        const originalTotal = this.getOriginalTotal();
        const savings = this.getSavings();
        const discount = Number.isFinite(backendDiscount) ? Math.max(0, backendDiscount) : 0;
        const shipping = Number.isFinite(backendShipping)
            ? backendShipping
            : (subtotal >= LOCALE_CONFIG.shippingThreshold ? 0 : LOCALE_CONFIG.shippingFee);
        const taxableAmount = Math.max(0, subtotal - discount + shipping);
        const tax = Number.isFinite(backendTax) ? backendTax : taxableAmount * LOCALE_CONFIG.taxRate;
        const total = Number.isFinite(backendTotal) ? backendTotal : subtotal - discount + shipping + tax;

        return `
            <h3>Order Summary</h3>
            <div class="summary-row"><span>Subtotal (${this.getItemCount()} items)</span><span>${formatMoney(subtotal, 2)}</span></div>
            ${discount > 0 ? `<div class="summary-row savings"><span>Discount</span><span>-${formatMoney(discount, 2)}</span></div>` : ''}
            ${savings > 0 ? `<div class="summary-row savings"><span>You Save</span><span>-${formatMoney(savings, 2)}</span></div>` : ''}
            <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? formatMoney(0, 2) : formatMoney(shipping, 2)}</span></div>
            <div class="summary-row"><span>${LOCALE_CONFIG.taxLabel} (${LOCALE_CONFIG.taxRate * 100}%)</span><span>${formatMoney(tax, 2)}</span></div>
            <div class="summary-row total"><strong>Total</strong><strong>${formatMoney(total, 2)}</strong></div>
            <button class="btn btn-primary btn-block checkout-btn">Proceed to Checkout</button>
            <a href="index.html" class="btn btn-secondary btn-block">Continue Shopping</a>
        `;
    }

    attachCartEventListeners() {
        document.querySelectorAll('.qty-minus').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                const currentQty = Number(input.value);
                if (currentQty > 1) {
                    await this.updateQuantity(id, currentQty - 1);
                }
            });
        });

        document.querySelectorAll('.qty-plus').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                const currentQty = Number(input.value);
                if (currentQty < 10) {
                    await this.updateQuantity(id, currentQty + 1);
                }
            });
        });

        document.querySelectorAll('.qty-input').forEach((input) => {
            input.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const qty = this.normalizeQuantity(e.target.value);
                if (qty === null) {
                    e.target.value = 1;
                    this.showNotification('Quantity must be between 1 and 10', 'error');
                    return;
                }

                e.target.value = qty;
                await this.updateQuantity(id, qty);
            });
        });

        document.querySelectorAll('.remove-item').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Remove this item from cart?')) {
                    await this.removeItem(id);
                }
            });
        });

        document.querySelectorAll('.save-for-later-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.saveForLater(id);
            });
        });

        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Audit Ref: Loading states don't cover checkout action.
                this.setButtonLoading(checkoutBtn, true, 'Redirecting...');

                if (!this.items.length) {
                    this.setButtonLoading(checkoutBtn, false);
                    this.showNotification('Your cart is empty', 'error');
                    return;
                }

                if (!this.isAuthenticated()) {
                    sessionStorage.setItem('returnUrl', 'checkout.html');
                    this.setButtonLoading(checkoutBtn, false);
                    this.showNotification('Please login to continue', 'error');
                    window.location.href = 'login.html';
                    return;
                }

                window.location.href = 'checkout.html';
            });
        }
    }

    attachSavedItemsListeners() {
        document.querySelectorAll('.move-to-cart-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.moveToCartFromSaved(id);
            });
        });

        document.querySelectorAll('.remove-saved-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Remove this item?')) {
                    this.removeFromSaved(id);
                }
            });
        });
    }

    showNotification(message, type = 'info') {
        if (window.loadingManager && typeof window.loadingManager.showNotification === 'function') {
            return window.loadingManager.showNotification(message, type);
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideInRight 0.3s ease;
            min-width: 250px;
        `;

        const icon = document.createElement('i');
        icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`;
        notification.appendChild(icon);

        const span = document.createElement('span');
        span.textContent = message;
        notification.appendChild(span);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

let cart = null;

if (typeof window !== 'undefined' && window.cart) {
    cart = window.cart;
} else {
    cart = new ShoppingCart();

    if (typeof window !== 'undefined') {
        window.cart = cart;
    }

    function dispatchCartReady() {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartReady', { detail: { cart } }));
        }
    }

    if (typeof window !== 'undefined' && document.readyState === 'complete') {
        dispatchCartReady();
    } else if (typeof window !== 'undefined') {
        window.addEventListener('load', dispatchCartReady, { once: true });
    }
}

async function quickAddToCart(productId, size = null, color = null) {
    return cart.addItem(productId, 1, size, color);
}

async function loadProductDetail(slug) {
    try {
        await ensureApiLayer();
        const product = await window.AMZIRA.products.getProductDetail(slug);

        window.currentProduct = product;

        const sizeSelect = document.getElementById('sizeSelect');
        if (!sizeSelect) return;

        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        (product.variants || []).forEach((variant) => {
            const option = document.createElement('option');
            option.value = variant.id;
            option.textContent = variant.size;
            sizeSelect.appendChild(option);
        });

        sizeSelect.addEventListener('change', (e) => {
            window.selectedVariantId = Number(e.target.value) || null;
        });
    } catch (error) {
        console.error('Failed to load product detail:', error);
    }
}
