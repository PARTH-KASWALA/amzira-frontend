/* ===================================
   QUICK ADD TO CART FUNCTIONALITY
   For Product Listing Pages
   =================================== */

class QuickAdd {
    constructor() {
        this.modal = null;
        this.selectedSize = null;
        this.selectedVariantId = null;
        this.currentProduct = null;
        this.init();
    }

    init() {
        this.createModal();
        this.attachQuickAddListeners();
    }

    esc(value) {
        if (window.AMZIRA?.utils?.escapeHtml) return window.AMZIRA.utils.escapeHtml(value);
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    async ensureApiReady() {
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

    createModal() {
        const modalHTML = `
            <div class="quick-add-modal" id="quickAddModal">
                <div class="quick-add-overlay" onclick="window.quickAdd.closeModal()"></div>
                <div class="quick-add-container">
                    <div class="quick-add-content" id="quickAddContent">
                        <!-- Content will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('quickAddModal');
    }

    attachQuickAddListeners() {
        // Remove existing listeners first
        document.querySelectorAll('.quick-add-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleQuickAddClick);
        });

        // Add new listeners
        document.querySelectorAll('.quick-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAddClick(e));
        });
    }

    handleQuickAddClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const variantIdRaw = e.currentTarget.getAttribute('data-variant-id');
        const productId = e.currentTarget.getAttribute('data-id');
        if (!productId) return;

        const variantId = Number(variantIdRaw);
        if (Number.isInteger(variantId) && variantId > 0) {
            this.addListingItemToCart(productId, variantId, e.currentTarget);
            return;
        }

        if (window.errorHandler?.showWarning) {
            window.errorHandler.showWarning('Please select size/color');
        } else {
            alert('Please select size/color');
        }
    }

    async addListingItemToCart(productId, variantId, button) {
        if (!window.cart || typeof window.cart.addItem !== 'function') {
            if (window.errorHandler?.showError) {
                window.errorHandler.showError('Cart service unavailable. Please refresh and try again.');
            } else {
                alert('Cart service unavailable. Please refresh and try again.');
            }
            return;
        }

        const originalDisabled = button.disabled;
        button.disabled = true;
        button.classList.add('is-loading');

        try {
            const added = await window.cart.addItem(productId, 1, variantId);
            if (added && window.errorHandler?.showSuccess) {
                window.errorHandler.showSuccess('Added to cart', 'Cart Updated');
            }
        } catch (error) {
            if (window.errorHandler?.showError) {
                const msg = window.AMZIRA?.utils?.getApiErrorMessage?.(error, 'Unable to add item right now.');
                window.errorHandler.showError(msg || 'Unable to add item right now.');
            }
        } finally {
            button.disabled = originalDisabled;
            button.classList.remove('is-loading');
        }
    }

    async loadProductData(productId) {
        try {
            // Try to get product from existing data if available
            let product = null;

            // Check if we have products data loaded
            if (window.allProducts) {
                product = window.allProducts.find(p => p.id === productId);
            }

            // If not found, try to fetch from products.json
            if (!product) {
                await this.ensureApiReady();
                if (!window.AMZIRA?.products?.getProducts) {
                    throw new Error('API client unavailable');
                }
                const data = await window.AMZIRA.products.getProducts({ limit: 1000 });
                const products = data?.products || data?.results || (Array.isArray(data) ? data : []);
                product = products.find((p) => String(p.id) === String(productId));
            }

            if (product) {
                this.currentProduct = product;
                this.openModal(product);
            }
        } catch (error) {
            console.error('Error loading product data:', error);
        }
    }

    openModal(product) {
        this.selectedSize = null;
        this.selectedVariantId = null;

        const content = `
            <div class="quick-add-image">
                <img src="${this.esc(product.images ? product.images[0] : product.image)}"
                     alt="${this.esc(product.name)}"
                     loading="lazy">
            </div>
            <div class="quick-add-details">
                <h3 class="quick-add-title">${this.esc(product.name)}</h3>
                <div class="quick-add-price">
                    <span class="price-current">₹${Number(product.salePrice || product.price || 0).toLocaleString('en-IN')}</span>
                    ${product.salePrice ? `<span class="price-original">₹${Number(product.price || 0).toLocaleString('en-IN')}</span>` : ''}
                    ${product.salePrice ? `<span class="price-discount">${Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF</span>` : ''}
                </div>

                ${product.rating ? `
                    <div class="quick-add-rating">
                        <span class="stars">${this.generateStars(product.rating)}</span>
                        <span class="rating-count">(${product.reviews || 0})</span>
                    </div>
                ` : ''}

                <div class="quick-add-size-section">
                    <h4>Select Size</h4>
                    <div class="quick-add-sizes">
                        ${this.renderSizeOptions(product)}
                    </div>
                </div>

                <button class="quick-add-btn" onclick="window.quickAdd.addToCart()" disabled id="quickAddToCartBtn">
                    Add to Cart
                </button>

                <div class="quick-add-info">
                    <p>✓ Free shipping on orders above ₹2,000</p>
                    <p>✓ 30-day return policy</p>
                </div>
            </div>
        `;

        document.getElementById('quickAddContent').innerHTML = content;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    renderSizeOptions(product) {
        const variants = Array.isArray(product?.variants) ? product.variants : [];
        if (variants.length > 0) {
            return variants.map((variant) => {
                const variantId = Number(variant?.id);
                const size = this.esc(variant?.size || 'N/A');
                const stock = Number(variant?.stock_quantity ?? variant?.stock ?? 0);
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 2;

                return `
                    <button class="size-option-quick ${isOutOfStock ? 'out-of-stock' : ''}"
                            data-size="${size}"
                            data-variant-id="${variantId}"
                            onclick="window.quickAdd.selectSize('${size}', '${variantId}')"
                            ${isOutOfStock ? 'disabled' : ''}>
                        ${size}
                        ${isLowStock ? '<span class="low-stock-indicator">Low</span>' : ''}
                    </button>
                `;
            }).join('');
        }

        if (!product.sizes || !product.stockBySizes) {
            return '<p class="size-unavailable">Size information not available</p>';
        }

        return product.sizes.map(size => {
            const stock = product.stockBySizes[size] || 0;
            const isOutOfStock = stock === 0;
            const isLowStock = stock <= 2;

            return `
                <button class="size-option-quick ${isOutOfStock ? 'out-of-stock' : ''}"
                        data-size="${this.esc(size)}"
                        onclick="window.quickAdd.selectSize('${this.esc(size)}', null)"
                        ${isOutOfStock ? 'disabled' : ''}>
                    ${this.esc(size)}
                    ${isLowStock && !isOutOfStock ? '<span class="low-stock-indicator">Low</span>' : ''}
                </button>
            `;
        }).join('');
    }

    selectSize(size, variantId) {
        this.selectedSize = size;
        this.selectedVariantId = Number(variantId);

        // Update UI
        document.querySelectorAll('.size-option-quick').forEach(btn => {
            btn.classList.remove('selected');
        });

        const selectedBtn = document.querySelector(`[data-size="${size}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }

        // Enable add to cart button
        const addBtn = document.getElementById('quickAddToCartBtn');
        if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = `Add to Cart - ${size}`;
        }
    }

    async addToCart() {
        if (!this.currentProduct || !this.selectedSize) return;
        if (!Number.isInteger(this.selectedVariantId) || this.selectedVariantId <= 0) {
            alert('Please select size/color');
            return;
        }

        try {
            // Check if cart system exists
            if (window.cart && typeof window.cart.addItem === 'function') {
                const added = await window.cart.addItem(this.currentProduct.id, 1, this.selectedVariantId);
                if (added) {
                    this.showSuccessMessage();
                }
            } else {
                console.error('Cart system not available');
                alert('Cart system not available. Please try again.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding item to cart. Please try again.');
        }
    }

    showSuccessMessage() {
        const addBtn = document.getElementById('quickAddToCartBtn');
        if (addBtn) {
            const originalText = addBtn.textContent;
            addBtn.textContent = '✓ Added to Cart!';
            addBtn.style.background = '#10B981';

            setTimeout(() => {
                addBtn.textContent = originalText;
                addBtn.style.background = '';
                this.closeModal();
            }, 1500);
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.selectedSize = null;
        this.currentProduct = null;
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Prevent duplicate initialization
    if (window.quickAdd) {
        console.warn('QuickAdd already initialized');
        return;
    }

    window.quickAdd = new QuickAdd();

    // Dispatch ready event for other scripts
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quickAddReady'));
    }
});
