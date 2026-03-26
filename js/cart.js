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

    console.warn('[cart] user session missing, redirecting to login');
    redirectToLogin();
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
        this.userId = getUserId();
        if (!this.userId) return;
        localStorage.setItem('checkout_user_id', String(this.userId));
        this.init();
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
        if (!this.userId) return;
        await this.loadCart();

        window.addEventListener('auth:login', async () => {
            this.userId = getUserId();
            if (!this.userId) return;
            localStorage.setItem('checkout_user_id', String(this.userId));
            await this.loadCart();
        });

        window.addEventListener('auth:logout', async () => {
            this.userId = getUserId();
            if (!this.userId) return;
            await this.loadCart();
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
        if (!this.userId) return null;
        await ensureApiLayer();
        const data = await window.AMZIRA.cart.getCart();
        console.log('Cart API:', data);
        this.items = Array.isArray(data.items) ? data.items : [];
        this.summary = this.deriveSummary(data);
        this.renderCart();
        this.updateCartCount();
        return data;
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
            redirectToLogin();
            return;
        }
        await ensureApiLayer();
        await window.AMZIRA.cart.updateCartItem(cartItemId, Number(quantity));

        await this.loadCart();
    }

    async removeItem(cartItemId) {
        if (!this.userId) {
            redirectToLogin();
            return;
        }
        await ensureApiLayer();
        await window.AMZIRA.cart.removeFromCart(cartItemId);

        this.showNotification('Item removed from cart', 'info');
        await this.loadCart();
    }

    renderCart() {
        const cartContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        if (!cartContainer) return;

        if (!this.items.length) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you have not added anything to your cart yet.</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            if (cartSummary) cartSummary.style.display = 'none';
            const cartCountText = document.getElementById('cartCountText');
            if (cartCountText) cartCountText.textContent = '0 items';
            return;
        }

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
                                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10" data-id="${item.id || item.cart_item_id}">
                                <button class="qty-btn qty-plus" data-id="${item.id || item.cart_item_id}"><i class="fas fa-plus"></i></button>
                            </div>
                            <div class="item-total">${formatMoney(item.total_price)}</div>
                            <div class="cart-item-buttons">
                                <button class="btn-text remove-item" data-id="${item.id || item.cart_item_id}"><i class="far fa-trash-alt"></i> Remove</button>
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
                <div class="${shippingNoticeClass}"><i class="fas fa-truck"></i><span>${shippingNoticeText}</span></div>
                <div class="summary-row"><span>Tax (GST 5%)</span><span>${formatMoney(this.summary.tax)}</span></div>
                <div class="summary-row total"><strong>Total</strong><strong>${formatMoney(this.summary.total)}</strong></div>
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
                const next = Math.min(10, Number(input?.value || 1) + 1);
                await this.updateQuantity(id, next);
            });
        });

        document.querySelectorAll('.qty-input').forEach((input) => {
            input.addEventListener('change', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                const next = Math.min(10, Math.max(1, Number(event.currentTarget.value || 1)));
                await this.updateQuantity(id, next);
            });
        });

        document.querySelectorAll('.remove-item').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const id = event.currentTarget.getAttribute('data-id');
                await this.removeItem(id);
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
