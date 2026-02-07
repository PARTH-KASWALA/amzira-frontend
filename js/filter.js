/* ===================================
   PRODUCT FILTERING & SORTING
   For category pages
   =================================== */

class ProductFilter {
    constructor(products) {
        this.allProducts = products;
        this.filteredProducts = [...products];
        this.activeFilters = {
            categories: [],
            colors: [],
            sizes: [],
            occasions: [],
            fabrics: [],
            priceRange: { min: 0, max: 50000 }
        };
        this.sortBy = 'featured';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this._listeners = [];
        
        // Parse URL parameters and apply filters
        this.parseURLFilters();

        this.init();
    }

    // Helper to add event listeners and track them for cleanup
    _addListener(element, event, handler, options) {
        if (!element) return;
        element.addEventListener(event, handler, options || false);
        this._listeners.push({ element, event, handler, options });
    }

    _esc(value) {
        if (window.AMZIRA?.utils?.escapeHtml) return window.AMZIRA.utils.escapeHtml(value);
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    // Parse common URL parameters and seed activeFilters accordingly
    parseURLFilters() {
        try {
            const urlParams = new URLSearchParams(window.location.search);

            // Category filter
            const cat = urlParams.get('cat');
            if (cat) {
                this.activeFilters.categories.push(cat);
            }

            // Occasion filter
            const occasion = urlParams.get('occasion');
            if (occasion) {
                const capitalizedOccasion = occasion.charAt(0).toUpperCase() + occasion.slice(1);
                this.activeFilters.occasions.push(capitalizedOccasion);
            }

            // Fabric filter
            const fabric = urlParams.get('fabric');
            if (fabric) {
                const capitalizedFabric = fabric.charAt(0).toUpperCase() + fabric.slice(1);
                this.activeFilters.fabrics.push(capitalizedFabric);
            }

            // Collection filter (map to categories for now)
            const collection = urlParams.get('collection');
            if (collection) {
                this.activeFilters.categories.push(collection);
            }

            // Style filter
            const style = urlParams.get('style');
            if (style) {
                this.activeFilters.categories.push(style);
            }

            // Pre-check the filter checkboxes based on URL params
            setTimeout(() => this.updateCheckboxesFromFilters(), 100);
        } catch (e) {
            // If URL parsing fails (e.g., non-browser env), ignore silently
            console.warn('parseURLFilters skipped:', e);
        }
    }

    updateCheckboxesFromFilters() {
        // Check category checkboxes
        this.activeFilters.categories.forEach(cat => {
            const checkbox = document.querySelector(`input[data-filter-type="categories"][value="${cat}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // Check occasion checkboxes
        this.activeFilters.occasions.forEach(occ => {
            const checkbox = document.querySelector(`input[data-filter-type="occasions"][value="${occ}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // Check fabric checkboxes
        this.activeFilters.fabrics.forEach(fab => {
            const checkbox = document.querySelector(`input[data-filter-type="fabrics"][value="${fab}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    init() {
        this.setupEventListeners();
        this.renderFilters();
        this.applyFilters();
    }
    
    setupEventListeners() {
        // Category checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            this._addListener(checkbox, 'change', (e) => {
                const filterType = e.target.getAttribute('data-filter-type');
                const filterValue = e.target.value;
                
                if (e.target.checked) {
                    this.addFilter(filterType, filterValue);
                } else {
                    this.removeFilter(filterType, filterValue);
                }
            });
        });
        
        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            this._addListener(sortSelect, 'change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        // Clear filters button
        const clearBtn = document.querySelector('.clear-filters');
        if (clearBtn) {
            this._addListener(clearBtn, 'click', () => this.clearAllFilters());
        }
        
        // Price range (if implemented)
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (priceMin && priceMax) {
            [priceMin, priceMax].forEach(input => {
                this._addListener(input, 'change', () => {
                    this.activeFilters.priceRange = {
                        min: parseInt(priceMin.value) || 0,
                        max: parseInt(priceMax.value) || 50000
                    };
                    this.applyFilters();
                });
            });
        }
        
        // Color filter
        document.querySelectorAll('.color-option').forEach(colorBtn => {
            this._addListener(colorBtn, 'click', (e) => {
                const color = e.currentTarget.getAttribute('data-color');
                
                // Toggle selected state
                if (e.currentTarget.classList.contains('selected')) {
                    e.currentTarget.classList.remove('selected');
                    this.removeFilter('colors', color);
                } else {
                    e.currentTarget.classList.add('selected');
                    this.addFilter('colors', color);
                }
            });
        });
    }

    // Remove all tracked listeners (cleanup)
    destroy() {
        this._listeners.forEach(({ element, event, handler, options }) => {
            try {
                element.removeEventListener(event, handler, options || false);
            } catch (e) {
                // ignore
            }
        });
        this._listeners = [];
    }
    
    addFilter(type, value) {
        if (!this.activeFilters[type].includes(value)) {
            this.activeFilters[type].push(value);
            this.applyFilters();
            this.renderActiveFilters();
        }
    }
    
    removeFilter(type, value) {
        const index = this.activeFilters[type].indexOf(value);
        if (index > -1) {
            this.activeFilters[type].splice(index, 1);
            this.applyFilters();
            this.renderActiveFilters();
        }
    }
    
    clearAllFilters() {
        this.activeFilters = {
            categories: [],
            colors: [],
            sizes: [],
            occasions: [],
            priceRange: { min: 0, max: 50000 }
        };
        
        // Uncheck all checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        this.applyFilters();
        this.renderActiveFilters();
    }
    
    applyFilters() {
        // Start with all products
        let filtered = [...this.allProducts];
        
        // Filter by categories
        if (this.activeFilters.categories.length > 0) {
            filtered = filtered.filter(product => 
                this.activeFilters.categories.includes(product.subcategory)
            );
        }
        
        // Filter by colors
        if (this.activeFilters.colors.length > 0) {
            filtered = filtered.filter(product => 
                product.colors && product.colors.some(color => 
                    this.activeFilters.colors.includes(color.name.toLowerCase())
                )
            );
        }
        
        // Filter by sizes
        if (this.activeFilters.sizes.length > 0) {
            filtered = filtered.filter(product => 
                product.sizes && product.sizes.some(size => 
                    this.activeFilters.sizes.includes(size)
                )
            );
        }
        
        // Filter by occasions
        if (this.activeFilters.occasions.length > 0) {
            filtered = filtered.filter(product => 
                product.occasions && product.occasions.some(occasion => 
                    this.activeFilters.occasions.includes(occasion)
                )
            );
        }
        
        // Filter by fabrics
        if (this.activeFilters.fabrics.length > 0) {
            filtered = filtered.filter(product => 
                product.fabric && this.activeFilters.fabrics.includes(product.fabric)
            );
        }
        
        // Filter by price range
        filtered = filtered.filter(product => {
            const price = product.salePrice || product.price;
            return price >= this.activeFilters.priceRange.min && 
                   price <= this.activeFilters.priceRange.max;
        });
        
        // Sort products
        this.sortProducts(filtered);
        
        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductCount();
    }
    
    sortProducts(products) {
        switch (this.sortBy) {
            case 'price-low-high':
                products.sort((a, b) => 
                    (a.salePrice || a.price) - (b.salePrice || b.price)
                );
                break;
            
            case 'price-high-low':
                products.sort((a, b) => 
                    (b.salePrice || b.price) - (a.salePrice || a.price)
                );
                break;
            
            case 'newest':
                // Assuming newer products have higher IDs
                products.sort((a, b) => b.id.localeCompare(a.id));
                break;
            
            case 'rating':
                products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            
            case 'featured':
            default:
                // Keep original order or sort by badge
                products.sort((a, b) => {
                    const badgeOrder = { 'Bestseller': 1, 'New': 2, 'Sale': 3 };
                    return (badgeOrder[a.badge] || 99) - (badgeOrder[b.badge] || 99);
                });
                break;
        }
    }
    
    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        if (paginatedProducts.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }
        
        container.innerHTML = paginatedProducts.map(product => 
            this.createProductCardHTML(product)
        ).join('');
        
        // Attach event listeners to new product cards
        this.attachProductEventListeners();
        
        // Attach quick add listeners
        if (window.quickAdd && typeof window.quickAdd.attachQuickAddListeners === 'function') {
            setTimeout(() => window.quickAdd.attachQuickAddListeners(), 100);
        }
        
        // Render pagination
        this.renderPagination();
    }
    
    createProductCardHTML(product) {
        const discountPercent = Math.round(
            ((product.price - (product.salePrice || product.price)) / product.price) * 100
        );
        
        const stockStatus = this.getStockStatus(product);
        
        return `
            <div class="product-card" data-id="${this._esc(product.id)}">
                <div class="product-image">
                    <img src="${this._esc(product.images ? product.images[0] : product.image)}" 
                         alt="${this._esc(product.name)}"
                         loading="lazy">
                    ${product.badge ? 
                        `<span class="product-badge ${this._esc(product.badge.toLowerCase())}">${this._esc(product.badge)}</span>` 
                        : ''}
                    ${stockStatus.html}
                    <div class="product-actions">
                        <button class="product-action-btn wishlist-btn" data-id="${this._esc(product.id)}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="product-action-btn quick-view-btn" data-id="${this._esc(product.id)}">
                            <i class="far fa-eye"></i>
                        </button>
                        <button class="product-action-btn quick-add-btn" data-id="${this._esc(product.id)}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <p class="product-category">${this._esc(product.subcategory)}</p>
                    <h3 class="product-name">${this._esc(product.name)}</h3>
                    ${this.getSizeAvailabilityHTML(product)}
                    <div class="product-price">
                        <span class="price-current">$${product.salePrice || product.price}</span>
                        ${product.salePrice ? `<span class="price-original">$${product.price}</span>` : ''}
                        ${discountPercent > 0 ? `<span class="price-discount">${discountPercent}% OFF</span>` : ''}
                    </div>
                    ${product.rating ? `
                        <div class="product-rating">
                            <span class="stars">${this.generateStars(product.rating)}</span>
                            <span class="rating-count">(${product.reviews || 0})</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    getStockStatus(product) {
        if (!product.stockBySizes) {
            return { status: 'in-stock', html: '' };
        }
        
        const totalStock = Object.values(product.stockBySizes)
            .reduce((sum, qty) => sum + qty, 0);
        
        if (totalStock === 0) {
            return {
                status: 'out-of-stock',
                html: '<span class="stock-badge out-of-stock">Out of Stock</span>'
            };
        } else if (totalStock <= 5) {
            return {
                status: 'low-stock',
                html: '<span class="stock-badge low-stock">Only Few Left</span>'
            };
        } else {
            return {
                status: 'in-stock',
                html: '<span class="stock-badge in-stock">In Stock</span>'
            };
        }
    }
    
    getSizeAvailabilityHTML(product) {
        if (!product.sizes || !product.stockBySizes) {
            return '';
        }
        
        const availableSizes = product.sizes.filter(size =>
            product.stockBySizes[size] && product.stockBySizes[size] > 0
        );
        
        if (availableSizes.length === 0) {
            return '<div class="size-availability none">No sizes available</div>';
        }
        
        return `
            <div class="size-availability">
                <span class="size-label">Available in:</span>
                ${availableSizes.map(size =>
                    `<span class="size-chip ${product.stockBySizes[size] <= 2 ? 'low-stock' : ''}">${this._esc(size)}</span>`
                ).join('')}
            </div>
        `;
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let html = '';
        
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            html += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="far fa-star"></i>';
        }
        
        return html;
    }
    
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters to find what you're looking for.</p>
                <button class="btn btn-primary clear-filters">Clear All Filters</button>
            </div>
        `;
    }
    
    renderActiveFilters() {
        const container = document.getElementById('activeFilters');
        if (!container) return;
        
        const filters = [];
        
        // Add all active filters
        Object.keys(this.activeFilters).forEach(type => {
            if (Array.isArray(this.activeFilters[type])) {
                this.activeFilters[type].forEach(value => {
                    filters.push({ type, value });
                });
            }
        });
        
        if (filters.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        container.innerHTML = filters.map(filter => `
            <span class="filter-tag">
                ${filter.value}
                <button onclick="productFilter.removeFilter('${filter.type}', '${filter.value}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('') + `
            <button class="filter-tag clear-all" onclick="productFilter.clearAllFilters()">
                Clear All
            </button>
        `;
    }
    
    updateProductCount() {
        const countElement = document.querySelector('.products-count');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} Products`;
        }
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = `
            <button class="pagination-btn" 
                    onclick="productFilter.goToPage(${this.currentPage - 1})"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}"
                            onclick="productFilter.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        html += `
            <button class="pagination-btn"
                    onclick="productFilter.goToPage(${this.currentPage + 1})"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        container.innerHTML = html;
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    renderFilters() {
        // This would generate the filter sidebar HTML
        // For now, assuming it's in the HTML already
    }
    
    attachProductEventListeners() {
        // Product card clicks
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const id = card.getAttribute('data-id');
                    window.location.href = `product-detail.html?id=${id}`;
                }
            });
        });
        
        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.toggleWishlist(id, btn);
            });
        });
    }
    
    toggleWishlist(productId, button) {
        let wishlist = JSON.parse(localStorage.getItem('amziraWishlist') || '[]');
        const index = wishlist.indexOf(productId);
        
        if (index > -1) {
            wishlist.splice(index, 1);
            button.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            wishlist.push(productId);
            button.innerHTML = '<i class="fas fa-heart"></i>';
        }
        
        localStorage.setItem('amziraWishlist', JSON.stringify(wishlist));
    }
}

// Initialize filter when page loads and dependencies ready
document.addEventListener('DOMContentLoaded', function() {
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

    // Function to initialize filter
    async function initFilter() {
        const cacheKey = 'amziraProductsCacheV1';
        const cacheTtlMs = 5 * 60 * 1000;

        try {
            await ensureApiLayer();
            let products = [];
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                if (cached?.timestamp && Array.isArray(cached?.products) && (Date.now() - cached.timestamp) < cacheTtlMs) {
                    products = cached.products;
                }
            }

            if (!products.length) {
                if (!window.AMZIRA?.products?.getProducts) {
                    throw new Error('API client unavailable');
                }
                const data = await window.AMZIRA.products.getProducts({ limit: 1000 });
                products = data?.products || data?.results || (Array.isArray(data) ? data : []);
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    products
                }));
            }

            window.productFilter = new ProductFilter(products);
        } catch (error) {
            console.error('Error loading products:', error);
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #EF4444; margin-bottom: 16px;"></i>
                        <h3>Unable to Load Products</h3>
                        <p style="color: #666; margin-bottom: 20px;">Please refresh and try again.</p>
                    </div>
                `;
            }
        }
    }

    // Wait for cart if it hasn't loaded yet
    if (window.cart) {
        initFilter();
    } else {
        window.addEventListener('cartReady', initFilter, { once: true });
        // Fallback timeout
        setTimeout(() => {
            if (!window.productFilter) {
                console.warn('Cart not ready, initializing filter anyway');
                initFilter();
            }
        }, 2000);
    }
});

/* ==================================================
   Mobile Filter Drawer Manager
   Activates only on screens <= 1024px
   ==================================================
*/
class MobileFilterManager {
    constructor() {
        this.init();
    }
    
    init() {
        if (window.innerWidth > 1024) return;
        if (document.querySelector('.mobile-filter-trigger')) return; // already initialized
        this.createMobileFilterUI();
        this.attachEventListeners();
    }
    
    createMobileFilterUI() {
        const sidebar = document.querySelector('.filter-sidebar');
        if (!sidebar) return;
        
        // Add header to sidebar
        const header = document.createElement('div');
        header.className = 'filter-drawer-header';
        header.innerHTML = `
            <h3>Filters</h3>
            <button class="filter-close-btn" aria-label="Close filters">
                <i class="fas fa-times"></i>
            </button>
        `;
        sidebar.insertBefore(header, sidebar.firstChild);
        
        // Add action buttons to sidebar
        const actions = document.createElement('div');
        actions.className = 'filter-actions filter-actions-mobile';
        actions.innerHTML = `
            <button class="btn btn-secondary clear-all-filters">Clear All</button>
            <button class="btn btn-primary apply-filters">Apply Filters</button>
        `;
        sidebar.appendChild(actions);
        
        // Create overlay
        if (!document.querySelector('.filter-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'filter-overlay';
            document.body.appendChild(overlay);
        }
        
        // Create mobile trigger buttons
        const productsMain = document.querySelector('.products-main');
        if (!productsMain) return;
        
        const trigger = document.createElement('div');
        trigger.className = 'mobile-filter-trigger';
        trigger.innerHTML = `
            <button class="mobile-filter-btn">
                <i class="fas fa-filter"></i>
                <span>Filters</span>
            </button>
            <button class="mobile-sort-btn">
                <i class="fas fa-sort"></i>
                <span>Sort</span>
            </button>
        `;
        productsMain.insertBefore(trigger, productsMain.firstChild);
    }
    
    attachEventListeners() {
        const sidebar = document.querySelector('.filter-sidebar');
        const overlay = document.querySelector('.filter-overlay');
        const openBtn = document.querySelector('.mobile-filter-btn');
        const closeBtn = document.querySelector('.filter-close-btn');
        const applyBtn = document.querySelector('.apply-filters');
        const clearAllBtn = document.querySelector('.clear-all-filters');
        
        if (!sidebar || !overlay) return;
        
        // Open drawer
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openDrawer());
        }
        
        // Close drawer
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDrawer());
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => this.closeDrawer());
        }
        
        // Apply filters
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.closeDrawer();
                if (window.productFilter) {
                    window.productFilter.applyFilters();
                }
            });
        }
        
        // Clear all
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                if (window.productFilter) {
                    window.productFilter.clearAllFilters();
                }
            });
        }
        
        // Sort button
        const sortBtn = document.querySelector('.mobile-sort-btn');
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.showSortModal());
        }
    }
    
    openDrawer() {
        const sidebar = document.querySelector('.filter-sidebar');
        const overlay = document.querySelector('.filter-overlay');
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeDrawer() {
        const sidebar = document.querySelector('.filter-sidebar');
        const overlay = document.querySelector('.filter-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    showSortModal() {
        const sortSelect = document.getElementById('sortSelect');
        if (!sortSelect) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'sort-modal';
        modal.innerHTML = `
            <div class="sort-modal-overlay"></div>
            <div class="sort-modal-content">
                <h3>Sort By</h3>
                <div class="sort-options">
                    <button class="sort-option" data-value="featured">Featured</button>
                    <button class="sort-option" data-value="price-low-high">Price: Low to High</button>
                    <button class="sort-option" data-value="price-high-low">Price: High to Low</button>
                    <button class="sort-option" data-value="newest">Newest First</button>
                    <button class="sort-option" data-value="rating">Highest Rated</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Handle selection
        modal.querySelectorAll('.sort-option').forEach(btn => {
            if (btn.dataset.value === sortSelect.value) {
                btn.classList.add('selected');
            }
            
            btn.addEventListener('click', () => {
                sortSelect.value = btn.dataset.value;
                sortSelect.dispatchEvent(new Event('change'));
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            });
        });
        
        // Close on overlay click
        modal.querySelector('.sort-modal-overlay').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
    }
}

// Initialize on mobile
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 1024) {
        new MobileFilterManager();
    }
});

// Re-initialize on resize
let resizeTimerMobile;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimerMobile);
    resizeTimerMobile = setTimeout(() => {
        if (window.innerWidth <= 1024 && !document.querySelector('.mobile-filter-trigger')) {
            new MobileFilterManager();
        }
    }, 250);
});
