/* ===================================
   AMZIRA - Main JavaScript
   Core functionality
   =================================== */

// Product Data
const sampleProducts = [
    {
        id: 'AMZ-KJ-001',
        name: 'Royal Burgundy Kurta Jacket Set',
        category: 'Kurta Jacket',
        price: 8999,
        salePrice: 6299,
        discount: 30,
        image_front: 'images/products/product-1-front.jpg',
        image_back: 'images/products/product-1-back.jpg',
        badge: 'Bestseller',
        rating: 4.5,
        reviews: 234
    },
    {
        id: 'AMZ-SH-002',
        name: 'Golden Embroidered Sherwani',
        category: 'Sherwani',
        price: 15999,
        salePrice: 12799,
        discount: 20,
        image_front: 'images/products/product-2-front.jpg',
        image_back: 'images/products/product-2-back.jpg',
        badge: 'New',
        rating: 4.8,
        reviews: 189
    },
    {
        id: 'AMZ-KP-003',
        name: 'Classic Navy Kurta Pajama',
        category: 'Kurta Pajama',
        price: 4999,
        salePrice: 3499,
        discount: 30,
        image_front: 'images/products/product-3-front.jpg',
        image_back: 'images/products/product-3-back.jpg',
        badge: 'Sale',
        rating: 4.3,
        reviews: 156
    },
    {
        id: 'AMZ-IW-004',
        name: 'Maroon Indo Western',
        category: 'Indo Western',
        price: 10999,
        salePrice: 8799,
        discount: 20,
        image_front: 'images/products/product-4-front.jpg',
        image_back: 'images/products/product-4-back.jpg',
        badge: 'Bestseller',
        rating: 4.6,
        reviews: 203
    },
    {
        id: 'AMZ-KJ-005',
        name: 'Emerald Green Kurta Set',
        category: 'Kurta Jacket',
        price: 7999,
        salePrice: 5599,
        discount: 30,
        image_front: 'images/products/product-5-front.jpg',
        image_back: 'images/products/product-5-back.jpg',
        badge: 'New',
        rating: 4.4,
        reviews: 142
    },
    {
        id: 'AMZ-SH-006',
        name: 'Ivory Wedding Sherwani',
        category: 'Sherwani',
        price: 18999,
        salePrice: 15199,
        discount: 20,
        image_front: 'images/products/product-6-front.jpg',
        image_back: 'images/products/product-6-back.jpg',
        badge: 'Bestseller',
        rating: 4.9,
        reviews: 287
    },
    {
        id: 'AMZ-KP-007',
        name: 'Beige Silk Kurta Pajama',
        category: 'Kurta Pajama',
        price: 5999,
        salePrice: 4199,
        discount: 30,
        image_front: 'images/products/product-7-front.jpg',
        image_back: 'images/products/product-7-back.jpg',
        rating: 4.2,
        reviews: 98
    },
    {
        id: 'AMZ-IW-008',
        name: 'Black Designer Indo Western',
        category: 'Indo Western',
        price: 12999,
        salePrice: 10399,
        discount: 20,
        image_front: 'images/products/product-8-front.jpg',
        image_back: 'images/products/product-8-back.jpg',
        badge: 'New',
        rating: 4.7,
        reviews: 176
    }
];

// Create Product Card HTML
function createProductCard(product) {
    const discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img class="front-image" src="${product.image_front}" alt="${product.name}">
                <img class="back-image" src="${product.image_back}" alt="${product.name}">
                ${product.badge ? `<span class="product-badge ${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn wishlist-btn" data-id="${product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="product-action-btn quick-view-btn" data-id="${product.id}">
                        <i class="far fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-name">${product.name}</h3>
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
                <button class="btn btn-primary btn-block add-to-cart-btn" data-id="${product.id}">
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
    try {
        const response = await fetch('data/products.json');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.products || [];

    } catch (error) {
        console.error('Failed to fetch products:', error);

        // Show warning to user
        console.warn('⚠️ Running without local server? Products may not load.');
        console.warn('💡 Solution: Use "python -m http.server" or "npx serve"');

        // Return sample products as fallback
        return sampleProducts;
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
    const product = sampleProducts.find(p => p.id === productId);
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
            const response = await fetch('data/products.json');
            const data = await response.json();
            const products = data.products.filter(p => viewedIds.includes(p.id));
            
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
