/* ===================================
   PRODUCT FILTERING & SORTING
   For category pages
   =================================== */

class ProductFilter {
    constructor(products, options = {}) {
        this.allProducts = products;
        this.filteredProducts = [...products];
        this.categorySlug = String(options.categorySlug || '').toLowerCase();
        this.isComingSoon = Boolean(options.isComingSoon);
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
        this.itemsPerPage = 24;
        this._listeners = [];
        this.renderTimeout = null;
        
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
                this.activeFilters.categories.push(cat.toLowerCase());
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
                this.activeFilters.categories.push(collection.toLowerCase());
            }

            // Style filter
            const style = urlParams.get('style');
            if (style) {
                this.activeFilters.categories.push(style.toLowerCase());
            }

            const page = Number(urlParams.get('page'));
            if (Number.isInteger(page) && page > 0) {
                this.currentPage = page;
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
        this.applyFilters({ resetPage: false });
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
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
            this.renderTimeout = null;
        }
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
            fabrics: [],
            priceRange: { min: 0, max: 50000 }
        };
        
        // Uncheck all checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        this.applyFilters();
        this.renderActiveFilters();
    }
    
    applyFilters(options = {}) {
        const { resetPage = true } = options;
        if (resetPage) {
            this.currentPage = 1;
            this.updatePageParam(1, true);
        }
        // Start with all products
        let filtered = [...this.allProducts];
        
        // Filter by categories
        if (this.activeFilters.categories.length > 0) {
            filtered = filtered.filter(product => {
                const normalized = this.normalizeForDisplay(product);
                const categoryValue = String(
                    product.subcategory ||
                    normalized?.category ||
                    product?.category?.name ||
                    product?.category ||
                    ''
                ).toLowerCase();
                return this.activeFilters.categories.includes(categoryValue);
            });
        }
        
        // Filter by colors
        if (this.activeFilters.colors.length > 0) {
            filtered = filtered.filter(product => {
                const normalized = this.normalizeForDisplay(product);
                const colors = Array.isArray(normalized?.colors) && normalized.colors.length
                    ? normalized.colors
                    : (Array.isArray(product.colors) ? product.colors : []);
                if (!colors.length && product.color) {
                    return this.activeFilters.colors.includes(String(product.color).toLowerCase());
                }
                return colors.some(color => {
                    const name = String(color?.name || color || '').toLowerCase();
                    return this.activeFilters.colors.includes(name);
                });
            });
        }
        
        // Filter by sizes
        if (this.activeFilters.sizes.length > 0) {
            filtered = filtered.filter(product => {
                const normalized = this.normalizeForDisplay(product);
                const sizes = Array.isArray(normalized?.sizes) && normalized.sizes.length
                    ? normalized.sizes
                    : (Array.isArray(product.sizes) ? product.sizes : []);
                return sizes.some(size => this.activeFilters.sizes.includes(size));
            });
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
            const normalized = this.normalizeForDisplay(product);
            const price = Number(
                normalized?.price ??
                normalized?.sale_price ??
                normalized?.salePrice ??
                normalized?.price ??
                0
            );
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
                    (this.normalizeForDisplay(a)?.price ?? a.salePrice ?? a.price ?? 0) -
                    (this.normalizeForDisplay(b)?.price ?? b.salePrice ?? b.price ?? 0)
                );
                break;
            
            case 'price-high-low':
                products.sort((a, b) => 
                    (this.normalizeForDisplay(b)?.price ?? b.salePrice ?? b.price ?? 0) -
                    (this.normalizeForDisplay(a)?.price ?? a.salePrice ?? a.price ?? 0)
                );
                break;
            
            case 'newest':
                // Assuming newer products have higher IDs
                products.sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')));
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

        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }

        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:48px 20px;">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </div>
        `;

        this.renderTimeout = setTimeout(() => {
            if (container.querySelector('.spinner')) {
                container.innerHTML = `
                    <div class="error-state" style="grid-column:1/-1; text-align:center; padding:60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size:48px; color:var(--text-light); margin-bottom:16px;"></i>
                        <h3 style="margin-bottom:12px;">Unable to Load Products</h3>
                        <p style="color:var(--text-gray); margin-bottom:24px;">Please check your connection and try again.</p>
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
            }
        }, 10000);

        setTimeout(() => {
            container.innerHTML = paginatedProducts.map(product =>
                this.createProductCardHTML(product)
            ).join('');

            if (this.renderTimeout) {
                clearTimeout(this.renderTimeout);
                this.renderTimeout = null;
            }

            // Attach event listeners to new product cards
            this.attachProductEventListeners();

            // Attach quick add listeners
            if (window.quickAdd && typeof window.quickAdd.attachQuickAddListeners === 'function') {
                setTimeout(() => window.quickAdd.attachQuickAddListeners(), 100);
            }

            // Render pagination
            this.renderPagination();
        }, 50);
    }

    getFilterCount(filterType, filterValue) {
        const target = String(filterValue || '').toLowerCase();
        return this.allProducts.filter(product => {
            switch (filterType) {
                case 'categories': {
                    const category = String(product?.category?.slug || product?.category || '').toLowerCase();
                    const subcategory = String(product?.subcategory || '').toLowerCase();
                    return category === target || subcategory === target;
                }
                case 'occasions': {
                    if (!Array.isArray(product?.occasions)) return false;
                    return product.occasions.some(occ => String(occ).toLowerCase() === target);
                }
                case 'fabrics': {
                    return String(product?.fabric || '').toLowerCase() === target;
                }
                case 'colors': {
                    if (!Array.isArray(product?.colors)) return false;
                    return product.colors.some(color => String(color).toLowerCase() === target);
                }
                default:
                    return false;
            }
        }).length;
    }

    normalizeForDisplay(product) {
        if (window.ProductNormalizer && typeof window.ProductNormalizer.normalize === 'function') {
            const normalized = window.ProductNormalizer.normalize(product);
            if (normalized) {
                return { ...product, ...normalized };
            }
        }
        return product;
    }
    
    createProductCardHTML(product) {
        const normalized = this.normalizeForDisplay(product);
        const basePrice = Number(normalized?.basePrice ?? normalized?.base_price ?? normalized?.price ?? 0);
        const salePrice = Number(normalized?.price ?? normalized?.sale_price ?? normalized?.salePrice ?? basePrice);
        const currentPrice = Number.isFinite(salePrice) && salePrice > 0 ? salePrice : basePrice;
        const originalPrice = Number.isFinite(basePrice) && basePrice >= currentPrice ? basePrice : currentPrice;
        const discountPercent = originalPrice > currentPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;
        const defaultVariantId = Number(
            product?.default_variant?.variant_id ??
            product?.default_variant?.id ??
            product?.default_variant_id ??
            product?.defaultVariantId
        );
        const hasDefaultVariant = Number.isInteger(defaultVariantId) && defaultVariantId > 0;
        const listingAddToCartDisabled = product?.listing_add_to_cart_enabled === false;
        const categoryLabel = normalized?.category || product?.category?.name || product?.subcategory || product?.category || '';
        const rawSlug = product?.slug || product?.handle || product?.url_slug || product?.seo_slug || product?.permalink || '';
        const safeSlug = typeof rawSlug === 'string' ? rawSlug.trim() : String(rawSlug || '').trim();
        const detailHref = safeSlug ? `product-detail.html?slug=${encodeURIComponent(safeSlug)}` : '#';
        const imageSrc = normalized?.mainImage || product?.primary_image || (product?.images ? product.images[0] : product.image) || 'images/products/product-1-front.jpg';
        
        const stockStatus = this.getStockStatus(product);
        
        return `
            <div class="product-card" data-id="${this._esc(product.id)}" data-slug="${this._esc(safeSlug)}">
                <div class="product-image">
                    <img src="${this._esc(imageSrc)}" 
                         alt="${this._esc(product.name)}"
                         loading="lazy"
                         onerror="this.onerror=null;this.src='images/products/product-1-front.jpg';">
                    ${normalized?.badge ? 
                        `<span class="product-badge ${this._esc(String(normalized.badge).toLowerCase())}">${this._esc(normalized.badge)}</span>` 
                        : ''}
                    ${stockStatus.html}
                    <div class="product-actions">
                        <button class="product-action-btn wishlist-btn" data-id="${this._esc(product.id)}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="product-action-btn quick-view-btn" data-id="${this._esc(product.id)}">
                            <i class="far fa-eye"></i>
                        </button>
                        ${
                            listingAddToCartDisabled
                                ? `<a class="product-action-btn" href="${detailHref}" aria-label="View Details"><i class="fas fa-arrow-right"></i></a>`
                                : `<button class="product-action-btn quick-add-btn ${hasDefaultVariant ? '' : 'disabled'}" data-id="${this._esc(product.id)}" ${hasDefaultVariant ? `data-variant-id="${this._esc(defaultVariantId)}"` : ''} ${hasDefaultVariant ? '' : 'disabled title="Please select size/color"'}>
                                    <i class="fas fa-cart-plus"></i>
                                   </button>`
                        }
                    </div>
                </div>
                <div class="product-info">
                    <p class="product-category">${this._esc(categoryLabel)}</p>
                    <h3 class="product-name">${this._esc(normalized?.name || product.name)}</h3>
                    ${this.getSizeAvailabilityHTML(product)}
                    <div class="product-price">
                        <span class="price-current">₹${Number(currentPrice).toLocaleString('en-IN')}</span>
                        ${originalPrice > currentPrice ? `<span class="price-original">₹${Number(originalPrice).toLocaleString('en-IN')}</span>` : ''}
                        ${discountPercent > 0 ? `<span class="price-discount">${discountPercent}% OFF</span>` : ''}
                    </div>
                    ${
                        listingAddToCartDisabled
                            ? '<a class="btn btn-secondary btn-block" href="' + detailHref + '">View Details</a>'
                            : (!hasDefaultVariant ? '<button class="btn btn-primary btn-block" disabled>Please select size/color</button>' : '')
                    }
                    ${normalized?.rating ? `
                        <div class="product-rating">
                            <span class="stars">${this.generateStars(normalized.rating)}</span>
                            <span class="rating-count">(${normalized.reviews || 0})</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    getStockStatus(product) {
        if (typeof product?.stock_quantity !== 'undefined') {
            const qty = Number(product.stock_quantity || 0);
            if (qty <= 0) {
                return { status: 'out-of-stock', html: '<span class="stock-badge out-of-stock">Out of Stock</span>' };
            }
            if (qty <= 5) {
                return { status: 'low-stock', html: '<span class="stock-badge low-stock">Only Few Left</span>' };
            }
            return { status: 'in-stock', html: '<span class="stock-badge in-stock">In Stock</span>' };
        }

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
        const categoryLinks = `
            <div class="empty-actions" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px;">
                <a class="btn btn-secondary" href="men.html">Men</a>
                <a class="btn btn-secondary" href="women.html">Women</a>
                <a class="btn btn-secondary" href="kids.html">Kids</a>
            </div>
        `;

        if (!this.allProducts.length || this.isComingSoon) {
            const label = this.categorySlug ? `${this.categorySlug.charAt(0).toUpperCase() + this.categorySlug.slice(1)} collection` : 'This category';
            return `
                <div class="no-results">
                    <i class="fas fa-store-slash"></i>
                    <h3>Coming Soon</h3>
                    <p>${this._esc(label)} is not available yet. Please check back soon.</p>
                    ${categoryLinks}
                </div>
            `;
        }

        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters to find what you're looking for.</p>
                <button class="btn btn-primary clear-filters" onclick="productFilter.clearAllFilters()">Clear All Filters</button>
                ${categoryLinks}
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
        // High-impact UX hardening (pre-launch)
        const headingHtml = '<span style="font-size:12px;color:var(--text-light);font-weight:600;align-self:center;">Active filters:</span>';
        container.innerHTML = filters.map(filter => `
            <span class="filter-tag">
                ${this._esc(filter.value)}
                <button onclick="productFilter.removeFilter(decodeURIComponent('${encodeURIComponent(filter.type)}'), decodeURIComponent('${encodeURIComponent(filter.value)}'))">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('') + `
            <button class="filter-tag clear-all" onclick="productFilter.clearAllFilters()" aria-label="Clear all filters">
                Clear filters
            </button>
        `;
        container.insertAdjacentHTML('afterbegin', headingHtml);
    }
    
    updateProductCount() {
        const countElement = document.querySelector('.products-count');
        if (countElement) {
            // High-impact UX hardening (pre-launch)
            const count = this.filteredProducts.length;
            const noun = count === 1 ? 'Product' : 'Products';
            countElement.textContent = `${count} ${noun}`;
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
        this.updatePageParam(page);
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updatePageParam(page, replace = false) {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('page', String(page));
            if (replace) {
                window.history.replaceState({}, '', url.toString());
            } else {
                window.history.pushState({}, '', url.toString());
            }
        } catch (e) {
            // Ignore URL update failures
        }
    }
    
    renderFilters() {
        document.querySelectorAll('.filter-option').forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (!checkbox) return;

            const filterType = checkbox.getAttribute('data-filter-type');
            const filterValue = checkbox.value;
            const count = this.getFilterCount(filterType, filterValue);

            const label = option.querySelector('span') || option.querySelector('label');
            if (!label) return;

            const existing = label.querySelector('.filter-count');
            if (existing) {
                existing.textContent = `(${count})`;
                return;
            }

            const countBadge = document.createElement('span');
            countBadge.className = 'filter-count';
            countBadge.textContent = `(${count})`;
            countBadge.style.cssText = 'color: var(--text-light); font-size: 12px; margin-left: 4px;';
            label.appendChild(countBadge);
        });
    }
    
    attachProductEventListeners() {
        // Product card clicks
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const slug = card.getAttribute('data-slug') || '';
                    if (!slug) {
                        console.warn('Product slug missing for PDP navigation.');
                        return;
                    }
                    window.location.href = `product-detail.html?slug=${encodeURIComponent(String(slug).trim())}`;
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
    // Audit Ref: [BLOCKER] Infinite Spinner on API Failure.
    const PRODUCTS_FETCH_TIMEOUT_MS = 10000;

    function getCurrentCategorySlug() {
        const pathname = (window.location?.pathname || '').toLowerCase();
        const fileName = pathname.split('/').pop() || '';
        if (fileName === 'men.html') return 'men';
        if (fileName === 'women.html') return 'women';
        if (fileName === 'kids.html') return 'kids';
        return '';
    }

    function toSafeNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : NaN;
    }

    function hasSellableVariant(product) {
        const defaultQty = toSafeNumber(product?.default_variant?.stock_quantity);
        if (Number.isFinite(defaultQty) && defaultQty > 0) return true;
        if (Array.isArray(product?.variants)) {
            return product.variants.some((variant) => toSafeNumber(variant?.stock_quantity) > 0);
        }
        const stockQty = toSafeNumber(product?.stock_quantity);
        return (Number.isFinite(stockQty) && stockQty > 0) || product?.in_stock === true;
    }

    function hasProductImage(product) {
        if (typeof product?.primary_image === 'string' && product.primary_image.trim()) return true;
        if (Array.isArray(product?.images) && product.images.length > 0) return true;
        return Boolean(product?.image || product?.image_front);
    }

    function isRenderableProduct(product) {
        if (!product || typeof product !== 'object') return false;
        const hasId = product?.id != null && String(product.id).trim() !== '';
        const hasName = typeof product?.name === 'string' && product.name.trim() !== '';
        const sale = toSafeNumber(product?.sale_price);
        const base = toSafeNumber(product?.base_price ?? product?.price);
        const hasPrice = (Number.isFinite(sale) && sale >= 0) || (Number.isFinite(base) && base >= 0);
        return Boolean(hasId && hasName && hasPrice && hasProductImage(product) && hasSellableVariant(product));
    }

    function getPageAudience() {
        const path = String(window.location?.pathname || '').toLowerCase();
        if (path.includes('women')) return 'women';
        if (path.includes('kids')) return 'kids';
        if (path.includes('men')) return 'men';
        return null;
    }

    function normalizeCategory(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/['"]/g, '')
            .replace(/[_\s]+/g, '-');
    }

    function buildCategoryAliases(categories) {
        const aliases = {};
        if (!Array.isArray(categories)) return aliases;

        const register = (raw, target) => {
            const key = normalizeCategory(raw);
            if (key) aliases[key] = target;
        };

        const hasChildren = categories.some((entry) => Array.isArray(entry?.children));
        if (hasChildren) {
            categories.forEach((l1) => {
                const l1Slug = normalizeCategory(l1?.slug || l1?.name || '');
                if (!l1Slug) return;
                register(l1?.slug, l1Slug);
                register(l1?.name, l1Slug);
                (l1?.children || []).forEach((l2) => {
                    register(l2?.slug, l1Slug);
                    register(l2?.name, l1Slug);
                    (l2?.children || []).forEach((l3) => {
                        register(l3?.slug, l1Slug);
                        register(l3?.name, l1Slug);
                    });
                });
            });
            return aliases;
        }

        const byId = new Map();
        categories.forEach((category) => {
            if (category?.id != null) byId.set(category.id, category);
        });

        categories.forEach((category) => {
            const slug = normalizeCategory(category?.slug || '');
            const name = normalizeCategory(category?.name || '');
            const parent = category?.parent_id ? byId.get(category.parent_id) : null;
            const parentSlug = normalizeCategory(parent?.slug || parent?.name || '');
            const target = parentSlug || slug;
            if (slug) aliases[slug] = target || slug;
            if (name) aliases[name] = target || name;
        });

        return aliases;
    }

    async function getCategoryAliases() {
        const cacheKey = 'amzira_category_aliases_v1';
        const cacheTtlMs = 10 * 60 * 1000;
        try {
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                if (cached?.timestamp && cached?.aliases && (Date.now() - cached.timestamp) < cacheTtlMs) {
                    return cached.aliases;
                }
            }
        } catch (_) {
            sessionStorage.removeItem(cacheKey);
        }

        try {
            if (!window.AMZIRA?.categories?.getCategories && !window.AMZIRA?.apiRequest) {
                return {};
            }
            const response = window.AMZIRA?.apiRequest
                ? await window.AMZIRA.apiRequest('/categories?include_children=true')
                : await window.AMZIRA.categories.getCategories();
            const list = response?.data
                || response?.categories
                || response?.results
                || (Array.isArray(response) ? response : []);
            const aliases = buildCategoryAliases(list);
            sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), aliases }));
            return aliases;
        } catch (_) {
            return {};
        }
    }

    function resolveCategorySlug(product, aliases) {
        const candidates = [
            product?.category?.slug,
            product?.category,
            product?.category?.name,
            product?.subcategory,
            product?.sub_category
        ].filter(Boolean);

        for (const candidate of candidates) {
            const normalized = normalizeCategory(candidate);
            if (!normalized) continue;
            if (aliases && aliases[normalized]) return aliases[normalized];
            return normalized;
        }
        return '';
    }

    function resolvePageAudience(rawAudience, aliases) {
        const normalized = normalizeCategory(rawAudience);
        if (aliases && aliases[normalized]) return aliases[normalized];
        return normalized;
    }

    function filterProductsForPage(products, pageAudience, aliases) {
        if (!pageAudience) return Array.isArray(products) ? products : [];
        return (Array.isArray(products) ? products : []).filter((product) => {
            const category = resolveCategorySlug(product, aliases);
            const productId = product?.id ?? product?._id ?? product?.product_id ?? '';

            console.log('Audience resolution', {
                productId,
                category,
                page: pageAudience
            });
            return category === pageAudience;
        });
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

    async function getProductsWithTimeout(params) {
        if (!window.AMZIRA?.products?.getProducts) {
            throw new Error('API client unavailable');
        }

        const timeoutPromise = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('Product request timed out')), PRODUCTS_FETCH_TIMEOUT_MS);
        });

        return Promise.race([
            window.AMZIRA.products.getProducts(params),
            timeoutPromise
        ]);
    }

    async function resolveProducts(params) {
        const attempts = [
            params,
            { category: params?.category, page: 1, limit: 20 },
            { category_slug: params?.category, page: 1, limit: 20 },
            { page: 1, limit: 20 }
        ];

        for (const attempt of attempts) {
            try {
                console.warn('Trying product fetch with:', attempt);
                return await getProductsWithTimeout(attempt);
            } catch (err) {
                if (err?.status !== 422) {
                    throw err;
                }
                console.warn('422 rejected params:', attempt, err?.payload || err);
            }
        }

        throw new Error('All product query strategies failed');
    }

    // Function to initialize filter
    async function initFilter() {
        const currentCategory = getCurrentCategorySlug() || 'all';
        const cacheKey = `amziraProductsCacheV1_${currentCategory}`;
        const cacheTtlMs = 5 * 60 * 1000;

        try {
            await ensureApiLayer();
            let products = [];
            const aliases = await getCategoryAliases();
            const effectiveCategory = (currentCategory && currentCategory !== 'all')
                ? (aliases[currentCategory] || currentCategory)
                : currentCategory;
            const pageAudience = resolvePageAudience(getPageAudience(), aliases);
            const shouldFetchAll = ['women', 'men', 'kids'].includes(pageAudience);
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                if (cached?.timestamp && Array.isArray(cached?.products) && (Date.now() - cached.timestamp) < cacheTtlMs) {
                    products = cached.products;
                }
            }

            if (!products.length) {
                const data = !shouldFetchAll && effectiveCategory
                    ? await resolveProducts({ category: effectiveCategory, limit: 100 })
                    : await resolveProducts({ limit: 100 });
                products = data?.products || data?.results || (Array.isArray(data) ? data : []);
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    products
                }));
            }

            const audience = pageAudience;
            const audienceFiltered = filterProductsForPage(products, audience, aliases);
            console.log('Filter result', {
                page: audience,
                total: products.length,
                visible: audienceFiltered.length,
                categories: (Array.isArray(products) ? products : []).map((p) => p?.category?.slug || p?.category || p?.category?.name || '')
            });
            const validProducts = Array.isArray(audienceFiltered) ? audienceFiltered.filter(isRenderableProduct) : [];
            const isComingSoon = validProducts.length === 0;
            window.productFilter = new ProductFilter(validProducts, {
                categorySlug: currentCategory,
                isComingSoon
            });
        } catch (error) {
            console.error('Error loading products:', error);
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #EF4444; margin-bottom: 16px;"></i>
                        <h3>Unable to Load Products</h3>
                        <p style="color: #666; margin-bottom: 14px;">The catalog is currently unavailable or timed out.</p>
                        <p style="color: #666; margin-bottom: 20px;">You can retry now or browse another category.</p>
                        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                            <a class="btn btn-secondary" href="men.html">Men</a>
                            <a class="btn btn-secondary" href="women.html">Women</a>
                            <a class="btn btn-secondary" href="kids.html">Kids</a>
                        </div>
                        <button class="btn btn-primary" id="retryProductsLoadBtn">
                            <i class="fas fa-sync"></i> Retry
                        </button>
                    </div>
                `;
                const retryBtn = document.getElementById('retryProductsLoadBtn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        retryBtn.disabled = true;
                        initFilter();
                    }, { once: true });
                }
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
        this.previousBodyOverflow = '';
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
        this.previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }
    
    closeDrawer() {
        const sidebar = document.querySelector('.filter-sidebar');
        const overlay = document.querySelector('.filter-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = this.previousBodyOverflow || '';
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
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // Handle selection
        modal.querySelectorAll('.sort-option').forEach(btn => {
            if (btn.dataset.value === sortSelect.value) {
                btn.classList.add('selected');
            }
            
            btn.addEventListener('click', () => {
                sortSelect.value = btn.dataset.value;
                sortSelect.dispatchEvent(new Event('change'));
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    document.body.style.overflow = previousOverflow || '';
                }, 300);
            });
        });
        
        // Close on overlay click
        modal.querySelector('.sort-modal-overlay').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = previousOverflow || '';
            }, 300);
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
        } else if (window.innerWidth > 1024) {
            const sidebar = document.querySelector('.filter-sidebar');
            const overlay = document.querySelector('.filter-overlay');
            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});
