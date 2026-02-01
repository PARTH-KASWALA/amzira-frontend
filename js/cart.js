/* ===================================
   SHOPPING CART FUNCTIONALITY - FIXED
   Cart management, localStorage, calculations
   =================================== */

// Global products cache
let productsCache = null;

// Load products from JSON
async function loadProductsData() {
    if (productsCache) return productsCache;
    
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        productsCache = data.products;
        return productsCache;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Get product by ID
async function getProductById(productId) {
    const products = await loadProductsData();
    return products.find(p => p.id === productId);
}

// Cart Class
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }
    
    // Load cart from localStorage
    loadCart() {
        const cartData = localStorage.getItem('amziraCart');
        return cartData ? JSON.parse(cartData) : [];
    }
    
    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('amziraCart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    // Add item to cart
    async addItem(productIdOrObject, quantity = 1, size = null, color = null) {
        let product;
        
        // If product object passed directly
        if (typeof productIdOrObject === 'object') {
            product = productIdOrObject;
        } else {
            // Fetch product from JSON
            product = await getProductById(productIdOrObject);
            if (!product) {
                this.showNotification('Product not found', 'error');
                return false;
            }
        }
        
        const selectedSize = size || product.selectedSize || (product.sizes && product.sizes[0]);
        const selectedColor = color || product.selectedColor || (product.colors && product.colors[0]?.name);
        
        // Create unique cart item ID based on product + size + color
        const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
        
        const existingItem = this.items.find(item => item.cartItemId === cartItemId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                cartItemId: cartItemId,
                id: product.id,
                name: product.name,
                price: product.salePrice || product.price,
                originalPrice: product.price,
                image: product.images ? product.images[0] : product.image,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor
            });
        }
        
        this.saveCart();
        this.showNotification('Product added to cart!', 'success');
        return true;
    }
    
    // Remove item from cart
    removeItem(cartItemId) {
        this.items = this.items.filter(item => item.cartItemId !== cartItemId);
        this.saveCart();
        this.showNotification('Item removed from cart', 'info');
    }
    
    // Update item quantity
    updateQuantity(cartItemId, quantity) {
        const item = this.items.find(item => item.cartItemId === cartItemId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(cartItemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }
    
    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    // Get original total (before discounts)
    getOriginalTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.originalPrice * item.quantity);
        }, 0);
    }
    
    // Get total savings
    getSavings() {
        return this.getOriginalTotal() - this.getTotal();
    }
    
    // Get item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    // Clear entire cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.showNotification('Cart cleared', 'info');
    }
    
    // Update cart count badge
    updateCartCount() {
        const countElement = document.querySelector('.cart-count');
        if (countElement) {
            const count = this.getItemCount();
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Move item to wishlist
    moveToWishlist(cartItemId) {
        const item = this.items.find(item => item.cartItemId === cartItemId);
        if (item) {
            let wishlist = JSON.parse(localStorage.getItem('amziraWishlist') || '[]');
            if (!wishlist.includes(item.id)) {
                wishlist.push(item.id);
                localStorage.setItem('amziraWishlist', JSON.stringify(wishlist));
            }
            this.removeItem(cartItemId);
            this.showNotification('Item moved to wishlist', 'success');
        }
    }
    
    // Save for Later functionality
    saveForLater(cartItemId) {
        const item = this.items.find(item => item.cartItemId === cartItemId);
        if (!item) return;

        let savedItems = JSON.parse(localStorage.getItem('amziraSavedForLater') || '[]');

        savedItems.push(item);
        localStorage.setItem('amziraSavedForLater', JSON.stringify(savedItems));

        this.removeItem(cartItemId);
        this.showNotification('Item saved for later', 'success');
    }

    // Move back to cart
    moveToCartFromSaved(cartItemId) {
        let savedItems = JSON.parse(localStorage.getItem('amziraSavedForLater') || '[]');
        const item = savedItems.find(item => item.cartItemId === cartItemId);
        if (!item) return;

        this.items.push(item);
        this.saveCart();

        savedItems = savedItems.filter(i => i.cartItemId !== cartItemId);
        localStorage.setItem('amziraSavedForLater', JSON.stringify(savedItems));

        this.showNotification('Item moved to cart', 'success');
    }

    // Remove saved item
    removeFromSaved(cartItemId) {
        let savedItems = JSON.parse(localStorage.getItem('amziraSavedForLater') || '[]');
        savedItems = savedItems.filter(i => i.cartItemId !== cartItemId);
        localStorage.setItem('amziraSavedForLater', JSON.stringify(savedItems));
        this.showNotification('Item removed', 'info');
    }

    // Get saved items
    getSavedItems() {
        return JSON.parse(localStorage.getItem('amziraSavedForLater') || '[]');
    }

    // Render saved items section
    renderSavedItems() {
        const savedItems = this.getSavedItems();
        if (savedItems.length === 0) return '';

        return `
            <div class="saved-items-section">
                <h2 class="saved-items-title">
                    Saved For Later (${savedItems.length})
                </h2>
                <div class="saved-items-grid">
                    ${savedItems.map(item => `
                        <div class="saved-item" data-id="${item.cartItemId}">
                            <div class="saved-item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="saved-item-info">
                                <h3>${item.name}</h3>
                                <div class="saved-item-meta">
                                    <span>Size: ${item.size}</span>
                                    <span>Color: ${item.color}</span>
                                </div>
                                <div class="saved-item-price">$${item.price}</div>
                                <div class="saved-item-actions">
                                    <button class="btn btn-sm btn-primary move-to-cart-btn" data-id="${item.cartItemId}">
                                        Move to Cart
                                    </button>
                                    <button class="btn btn-sm btn-secondary remove-saved-btn" data-id="${item.cartItemId}">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Render cart page
    renderCart() {
        const cartContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartContainer) return;
        
        if (this.items.length === 0) {
            cartContainer.innerHTML = this.getEmptyCartHTML();
            if (cartSummary) {
                cartSummary.style.display = 'none';
            }
            return;
        }
        
        cartContainer.innerHTML = `
            <div class="cart-items-list">
                ${this.items.map(item => this.getCartItemHTML(item)).join('')}
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
    
    // Generate cart item HTML
    getCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.cartItemId}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <div class="cart-item-meta">
                        <span>Size: ${item.size}</span>
                        <span>Color: ${item.color}</span>
                    </div>
                    <div class="cart-item-price">
                        <span class="price-current">$${item.price}</span>
                        ${item.originalPrice > item.price ? 
                            `<span class="price-original">$${item.originalPrice}</span>` : ''}
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="qty-btn qty-minus" data-id="${item.cartItemId}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10" data-id="${item.cartItemId}">
                        <button class="qty-btn qty-plus" data-id="${item.cartItemId}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="cart-item-buttons">
                        <button class="btn-text save-for-later-btn" data-id="${item.cartItemId}">
                            <i class="far fa-bookmark"></i> Save for Later
                        </button>
                        <button class="btn-text move-to-wishlist" data-id="${item.cartItemId}">
                            <i class="far fa-heart"></i> Move to Wishlist
                        </button>
                        <button class="btn-text remove-item" data-id="${item.cartItemId}">
                            <i class="far fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generate empty cart HTML
    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
    }
    
    // Generate cart summary HTML
    getCartSummaryHTML() {
        const subtotal = this.getTotal();
        const originalTotal = this.getOriginalTotal();
        const savings = this.getSavings();
        const shipping = subtotal > 100 ? 0 : 10;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        
        return `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal (${this.getItemCount()} items)</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${savings > 0 ? `
            <div class="summary-row savings">
                <span>You Save</span>
                <span>-$${savings.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <strong>Total</strong>
                <strong>$${total.toFixed(2)}</strong>
            </div>
            ${shipping > 0 ? `
            <div class="shipping-notice">
                <i class="fas fa-truck"></i>
                Add $${(100 - subtotal).toFixed(2)} more for FREE shipping
            </div>
            ` : `
            <div class="shipping-notice success">
                <i class="fas fa-check-circle"></i>
                You've qualified for FREE shipping!
            </div>
            `}
            <button class="btn btn-primary btn-block checkout-btn">
                Proceed to Checkout
            </button>
            <a href="index.html" class="btn btn-secondary btn-block">Continue Shopping</a>
        `;
    }
    
    // Attach event listeners to cart items
    attachCartEventListeners() {
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                const currentQty = parseInt(input.value);
                if (currentQty > 1) {
                    this.updateQuantity(id, currentQty - 1);
                    this.renderCart();
                }
            });
        });
        
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const input = document.querySelector(`.qty-input[data-id="${id}"]`);
                const currentQty = parseInt(input.value);
                if (currentQty < 10) {
                    this.updateQuantity(id, currentQty + 1);
                    this.renderCart();
                }
            });
        });
        
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const qty = parseInt(e.target.value);
                if (qty > 0 && qty <= 10) {
                    this.updateQuantity(id, qty);
                    this.renderCart();
                }
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Remove this item from cart?')) {
                    this.removeItem(id);
                    this.renderCart();
                }
            });
        });
        
        document.querySelectorAll('.move-to-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.moveToWishlist(id);
                this.renderCart();
            });
        });
        
        // Save for later
        document.querySelectorAll('.save-for-later-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.saveForLater(id);
                this.renderCart();
            });
        });
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                alert('Checkout functionality to be implemented. This would redirect to payment gateway.');
            });
        }
    }
    
    attachSavedItemsListeners() {
        document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.moveToCartFromSaved(id);
                this.renderCart();
            });
        });

        document.querySelectorAll('.remove-saved-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Remove this item?')) {
                    this.removeFromSaved(id);
                    this.renderCart();
                }
            });
        });
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Use centralized loadingManager if available (safe escaping)
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
    
    // Initialize cart
    init() {
        this.updateCartCount();
        
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }
    }
}

// Create global cart instance with safety checks
let cart = null;

if (typeof window !== 'undefined' && window.cart) {
    console.warn('Cart already initialized, skipping duplicate load');
    cart = window.cart;
} else {
    cart = new ShoppingCart();

    // Export for use in other files
    if (typeof window !== 'undefined') {
        window.cart = cart;
    }

    // Dispatch event when cart is ready. If document is already loaded, dispatch immediately;
    // otherwise wait for the window load event.
    function _dispatchCartReady() {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartReady', { detail: { cart } }));
        }
    }

    if (typeof window !== 'undefined' && document.readyState === 'complete') {
        _dispatchCartReady();
    } else if (typeof window !== 'undefined') {
        window.addEventListener('load', _dispatchCartReady, { once: true });
    }
}

// Quick add to cart function - NOW WITH REAL PRODUCTS
async function quickAddToCart(productId, size = null, color = null) {
    await cart.addItem(productId, 1, size, color);
}




// Add this function at the end of cart.js

// Checkout button handler
function initCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Check if cart is empty
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            if (window.errorHandler) {
                window.errorHandler.showError('Your cart is empty');
            } else {
                alert('Your cart is empty');
            }
            return;
        }

        // Check if user is logged in
        if (!Auth.isLoggedIn()) {
            // Save return URL
            sessionStorage.setItem('returnUrl', 'checkout.html');
            
            // Show message
            if (window.errorHandler) {
                window.errorHandler.showError('Please login to continue');
            }
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return;
        }

        // Proceed to checkout
        window.location.href = 'checkout.html';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initCheckoutButton();
});