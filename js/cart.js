const isLocalDevHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const devLog = isLocalDevHost ? console.log.bind(console, '[cart]') : () => {};
const devWarn = isLocalDevHost ? console.warn.bind(console, '[cart]') : () => {};

let productsCache = null;
const CART_PRICE_CONFIG = {
    shippingThreshold: 2000,
    shippingFee: 99,
    taxRate: 0.05
};

function getApiBaseUrl() {
    if (window.AMZIRA && typeof window.AMZIRA.API_BASE_URL === 'string') {
        return window.AMZIRA.API_BASE_URL.replace(/\/$/, '');
    }

    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:8000/api/v1`;
    }

    return `${window.location.origin}/api/v1`;
}

function getBackendOrigin() {
    return getApiBaseUrl().replace(/\/api\/v1$/, '');
}

function redirectToLogin() {
    const returnUrl = `${window.location.pathname}${window.location.search || ''}`;
    try {
        sessionStorage.setItem('returnUrl', returnUrl);
    } catch (_) {
        // Ignore storage failures and continue redirecting.
    }
    window.location.href = 'login.html';
}

async function ensureCsrfToken() {
    await fetch(`${getApiBaseUrl()}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include'
    });
}

function readCookie(name) {
    const prefix = `${name}=`;
    return document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix))
        ?.slice(prefix.length) || '';
}

async function apiFetch(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = {
        ...(options.headers || {})
    };

    if (method !== 'GET') {
        await ensureCsrfToken();
        const csrfToken = readCookie('csrf_token');
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
    }

    const response = await fetch(`${getBackendOrigin()}${path}`, {
        method,
        credentials: 'include',
        headers,
        body: options.body
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || `Request failed (${response.status})`);
    }
    return payload.data;
}

function getUserId() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('user_id');
    if (fromQuery && Number(fromQuery) > 0) return Number(fromQuery);

    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.id && Number(user.id) > 0) return Number(user.id);
    } catch (_) {
        // Ignore invalid stored user.
    }

    const stored = localStorage.getItem('checkout_user_id');
    if (stored && Number(stored) > 0) return Number(stored);

    return null;
}

function formatMoney(value) {
    const amount = Number(value) || 0;
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function getStoredWishlist() {
    try {
        const wishlist = JSON.parse(localStorage.getItem('amziraWishlist') || '[]');
        return Array.isArray(wishlist) ? wishlist : [];
    } catch (_) {
        return [];
    }
}

function updateStoredWishlist(items) {
    localStorage.setItem('amziraWishlist', JSON.stringify(items));
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
    return products.find((product) => String(product.id) === String(productId));
}

class ShoppingCart {
    constructor() {
        this.items = [];
        this.summary = { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };
        this.pendingRemovalId = null;
        this.userId = getUserId();
        if (this.userId) {
            localStorage.setItem('checkout_user_id', String(this.userId));
        }
        this.init();
    }

    clearStoredAuthHints() {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('checkout_user_id');
        } catch (_) {
            // Ignore storage cleanup failures and fall back to guest UI.
        }
    }

    resetToGuestState({ clearStoredAuth = false } = {}) {
        if (clearStoredAuth) {
            this.clearStoredAuthHints();
        }
        this.userId = null;
        this.items = [];
        this.summary = { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };
        this.pendingRemovalId = null;
        this.renderCart();
        this.updateCartCount();
    }

    deriveSummary(rawSummary = {}) {
        const computedSubtotal = this.items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
        const subtotal = Number.isFinite(Number(rawSummary?.subtotal)) && Number(rawSummary.subtotal) > 0
            ? Number(rawSummary.subtotal)
            : computedSubtotal;
        const discount = Number(rawSummary?.discount || rawSummary?.discount_amount || 0) || 0;
        const shipping = Number.isFinite(Number(rawSummary?.shipping_amount))
            ? Number(rawSummary.shipping_amount)
            : (subtotal >= CART_PRICE_CONFIG.shippingThreshold ? 0 : CART_PRICE_CONFIG.shippingFee);
        const taxableAmount = Math.max(0, subtotal - discount + shipping);
        const tax = taxableAmount * CART_PRICE_CONFIG.taxRate;
        const total = subtotal - discount + shipping + tax;

        return { subtotal, discount, shipping, tax, total };
    }

    async init() {
        if (this.userId) {
            this.renderLoadingState();
            try {
                await this.loadCart();
            } catch (error) {
                if (error?.status === 401) {
                    devWarn('Falling back to guest cart after unauthorized bootstrap.', error);
                    this.resetToGuestState({ clearStoredAuth: true });
                } else {
                    throw error;
                }
            }
        } else {
            this.renderCart();
            this.updateCartCount();
        }

        window.addEventListener('auth:login', async () => {
            this.userId = getUserId();
            if (this.userId) {
                localStorage.setItem('checkout_user_id', String(this.userId));
                await this.loadCart();
                return;
            }
            this.items = [];
            this.summary = { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };
            this.renderCart();
            this.updateCartCount();
        });

        window.addEventListener('auth:logout', async () => {
            this.resetToGuestState({ clearStoredAuth: true });
        });
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }

    updateCartCount() {
        const countElement = document.querySelector('.cart-count');
        if (!countElement) return;

        const count = this.getItemCount();
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }

    async loadCart() {
        if (!this.userId) {
            this.resetToGuestState();
            return null;
        }
        try {
            await ensureApiLayer();
            const data = await window.AMZIRA.cart.getCart();
            devLog('api', data);
            this.items = Array.isArray(data.items) ? data.items : [];
            this.summary = this.deriveSummary(data);
            this.pendingRemovalId = null;
            this.renderCart();
            this.updateCartCount();
            return data;
        } catch (error) {
            if (error?.status === 401) {
                devWarn('Cart request unauthorized. Clearing stale client auth state.', error);
                this.resetToGuestState({ clearStoredAuth: true });
                return null;
            }
            throw error;
        }
    }

    renderLoadingState() {
        const cartContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="cart-skeleton" aria-hidden="true">
                    <div class="skeleton-row">
                        <div class="skeleton-block skeleton-thumb"></div>
                        <div>
                            <div class="skeleton-block skeleton-title"></div>
                            <div class="skeleton-block skeleton-meta"></div>
                            <div class="skeleton-block skeleton-price"></div>
                        </div>
                        <div class="skeleton-block skeleton-actions"></div>
                    </div>
                    <div class="skeleton-row">
                        <div class="skeleton-block skeleton-thumb"></div>
                        <div>
                            <div class="skeleton-block skeleton-title"></div>
                            <div class="skeleton-block skeleton-meta"></div>
                            <div class="skeleton-block skeleton-price"></div>
                        </div>
                        <div class="skeleton-block skeleton-actions"></div>
                    </div>
                </div>
            `;
        }
        if (cartSummary) {
            cartSummary.style.display = 'block';
            cartSummary.innerHTML = `
                <h3>Order Summary</h3>
                <div class="summary-row"><span>Subtotal</span><span>...</span></div>
                <div class="summary-row"><span>Shipping</span><span>...</span></div>
                <div class="summary-row"><span>Tax</span><span>...</span></div>
                <div class="summary-row total"><strong>Total</strong><strong>...</strong></div>
            `;
        }
    }

    async addItem(productIdOrObject, quantity = 1, size = null, color = null) {
        if (!this.userId) {
            redirectToLogin();
            return false;
        }
        let product = productIdOrObject;
        if (typeof productIdOrObject !== 'object') {
            product = await getProductById(productIdOrObject);
        }

        if (!product?.id) {
            this.showNotification('Product not found', 'error');
            return false;
        }

        let variantId = null;
        if (product.selectedVariantId) {
            variantId = Number(product.selectedVariantId);
        } else if (product.variant_id) {
            variantId = Number(product.variant_id);
        } else if (Array.isArray(product.variants) && product.variants.length) {
            const matched = product.variants.find((variant) => {
                if (size && String(variant.size).toLowerCase() !== String(size).toLowerCase()) return false;
                if (color && String(variant.color || '').toLowerCase() !== String(color).toLowerCase()) return false;
                return true;
            }) || product.variants[0];
            variantId = Number(matched?.id || 0);
        } else if (product.default_variant?.variant_id) {
            variantId = Number(product.default_variant.variant_id);
        }

        await ensureApiLayer();
        await window.AMZIRA.cart.addToCart(product.id, variantId || undefined, Number(quantity) || 1);

        this.showNotification('Product added to cart!', 'success');
        await this.loadCart();
        return true;
    }

    async updateQuantity(cartItemId, quantity) {
        if (!this.userId) {
            return;
        }
        await ensureApiLayer();
        await window.AMZIRA.cart.updateCartItem(cartItemId, Number(quantity));

        await this.loadCart();
    }

    async removeItem(cartItemId) {
        if (!this.userId) {
            return;
        }
        await ensureApiLayer();
        await window.AMZIRA.cart.removeFromCart(cartItemId);

        this.showNotification('Item removed from cart', 'info');
        await this.loadCart();
    }

    async moveToWishlist(item) {
        const wishlist = getStoredWishlist();
        const wishlistKey = item?.product_slug || item?.slug || item?.product_id || item?.id;
        if (wishlistKey == null) {
            this.showNotification('Unable to save this item for later', 'error');
            return;
        }

        const normalizedKey = String(wishlistKey);
        if (!wishlist.includes(normalizedKey)) {
            wishlist.push(normalizedKey);
            updateStoredWishlist(wishlist);
        }

        await this.removeItem(item.id || item.cart_item_id);
        this.showNotification('Moved to wishlist', 'success');
    }

    buildRecommendationsMarkup() {
        const recommendations = (productsCache || [])
            .filter((product) => product?.slug && product?.name)
            .slice(0, 4);

        if (!recommendations.length) return '';

        return `
            <section class="cart-recommendations">
                <div class="recommendations-header">
                    <h3>You Might Also Like</h3>
                    <p>Fresh arrivals worth a second look while your cart is empty.</p>
                </div>
                <div class="recommendations-grid">
                    ${recommendations.map((product) => `
                        <a class="recommendation-card" href="product-detail.html?slug=${encodeURIComponent(product.slug)}">
                            <div class="recommendation-image-wrap">
                                <img
                                    class="recommendation-image"
                                    src="${escapeHtml(product.image || product.primary_image || product.images?.[0] || 'images/products/product-1-front.jpg')}"
                                    alt="${escapeHtml(product.name)}"
                                    loading="lazy"
                                >
                            </div>
                            <div class="recommendation-copy">
                                <div class="recommendation-name">${escapeHtml(product.name)}</div>
                                <div class="recommendation-price">${formatMoney(product.sale_price || product.base_price || product.price || 0)}</div>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </section>
        `;
    }

    renderCart() {
        const cartContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        if (!cartContainer) return;

        if (!this.userId) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <h2>Your cart awaits</h2>
                    <p>Please login to view and manage your cart.</p>
                    <div class="empty-cart-actions">
                        <a href="login.html" class="btn btn-primary">Login to Continue</a>
                        <a href="men.html" class="btn btn-secondary">Shop Men's</a>
                        <a href="women.html" class="btn btn-secondary">Shop Women's</a>
                    </div>
                </div>
            `;
            if (cartSummary) cartSummary.style.display = 'none';
            const cartCountText = document.getElementById('cartCountText');
            if (cartCountText) cartCountText.textContent = 'Guest session';
            return;
        }

        if (!this.items.length) {
            if (!productsCache) {
                loadProductsData()
                    .then(() => this.renderCart())
                    .catch(() => {});
            }
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you have not added anything to your cart yet.</p>
                    <div class="empty-cart-actions">
                        <a href="men.html" class="btn btn-primary">Shop Men's</a>
                        <a href="women.html" class="btn btn-secondary">Shop Women's</a>
                    </div>
                </div>
                ${this.buildRecommendationsMarkup()}
            `;
            if (cartSummary) cartSummary.style.display = 'none';
            const cartCountText = document.getElementById('cartCountText');
            if (cartCountText) cartCountText.textContent = '0 items';
            return;
        }

        const shippingProgress = Math.min(100, Math.max(0, (this.summary.subtotal / CART_PRICE_CONFIG.shippingThreshold) * 100));
        const shippingDelta = Math.max(0, CART_PRICE_CONFIG.shippingThreshold - this.summary.subtotal);
        cartContainer.innerHTML = `
                <div class="cart-items-list">
                ${this.items.map((item) => `
                    <div class="cart-item" data-id="${item.id || item.cart_item_id}">
                        <div class="cart-item-image">
                            <img src="${escapeHtml(item.product_image || 'images/products/product-1-front.jpg')}" alt="${escapeHtml(item.product_name)}" loading="lazy">
                        </div>
                        <div class="cart-item-details">
                            <h3 class="cart-item-name">${escapeHtml(item.product_name)}</h3>
                            <div class="cart-item-meta">
                                <span>${escapeHtml(item.variant_details || '-')}</span>
                            </div>
                            <div class="cart-item-price">
                                <span class="price-current">${formatMoney(item.unit_price)}</span>
                            </div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="qty-btn qty-minus" data-id="${item.id || item.cart_item_id}"><i class="fas fa-minus"></i></button>
                                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${Math.max(1, Number(item.stock_available || item.quantity || 1))}" data-id="${item.id || item.cart_item_id}">
                                <button class="qty-btn qty-plus" data-id="${item.id || item.cart_item_id}"><i class="fas fa-plus"></i></button>
                            </div>
                            <div class="item-total">${formatMoney(item.total_price)}</div>
                            <div class="cart-item-buttons">
                                <button class="btn-text move-to-wishlist" data-id="${item.id || item.cart_item_id}"><i class="far fa-heart"></i> Move to Wishlist</button>
                                <button class="btn-text remove-item" data-id="${item.id || item.cart_item_id}"><i class="far fa-trash-alt"></i> Remove</button>
                                ${String(this.pendingRemovalId) === String(item.id || item.cart_item_id) ? `
                                    <div class="remove-confirm">
                                        <span>Remove item?</span>
                                        <button class="confirm-yes" data-id="${item.id || item.cart_item_id}">Yes</button>
                                        <button class="confirm-no" data-id="${item.id || item.cart_item_id}">Cancel</button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        if (cartSummary) {
            const shippingNoticeClass = this.summary.shipping === 0 ? 'shipping-notice success' : 'shipping-notice';
            const shippingNoticeText = this.summary.shipping === 0
                ? 'You have unlocked free shipping on this order.'
                : `Add ${formatMoney(Math.max(0, CART_PRICE_CONFIG.shippingThreshold - this.summary.subtotal))} more to unlock free shipping.`;
            cartSummary.innerHTML = `
                <h3>Order Summary</h3>
                <div class="summary-row"><span>Subtotal (${this.getItemCount()} items)</span><span>${formatMoney(this.summary.subtotal)}</span></div>
                <div class="summary-row"><span>Shipping</span><span>${this.summary.shipping === 0 ? 'FREE' : formatMoney(this.summary.shipping)}</span></div>
                <div class="shipping-progress">
                    <div class="shipping-progress-label">
                        <span>${this.summary.shipping === 0 ? 'Free shipping unlocked' : 'Free shipping progress'}</span>
                        <span>${shippingDelta === 0 ? '100%' : formatMoney(shippingDelta)} away</span>
                    </div>
                    <div class="shipping-progress-bar">
                        <div class="shipping-progress-fill" style="width:${shippingProgress}%"></div>
                    </div>
                </div>
                <div class="${shippingNoticeClass}"><i class="fas fa-truck"></i><span>${shippingNoticeText}</span></div>
                <div class="summary-row"><span>Tax (GST 5%)</span><span>${formatMoney(this.summary.tax)}</span></div>
                <div class="summary-row total"><strong>Total</strong><strong>${formatMoney(this.summary.total)}</strong></div>
                <div class="summary-trust">
                    <div class="summary-trust-item"><i class="fas fa-lock"></i><span>Secure checkout with protected payments</span></div>
                    <div class="summary-trust-item"><i class="fas fa-truck-fast"></i><span>Fast dispatch for ready-to-ship styles</span></div>
                    <div class="summary-trust-item"><i class="fas fa-rotate-left"></i><span>Easy return support after delivery</span></div>
                </div>
                <button class="btn btn-primary btn-block checkout-btn" id="checkout-btn">Proceed to Checkout</button>
                <a href="index.html" class="btn btn-secondary btn-block">Continue Shopping</a>
            `;
            cartSummary.style.display = 'block';
        }

        const cartCountText = document.getElementById('cartCountText');
        if (cartCountText) {
            const count = this.getItemCount();
            cartCountText.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
        }

        this.attachCartEventListeners();
    }

    attachCartEventListeners() {
        document.querySelectorAll('.qty-minus').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                const next = Math.max(1, Number(input?.value || 1) - 1);
                await this.updateQuantity(id, next);
            });
        });

        document.querySelectorAll('.qty-plus').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                const max = Math.max(1, Number(input?.getAttribute('max') || input?.value || 1));
                const next = Math.min(max, Number(input?.value || 1) + 1);
                await this.updateQuantity(id, next);
            });
        });

        document.querySelectorAll('.qty-input').forEach((input) => {
            input.addEventListener('change', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                const max = Math.max(1, Number(event.currentTarget.getAttribute('max') || event.currentTarget.value || 1));
                const next = Math.min(max, Math.max(1, Number(event.currentTarget.value || 1)));
                await this.updateQuantity(id, next);
            });
        });

        document.querySelectorAll('.remove-item').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                this.pendingRemovalId = id;
                this.renderCart();
            });
        });

        document.querySelectorAll('.move-to-wishlist').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                const item = this.items.find((entry) => String(entry.id || entry.cart_item_id) === String(id));
                if (!item) {
                    this.showNotification('Item no longer available in cart', 'warning');
                    return;
                }
                await this.moveToWishlist(item);
            });
        });

        document.querySelectorAll('.confirm-yes').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                await this.removeItem(id);
            });
        });

        document.querySelectorAll('.confirm-no').forEach((button) => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                if (String(this.pendingRemovalId) === String(id)) {
                    this.pendingRemovalId = null;
                    this.renderCart();
                }
            });
        });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (!this.items.length) {
                    this.showNotification('Cart is empty', 'error');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }
    }

    showNotification(message, type = 'info') {
        if (window.loadingManager && typeof window.loadingManager.showNotification === 'function') {
            window.loadingManager.showNotification(message, type);
            return;
        }

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 10000;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
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

        sizeSelect.addEventListener('change', (event) => {
            window.selectedVariantId = Number(event.target.value) || null;
        });
    } catch (error) {
        console.error('Failed to load product detail:', error);
    }
}
