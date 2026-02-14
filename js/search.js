/* ===================================
   SEARCH FUNCTIONALITY (Frontend-only)
   Uses local product data, no backend API calls
   =================================== */

class ProductSearch {
    constructor() {
        this.searchBtn = document.getElementById('searchBtn');
        this.searchOverlay = null;
        this.searchInput = null;
        this.searchResults = null;
        this.debounceTimer = null;
        this.productsCache = null;
        this.init();
    }

    init() {
        if (!this.searchBtn) return;
        this.createSearchOverlay();
        this.searchBtn.addEventListener('click', () => this.openSearch());
    }

    createSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.id = 'searchOverlay';
        overlay.innerHTML = `
            <div class="search-modal">
                <div class="search-header">
                    <input type="text"
                           class="search-input"
                           id="searchInput"
                           placeholder="Search for kurtas, sherwanis, lehengas..."
                           autocomplete="off">
                    <button class="search-close" id="searchClose" aria-label="Close search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results" id="searchResults">
                    <div class="search-placeholder">
                        <i class="fas fa-search"></i>
                        <p>Start typing to search products</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        this.searchOverlay = overlay;
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');

        document.getElementById('searchClose').addEventListener('click', () => this.closeSearch());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeSearch();
        });

        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchOverlay.classList.contains('active')) {
                this.closeSearch();
            }
        });
    }

    openSearch() {
        this.searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.searchInput.focus(), 100);
    }

    closeSearch() {
        this.searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        this.searchInput.value = '';
        this.searchResults.innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-search"></i>
                <p>Start typing to search products</p>
            </div>
        `;
    }

    esc(value) {
        if (window.AMZIRA?.utils?.escapeHtml) return window.AMZIRA.utils.escapeHtml(value);
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    normalizeForDisplay(product) {
        if (window.ProductNormalizer?.normalize) {
            return { ...product, ...window.ProductNormalizer.normalize(product) };
        }
        return product;
    }

    async ensureApiLayer() {
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

    async loadFallbackProducts() {
        if (Array.isArray(this.productsCache)) return this.productsCache;

        if (window.productFilter?.allProducts) {
            this.productsCache = window.productFilter.allProducts;
            return this.productsCache;
        }

        if (Array.isArray(window.allProducts)) {
            this.productsCache = window.allProducts;
            return this.productsCache;
        }

        try {
            const response = await fetch('data/products.json', { cache: 'no-store' });
            const data = await response.json();
            this.productsCache = Array.isArray(data?.products) ? data.products : [];
            return this.productsCache;
        } catch (error) {
            console.warn('Search data load failed:', error);
            this.productsCache = [];
            return this.productsCache;
        }
    }

    async searchViaApi(query) {
        await this.ensureApiLayer();

        if (!window.AMZIRA?.products?.getProducts) {
            throw new Error('Search API unavailable');
        }

        // Audit Ref: [BLOCKER] Search Functionality Completely Missing + timeout resilience.
        const TIMEOUT_MS = 10000;
        const timeoutPromise = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('Search request timed out')), TIMEOUT_MS);
        });

        const response = await Promise.race([
            window.AMZIRA.products.getProducts({ search: query, limit: 10 }),
            timeoutPromise
        ]);

        return response?.products || response?.results || (Array.isArray(response) ? response : []);
    }

    handleSearch(query) {
        clearTimeout(this.debounceTimer);

        const trimmed = query.trim();
        if (trimmed.length < 2) {
            this.searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Type at least 2 characters</p>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = `
            <div class="search-loading">
                <div class="spinner"></div>
                <p>Searching...</p>
            </div>
        `;

        this.debounceTimer = setTimeout(() => {
            this.performSearch(trimmed);
        }, 300);
    }

    async performSearch(query) {
        try {
            const results = await this.searchViaApi(query);

            if (!results.length) {
                this.searchResults.innerHTML = `
                    <div class="search-empty">
                        <i class="fas fa-search"></i>
                        <h3>No products found</h3>
                        <p>Try different keywords</p>
                    </div>
                `;
                return;
            }

            this.renderResults(results);
        } catch (apiError) {
            console.warn('Search API failed, trying fallback data:', apiError);

            // Audit Ref: [BLOCKER] Discovery should not hard-fail when API is degraded.
            const products = await this.loadFallbackProducts();
            const lower = query.toLowerCase();
            const fallbackResults = products.filter((product) => {
                const name = String(product?.name || '').toLowerCase();
                const category = String(product?.category?.name || product?.category || '').toLowerCase();
                const subcategory = String(product?.subcategory?.name || product?.subcategory || '').toLowerCase();
                const tags = Array.isArray(product?.tags) ? product.tags.join(' ').toLowerCase() : '';
                return name.includes(lower) || category.includes(lower) || subcategory.includes(lower) || tags.includes(lower);
            }).slice(0, 10);

            if (fallbackResults.length) {
                this.renderResults(fallbackResults);
                return;
            }

            this.searchResults.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Search unavailable</h3>
                    <p>Please try again in a moment.</p>
                    <button class="btn btn-primary" id="retrySearchBtn">Retry</button>
                </div>
            `;
            const retryBtn = document.getElementById('retrySearchBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.performSearch(query), { once: true });
            }
        }
    }

    renderResults(products) {
        const html = products.map((product) => {
            const normalized = this.normalizeForDisplay(product);
            const price = normalized?.price ?? product.sale_price ?? product.price ?? 0;
            const image = normalized?.mainImage || product.primary_image || product.image || 'images/products/product-1-front.jpg';
            const rawSlug = product?.slug || product?.handle || product?.url_slug || product?.seo_slug || product?.permalink || '';
            const safeSlug = String(rawSlug || '').trim();
            const detailUrl = safeSlug ? `product-detail.html?slug=${encodeURIComponent(safeSlug)}` : '#';
            const category = product.category?.name || product.category || '';

            return `
                <a href="${detailUrl}" class="search-result-item">
                    <img src="${this.esc(image)}" alt="${this.esc(product.name)}"
                         onerror="this.src='images/products/product-1-front.jpg'">
                    <div class="search-result-info">
                        <h4>${this.esc(product.name)}</h4>
                        <p class="search-result-category">${this.esc(category)}</p>
                        <p class="search-result-price">₹${Number(price || 0).toLocaleString('en-IN')}</p>
                    </div>
                </a>
            `;
        }).join('');

        this.searchResults.innerHTML = `
            <div class="search-results-list">
                ${html}
            </div>
        `;
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.productSearch = new ProductSearch();
    });
}
