/* ===================================
   AMZIRA - Main JavaScript
   Core functionality
   =================================== */

/**
 * Escape unsafe HTML characters for dynamic content rendering.
 * @param {any} value
 * @returns {string}
 */
function esc(value) {
    if (window.AMZIRA?.utils?.escapeHtml) return window.AMZIRA.utils.escapeHtml(value);
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

// Create Product Card HTML
function createProductCard(product) {
    const discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img class="front-image" src="${esc(product.image_front)}" alt="${esc(product.name)}">
                <img class="back-image" src="${esc(product.image_back)}" alt="${esc(product.name)}">
                ${product.badge ? `<span class="product-badge ${esc(product.badge.toLowerCase())}">${esc(product.badge)}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn wishlist-btn" data-id="${esc(product.id)}">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="product-action-btn quick-view-btn" data-id="${esc(product.id)}">
                        <i class="far fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${esc(product.category)}</p>
                <h3 class="product-name">${esc(product.name)}</h3>
                <div class="product-price">
                    <span class="price-current">$${product.salePrice}</span>
                    <span class="price-original">$${product.price}</span>
                    ${discountPercent > 0 ? `<span class="price-discount">${discountPercent}% OFF</span>` : ''}
                </div>
                ${product.rating ? `
                <div class="product-rating">
                    <span class="stars">
                        ${generateStars(product.rating)}
                    </span>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                ` : ''}
                <button class="btn btn-primary btn-block add-to-cart-btn" data-id="${esc(product.id)}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Generate Star Rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Load Products into Container
function loadProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="swiper-slide">
            ${createProductCard(product)}
        </div>
    `).join('');
    
    // Attach event listeners
    attachProductEventListeners(container);
}

// Safe fetch wrapper with better error handling
async function safeFetchProducts() {
    const cacheKey = 'amziraProductsCacheV1';
    const cacheTtlMs = 5 * 60 * 1000;

    try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached?.timestamp && Array.isArray(cached?.products) && (Date.now() - cached.timestamp) < cacheTtlMs) {
                return cached.products;
            }
        }

        await ensureApiLayer();

        if (!window.AMZIRA?.products?.getProducts) {
            throw new Error('API client is unavailable');
        }

        const data = await window.AMZIRA.products.getProducts({ limit: 1000 });
        const products = data?.products || data?.results || (Array.isArray(data) ? data : []);

        sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            products
        }));
        return products;

    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

// Attach Event Listeners to Product Cards
function attachProductEventListeners(container) {
    // Add to Cart
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
    
    // Wishlist
    container.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            toggleWishlist(productId, this);
        });
    });
    
    // Quick View
    container.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            showQuickView(productId);
        });
    });
}

// Add to Cart Function
async function addToCart(productId) {
    const products = Array.isArray(window.allProducts) ? window.allProducts : [];
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;

    // Delegate to the unified cart manager so logged-in users always hit backend /cart/items.
    if (window.cart && typeof window.cart.addItem === 'function') {
        const added = await window.cart.addItem(product.id, 1);
        if (added) {
            updateCartCount();
        }
        return;
    }

    showNotification('Cart service is unavailable right now. Please refresh and try again.', 'error');
}

// Toggle Wishlist
function toggleWishlist(productId, buttonElement) {
    let wishlist = JSON.parse(localStorage.getItem('amziraWishlist') || '[]');
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        buttonElement.innerHTML = '<i class="far fa-heart"></i>';
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        buttonElement.innerHTML = '<i class="fas fa-heart"></i>';
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('amziraWishlist', JSON.stringify(wishlist));
}

// Update Cart Count Badge
function updateCartCount() {
    const totalItems = (window.cart && typeof window.cart.getItemCount === 'function')
        ? window.cart.getItemCount()
        : 0;

    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Prefer centralized loading manager if available (consistent escaping)
    if (window.loadingManager && typeof window.loadingManager.showNotification === 'function') {
        return window.loadingManager.showNotification(message, type);
    }

    // Fallback: safe textContent notification
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
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: var(--z-notification, 10000);
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

// Quick View Modal (placeholder)
function showQuickView(productId) {
    showNotification('Quick view coming soon!', 'info');
}

// Newsletter Form Handler
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        if (email) {
            showNotification('Thank you for subscribing!', 'success');
            this.reset();
        }
    });
}

// Sticky Header on Scroll
function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Initialize on DOM Ready
class AppInitializer {
    static async init() {
        // Load products with safe fetch
        const products = await safeFetchProducts();

        loadProducts('mostLovedProducts', products);
        loadProducts('bestsellersProducts', products);

        // Store globally for other scripts
        window.allProducts = products;

        // Initialize functions
        updateCartCount();
        initNewsletterForm();
        initStickyHeader();

        // Signal readiness
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('appReady', { detail: { products } }));
        }

        console.log('✅ Amzira website initialized successfully!');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppInitializer.init());
} else {
    AppInitializer.init();
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


/* Recently Viewed Products Tracker */

const RecentlyViewed = {
    maxItems: 12,
    storageKey: 'amziraRecentlyViewed',
    
    // Add product to recently viewed
    add(productId) {
        let viewed = this.get();
        
        // Remove if already exists (to move to front)
        viewed = viewed.filter(id => id !== productId);
        
        // Add to beginning
        viewed.unshift(productId);
        
        // Keep only maxItems
        if (viewed.length > this.maxItems) {
            viewed = viewed.slice(0, this.maxItems);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(viewed));
    },
    
    // Get recently viewed products
    get() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    },
    
    // Clear recently viewed
    clear() {
        localStorage.removeItem(this.storageKey);
    },
    
    // Render recently viewed section
    async render(containerId, limit = 8) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const viewedIds = this.get().slice(0, limit);
        if (viewedIds.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        try {
            const productsData = await safeFetchProducts();
            const products = productsData.filter((p) => viewedIds.includes(p.id));
            
            // Sort by recently viewed order
            products.sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id));
            
            container.innerHTML = products.map(product => createProductCard(product)).join('');
            container.parentElement.style.display = 'block';
            
            attachProductEventListeners(container);
        } catch (error) {
            console.error('Error rendering recently viewed:', error);
        }
    }
};

// Track product view on PDP
if (window.location.pathname.includes('product-detail.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        RecentlyViewed.add(productId);
    }
}

// Export
window.RecentlyViewed = RecentlyViewed;
