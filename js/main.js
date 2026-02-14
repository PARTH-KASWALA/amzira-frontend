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

function toNum(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeForDisplay(product) {
    if (window.ProductNormalizer && typeof window.ProductNormalizer.normalize === 'function') {
        const normalized = window.ProductNormalizer.normalize(product);
        if (normalized) return { ...product, ...normalized };
    }
    return product;
}

function getCategoryLabel(product) {
    if (product?.category && typeof product.category === 'object') {
        return esc(product.category.name || '');
    }
    return esc(product?.category || product?.subcategory || '');
}

function getPrimaryImage(product) {
    if (product?.primary_image) return product.primary_image;
    if (Array.isArray(product?.images) && product.images.length) return product.images[0];
    return product?.image_front || product?.image || 'images/products/product-1-front.jpg';
}

function getSecondaryImage(product) {
    if (Array.isArray(product?.images) && product.images.length > 1) return product.images[1];
    return product?.image_back || getPrimaryImage(product);
}

function getBestsellerProducts(products) {
    if (!Array.isArray(products)) return [];

    const bestsellers = products.filter((product) => {
        const badge = String(product?.badge || '').toLowerCase();
        const tagList = Array.isArray(product?.tags) ? product.tags.map((tag) => String(tag).toLowerCase()) : [];
        return Boolean(
            product?.is_bestseller ||
            product?.isBestseller ||
            badge.includes('bestseller') ||
            tagList.includes('bestseller')
        );
    });

    return bestsellers.length > 0 ? bestsellers : products;
}

function getCategoryKey(product) {
    const raw = String(
        product?.category?.slug ||
        product?.category?.name ||
        product?.category ||
        product?.subcategory ||
        'uncategorized'
    )
        .trim()
        .toLowerCase();
    return raw || 'uncategorized';
}

const HOMEPAGE_CATEGORIES = ['men', 'women', 'kids'];

function toSafeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function hasSellableVariant(product) {
    const defaultVariantQty = toSafeNumber(product?.default_variant?.stock_quantity);
    if (Number.isFinite(defaultVariantQty) && defaultVariantQty > 0) return true;

    if (Array.isArray(product?.variants)) {
        const sellableVariant = product.variants.find((variant) => toSafeNumber(variant?.stock_quantity) > 0);
        if (sellableVariant) return true;
    }

    const stockQty = toSafeNumber(product?.stock_quantity);
    if (Number.isFinite(stockQty) && stockQty > 0) return true;

    return Boolean(product?.in_stock === true);
}

function hasProductImage(product) {
    if (typeof product?.primary_image === 'string' && product.primary_image.trim()) return true;
    if (Array.isArray(product?.images) && product.images.some((image) => typeof image === 'string' ? image.trim() : image?.image_url || image?.url)) {
        return true;
    }
    return false;
}

function isValidCatalogProduct(product) {
    if (!product || typeof product !== 'object') return false;
    const hasId = product?.id != null && String(product.id).trim() !== '';
    const hasName = typeof product?.name === 'string' && product.name.trim() !== '';
    const sale = toSafeNumber(product?.sale_price);
    const base = toSafeNumber(product?.base_price ?? product?.price);
    const hasPrice = (Number.isFinite(sale) && sale >= 0) || (Number.isFinite(base) && base >= 0);
    return Boolean(hasId && hasName && hasPrice && hasProductImage(product) && hasSellableVariant(product));
}

function createComingSoonSlide(categoryLabel) {
    return `
        <div class="swiper-slide">
            <div class="product-card">
                <div class="product-image">
                    <img class="front-image" src="images/categories/${esc(String(categoryLabel).toLowerCase())}.jpg" alt="${esc(categoryLabel)} coming soon" loading="lazy" onerror="this.onerror=null;this.src='images/categories/occasion.jpg';">
                </div>
                <div class="product-info">
                    <p class="product-category">${esc(categoryLabel)}</p>
                    <h3 class="product-name">Coming Soon</h3>
                    <div class="product-price">
                        <span class="price-current">New arrivals shortly</span>
                    </div>
                    <a class="btn btn-secondary btn-block" href="${esc(String(categoryLabel).toLowerCase())}.html">Explore ${esc(categoryLabel)}</a>
                </div>
            </div>
        </div>
    `;
}

function curateOnePerCategory(products, { maxItems = 3 } = {}) {
    const curated = [];
    const seenCategories = new Set();
    const list = Array.isArray(products) ? products : [];

    for (const product of list) {
        const categoryKey = getCategoryKey(product);
        if (seenCategories.has(categoryKey)) continue;
        seenCategories.add(categoryKey);
        curated.push(product);
        if (curated.length >= maxItems) break;
    }

    // Guarded fill: if unique categories are fewer, backfill with remaining products.
    if (curated.length < maxItems) {
        for (const product of list) {
            if (curated.includes(product)) continue;
            curated.push(product);
            if (curated.length >= maxItems) break;
        }
    }

    return curated;
}

function getNewArrivalProducts(products) {
    const list = Array.isArray(products) ? [...products] : [];
    return list.sort((a, b) => {
        const aTs = Date.parse(a?.created_at || a?.createdAt || '') || 0;
        const bTs = Date.parse(b?.created_at || b?.createdAt || '') || 0;
        if (aTs !== bTs) return bTs - aTs;
        return String(b?.id || '').localeCompare(String(a?.id || ''));
    });
}

function getStaticNewArrivalsProducts() {
    return [
        {
            id: 'new-arrival-1',
            name: 'Ivory Embroidered Kurta Set',
            category: 'Men',
            base_price: 6999,
            sale_price: 5699,
            image_front: 'images/new-arrivals/product-1-front.jpg',
            image_back: 'images/new-arrivals/product-1-front.jpg',
            badge: 'NEW',
            listing_add_to_cart_enabled: false,
            slug: 'new-arrival-1'
        },
        {
            id: 'new-arrival-2',
            name: 'Regal Reception Kurta',
            category: 'Men',
            base_price: 7499,
            sale_price: 6199,
            image_front: 'images/new-arrivals/product-2-front.jpg',
            image_back: 'images/new-arrivals/product-2-front.jpg',
            badge: 'NEW',
            listing_add_to_cart_enabled: false,
            slug: 'new-arrival-2'
        },
        {
            id: 'new-arrival-3',
            name: 'Festive Threadwork Ensemble',
            category: 'Men',
            base_price: 8299,
            sale_price: 6899,
            image_front: 'images/new-arrivals/product-3-front.jpg',
            image_back: 'images/new-arrivals/product-3-front.jpg',
            badge: 'NEW',
            listing_add_to_cart_enabled: false,
            slug: 'new-arrival-3'
        },
        {
            id: 'new-arrival-4',
            name: 'Classic Celebration Kurta',
            category: 'Men',
            base_price: 6599,
            sale_price: 5399,
            image_front: 'images/new-arrivals/product-4-front.jpg',
            image_back: 'images/new-arrivals/product-4-front.jpg',
            badge: 'NEW',
            listing_add_to_cart_enabled: false,
            slug: 'new-arrival-4'
        },
        {
            id: 'new-arrival-5',
            name: 'Signature Wedding Edit',
            category: 'Men',
            base_price: 8999,
            sale_price: 7399,
            image_front: 'images/new-arrivals/product-1-front.jpg',
            image_back: 'images/new-arrivals/product-1-front.jpg',
            badge: 'NEW',
            listing_add_to_cart_enabled: false,
            slug: 'new-arrival-5'
        }
    ];
}

function getDefaultVariantId(product) {
    const variantId = Number(
        product?.default_variant?.variant_id ??
        product?.default_variant?.id ??
        product?.default_variant_id ??
        product?.defaultVariantId
    );
    if (Number.isInteger(variantId) && variantId > 0) return variantId;
    return null;
}

function isListingAddToCartDisabled(product) {
    return product?.listing_add_to_cart_enabled === false;
}

// Create Product Card HTML
function createProductCard(product) {
    const normalized = normalizeForDisplay(product);
    const originalPrice = toNum(normalized?.basePrice ?? normalized?.base_price ?? normalized?.price ?? normalized?.mrp, 0);
    const salePrice = toNum(normalized?.price ?? normalized?.sale_price ?? normalized?.salePrice ?? normalized?.base_price, originalPrice);
    const currentPrice = salePrice > 0 ? salePrice : originalPrice;
    const effectiveOriginal = originalPrice >= currentPrice ? originalPrice : currentPrice;
    const discountPercent = effectiveOriginal > currentPrice
        ? Math.round(((effectiveOriginal - currentPrice) / effectiveOriginal) * 100)
        : 0;
    const variantId = getDefaultVariantId(product);
    const listingAddToCartDisabled = isListingAddToCartDisabled(product);
    const ctaDisabled = !listingAddToCartDisabled && !variantId;
    const mainImage = normalized?.mainImage || getPrimaryImage(product);
    const secondaryImage = normalized?.images?.[1] || getSecondaryImage(product);
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img class="front-image" src="${esc(mainImage)}" alt="${esc(normalized?.name || product.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/product-1-front.jpg';">
                <img class="back-image" src="${esc(secondaryImage)}" alt="${esc(normalized?.name || product.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/products/product-1-front.jpg';">
                ${normalized?.badge ? `<span class="product-badge ${esc(String(normalized.badge).toLowerCase())}">${esc(normalized.badge)}</span>` : ''}
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
                <p class="product-category">${esc(normalized?.category || getCategoryLabel(product))}</p>
                <h3 class="product-name">${esc(normalized?.name || product.name)}</h3>
                <div class="product-price">
                    <span class="price-current">₹${currentPrice.toLocaleString('en-IN')}</span>
                    ${effectiveOriginal > currentPrice ? `<span class="price-original">₹${effectiveOriginal.toLocaleString('en-IN')}</span>` : ''}
                    ${discountPercent > 0 ? `<span class="price-discount">${discountPercent}% OFF</span>` : ''}
                </div>
                ${normalized?.rating ? `
                <div class="product-rating">
                    <span class="stars">
                        ${generateStars(normalized.rating)}
                    </span>
                    <span class="rating-count">(${normalized.reviews})</span>
                </div>
                ` : ''}
                ${
                    listingAddToCartDisabled
                        ? `<a class="btn btn-secondary btn-block" href="product-detail.html?slug=${encodeURIComponent(String(product.slug || product.handle || product.url_slug || product.seo_slug || product.permalink || '').trim())}">View Details</a>`
                        : `<button class="btn btn-primary btn-block add-to-cart-btn ${ctaDisabled ? 'disabled' : ''}" data-id="${esc(product.id)}" ${variantId ? `data-variant-id="${esc(variantId)}"` : ''} ${ctaDisabled ? 'disabled' : ''}>${ctaDisabled ? 'Please select size/color' : 'Add to Cart'}</button>`
                }
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

async function apiGetJson(endpoint) {
    await ensureApiLayer();
    if (window.AMZIRA?.apiRequest) {
        return window.AMZIRA.apiRequest(endpoint);
    }
    const response = await fetch(endpoint);
    return response.json();
}

async function fetchProductsByIds(ids) {
    if (!Array.isArray(ids) || !ids.length) return [];
    try {
        const data = await apiGetJson(`/products/batch?ids=${encodeURIComponent(ids.join(','))}`);
        const rawProducts = data?.products || data?.results || (Array.isArray(data) ? data : []);
        return rawProducts;
    } catch (error) {
        console.warn('Batch product fetch failed, falling back to products list:', error);
        const data = await safeFetchProducts();
        return data.filter((product) => ids.includes(product.id));
    }
}

async function loadHomepageMerchandising() {
    const bestsellersContainer = document.getElementById('bestsellersProducts');
    const newArrivalsContainer = document.getElementById('newArrivalsProducts');
    if (!bestsellersContainer && !newArrivalsContainer) return;

    try {
        await ensureApiLayer();
        const categoryPayloads = await Promise.all(
            HOMEPAGE_CATEGORIES.map(async (category) => {
                try {
                    const response = await window.AMZIRA.products.getProducts({ category, limit: 24 });
                    const items = response?.products || response?.results || [];
                    const valid = Array.isArray(items) ? items.filter(isValidCatalogProduct) : [];
                    return { category, reachable: true, items: Array.isArray(items) ? items : [], valid };
                } catch (error) {
                    return { category, reachable: false, items: [], valid: [], error };
                }
            })
        );

        window.__AMZIRA_CATALOG_VERIFICATION__ = categoryPayloads.map((entry) => ({
            category: entry.category,
            apiReachable: entry.reachable,
            items: entry.items.length,
            validProduct: entry.valid.length > 0,
            action: entry.valid.length > 0 ? 'Render product' : 'Coming Soon'
        }));

        const productByCategory = {};
        const latestByCategory = {};
        categoryPayloads.forEach((entry) => {
            const best = entry.valid.find((product) => {
                const badge = String(product?.badge || '').toLowerCase();
                const tags = Array.isArray(product?.tags) ? product.tags.map((tag) => String(tag).toLowerCase()) : [];
                return product?.is_bestseller || badge.includes('bestseller') || tags.includes('bestseller');
            }) || entry.valid[0] || null;

            const newest = [...entry.valid].sort((a, b) => {
                const aTs = Date.parse(a?.created_at || a?.createdAt || '') || 0;
                const bTs = Date.parse(b?.created_at || b?.createdAt || '') || 0;
                return bTs - aTs;
            })[0] || null;

            productByCategory[entry.category] = best;
            latestByCategory[entry.category] = newest || best;
        });

        const dedupeBy = (items) => {
            const list = Array.isArray(items) ? items : [];
            const seen = new Set();
            return list.filter((item) => {
                const key = String(item?.id || item?.slug || item?.product_id || item?._id || '').trim();
                if (!key) return false;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        };

        const allValid = dedupeBy(
            categoryPayloads.flatMap((entry) => entry.valid || [])
        );

        const toDateTs = (product) => Date.parse(product?.created_at || product?.createdAt || '') || 0;
        const newArrivalsList = [...allValid].sort((a, b) => toDateTs(b) - toDateTs(a));

        const isBestSeller = (product) => {
            const badge = String(product?.badge || '').toLowerCase();
            const tags = Array.isArray(product?.tags) ? product.tags.map((tag) => String(tag).toLowerCase()) : [];
            return product?.is_bestseller || badge.includes('bestseller') || tags.includes('bestseller');
        };

        const bestsellersList = allValid.filter(isBestSeller);

        const buildSlides = (products, fallbackLabel) => {
            const slides = products.slice(0, 8).map((product) =>
                `<div class="swiper-slide">${createProductCard(normalizeForDisplay(product))}</div>`
            );
            while (slides.length < 4) {
                slides.push(createComingSoonSlide(fallbackLabel));
            }
            return slides.join('');
        };

        if (bestsellersContainer) {
            const list = bestsellersList.length ? bestsellersList : allValid;
            bestsellersContainer.innerHTML = buildSlides(list, 'Bestsellers');
            attachProductEventListeners(bestsellersContainer);
        }

        if (newArrivalsContainer) {
            const list = newArrivalsList.length ? newArrivalsList : allValid;
            newArrivalsContainer.innerHTML = buildSlides(list, 'New Arrivals');
            attachProductEventListeners(newArrivalsContainer);
        }

        // Provide enough variety for the fixed 5 occasion cards to pick unique images.
        window.__AMZIRA_HOME_OCCASION_PRODUCTS__ = {
            men: dedupeBy(categoryPayloads.find((entry) => entry.category === 'men')?.valid || []).slice(0, 24),
            women: dedupeBy(categoryPayloads.find((entry) => entry.category === 'women')?.valid || []).slice(0, 24)
        };
    } catch (error) {
        console.error('Failed to load merchandising:', error);
        if (newArrivalsContainer) {
            newArrivalsContainer.innerHTML = HOMEPAGE_CATEGORIES
                .map((category) => createComingSoonSlide(category.charAt(0).toUpperCase() + category.slice(1)))
                .join('');
        }
        if (bestsellersContainer) {
            bestsellersContainer.innerHTML = HOMEPAGE_CATEGORIES
                .map((category) => createComingSoonSlide(category.charAt(0).toUpperCase() + category.slice(1)))
                .join('');
        }
        window.__AMZIRA_HOME_OCCASION_PRODUCTS__ = { men: [], women: [] };
    }
}

// Attach Event Listeners to Product Cards
function attachProductEventListeners(container) {
    // Add to Cart
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            const variantId = this.getAttribute('data-variant-id');
            // Audit Ref: Loading states don't cover Add to Cart.
            setActionButtonLoading(this, true, 'Adding...');
            try {
                await addToCart(productId, variantId);
            } finally {
                setActionButtonLoading(this, false);
            }
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

function setActionButtonLoading(button, isLoading, loadingText = null) {
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

// Add to Cart Function
async function addToCart(productId, variantIdRaw = null) {
    const products = Array.isArray(window.allProducts) ? window.allProducts : [];
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;
    const variantId = Number(variantIdRaw || getDefaultVariantId(product));
    if (!Number.isInteger(variantId) || variantId <= 0) {
        showNotification('Please select size/color', 'error');
        return;
    }

    // Delegate to the unified cart manager so logged-in users always hit backend /cart/items.
    if (window.cart && typeof window.cart.addItem === 'function') {
        const added = await window.cart.addItem(product.id, 1, variantId);
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

// Placeholder link handler for soft-launch navigation
function initPlaceholderLinks() {
    const links = document.querySelectorAll('a[href="#"], a[href="javascript:void(0)"]');
    if (!links.length) return;

    links.forEach((link) => {
        if (link.dataset.placeholderBound === 'true') return;
        link.dataset.placeholderBound = 'true';
        link.addEventListener('click', (event) => {
            event.preventDefault();
            showNotification('This collection is coming soon. Explore Men, Women, or Kids.', 'info');
        });
    });
}

// Initialize on DOM Ready
class AppInitializer {
    static async init() {
        const isHomepage = Boolean(document.getElementById('newArrivalsProducts'));

        // Load homepage merchandising if available; falls back gracefully.
        if (isHomepage) {
            await loadHomepageMerchandising();
        }

        // Load API products for global actions (add-to-cart, wishlist, quick-view).
        const products = await safeFetchProducts();

        // Store globally for other scripts
        window.allProducts = products.length > 0 ? products : getStaticNewArrivalsProducts();

        // Initialize functions
        updateCartCount();
        initNewsletterForm();
        initStickyHeader();
        initPlaceholderLinks();
        if (isHomepage) {
            createAutoSlider('newArrivalsProducts', 5000);
            createAutoSlider('bestsellersProducts', 5000);
        }

        // Signal readiness
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('appReady', { detail: { products: window.allProducts } }));
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

function createAutoSlider(trackId, interval = 5000) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const getSlides = () => Array.from(track.children).filter((child) => child.classList.contains('swiper-slide'));
    let currentPage = 0;
    let timerId = null;

    function getCardsPerView() {
        const width = window.innerWidth;
        if (width < 600) return 1;
        if (width < 900) return 2;
        if (width < 1200) return 3;
        return 4;
    }

    function applyLayout(slides, cardsPerView, totalPages) {
        track.style.width = `${totalPages * 100}%`;
        const slideWidth = 100 / (totalPages * cardsPerView);
        slides.forEach((slide) => {
            slide.style.flex = `0 0 ${slideWidth}%`;
        });
    }

    function updateTransform() {
        const slides = getSlides();
        if (!slides.length) return;

        const cardsPerView = getCardsPerView();
        const totalPages = Math.max(1, Math.ceil(slides.length / cardsPerView));

        if (currentPage >= totalPages) currentPage = 0;

        applyLayout(slides, cardsPerView, totalPages);
        track.style.transform = `translateX(-${currentPage * 100}%)`;
    }

    function start() {
        const slides = getSlides();
        if (slides.length <= 4) return;
        if (timerId) clearInterval(timerId);
        updateTransform();
        timerId = setInterval(() => {
            const cardsPerView = getCardsPerView();
            const totalPages = Math.max(1, Math.ceil(getSlides().length / cardsPerView));
            currentPage = (currentPage + 1) >= totalPages ? 0 : currentPage + 1;
            updateTransform();
        }, interval);
    }

    window.addEventListener('resize', updateTransform);
    setTimeout(start, 100);
}


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
