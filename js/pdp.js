import { createGallery } from './pdp-gallery.js';
import { createSizeManager } from './pdp-size.js';
import { createDeliveryChecker } from './pdp-delivery.js';

const state = {
    currentProduct: null,
    activeVariants: [],
    selectedColor: null,
    selectedSize: null,
    selectedVariantId: null,
    selectedVariantStock: 0,
    quantity: 1,
    addToCartInFlight: false,
    pendingBuyNowRedirect: false,
    currentPriceValue: 0,
    basePriceValue: 0,
    defaultProductImages: []
};

const getPdpEl = (id) => document.getElementById(id);

function ensurePdpInlineMessage() {
    let messageEl = getPdpEl('pdpInlineMessage');
    if (messageEl) return messageEl;
    const actionContainer = document.querySelector('.pdp-actions');
    if (!actionContainer) return null;
    messageEl = document.createElement('div');
    messageEl.id = 'pdpInlineMessage';
    messageEl.setAttribute('aria-live', 'polite');
    messageEl.style.cssText = 'min-height:20px;font-size:13px;line-height:1.4;color:var(--text-gray);margin-top:10px;';
    actionContainer.insertAdjacentElement('afterend', messageEl);
    return messageEl;
}

function setPdpInlineMessage(message, type = 'info') {
    const messageEl = ensurePdpInlineMessage();
    if (!messageEl) return;
    messageEl.textContent = message || '';
    messageEl.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? '#047857' : 'var(--text-gray)';
}

function esc(value) {
    if (window.AMZIRA?.utils?.escapeHtml) return window.AMZIRA.utils.escapeHtml(value);
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function splitUrlParts(url) {
    let base = String(url || '');
    let hash = '';
    let query = '';
    const hashIndex = base.indexOf('#');
    if (hashIndex >= 0) {
        hash = base.slice(hashIndex);
        base = base.slice(0, hashIndex);
    }
    const queryIndex = base.indexOf('?');
    if (queryIndex >= 0) {
        query = base.slice(queryIndex);
        base = base.slice(0, queryIndex);
    }
    return { base, query, hash };
}

function buildWebpVariant(url, suffix) {
    const parts = splitUrlParts(url);
    if (!/\\.(jpe?g|png)$/i.test(parts.base)) return null;
    const variant = parts.base.replace(/\\.(jpe?g|png)$/i, `-${suffix}.webp`);
    return `${variant}${parts.query}${parts.hash}`;
}

function buildPictureMarkup(imageUrl, altText) {
    const webp400 = buildWebpVariant(imageUrl, '400');
    const webp800 = buildWebpVariant(imageUrl, '800');
    const safeUrl = esc(imageUrl);
    const safeAlt = esc(altText);
    if (!webp400 || !webp800) {
        return `<img class=\"front-image\" src=\"${safeUrl}\" alt=\"${safeAlt}\" loading=\"lazy\" decoding=\"async\" width=\"600\" height=\"800\">`;
    }

    return `
    <picture>
        <source srcset="${esc(webp400)} 400w, ${esc(webp800)} 800w" type="image/webp">
        <img class="front-image" src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" width="600" height="800">
    </picture>
`;
}

function safeHexColor(value, fallback = '#8B1538') {
    const raw = String(value || '').trim();
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw) ? raw : fallback;
}

function normalizeForDisplayProduct(product) {
    if (window.ProductNormalizer?.normalize) {
        const normalized = window.ProductNormalizer.normalize(product);
        if (normalized) return { ...product, ...normalized };
    }
    return product;
}

function normalizeVariantColor(value) {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') return String(value.name || value.title || '').trim();
    return '';
}

function normalizeVariantSize(value) {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') return String(value.name || value.label || value.value || '').trim();
    return '';
}

function flattenVariants(rawVariants) {
    const flat = [];
    if (!Array.isArray(rawVariants)) return flat;
    rawVariants.forEach((variant) => {
        if (!variant) return;
        if (Array.isArray(variant.variants)) {
            variant.variants.forEach((child) => flat.push({ ...variant, ...child }));
            return;
        }
        if (Array.isArray(variant.sizes)) {
            variant.sizes.forEach((sizeEntry) => flat.push({ ...variant, ...sizeEntry }));
            return;
        }
        flat.push(variant);
    });
    return flat;
}

function extractVariants(product) {
    if (!product) return [];
    let raw = product.variants || product.variant_options || product.variant_groups || product.options || [];
    if (!Array.isArray(raw) && Array.isArray(raw.items)) {
        raw = raw.items;
    }
    return flattenVariants(raw).map((variant) => ({
        ...variant,
        id: variant?.id || variant?.variant_id || variant?.sku || null,
        color: normalizeVariantColor(variant?.color || variant?.colour || variant?.shade),
        size: normalizeVariantSize(variant?.size || variant?.label),
        stock_quantity: Number(variant?.stock_quantity ?? variant?.stock ?? 0)
    }));
}

async function ensureApiReady() {
    if (window.AMZIRA?.apiRequest) return;
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

function getProductSlug() {
    return new URLSearchParams(window.location.search).get('slug');
}

function hasSinglePurchasableVariant() {
    return state.activeVariants.filter((variant) => Number(variant?.stock_quantity || 0) > 0).length === 1;
}

function updateStickyBar(forceHide = false) {
    const sticky = getPdpEl('stickyBuyBar');
    const addToCartBtn = getPdpEl('addToCartBtn');
    if (!sticky) return;
    if (forceHide) {
        sticky.classList.remove('show');
        return;
    }
    if (!addToCartBtn) {
        sticky.classList.remove('show');
        return;
    }
    const ctaRect = addToCartBtn.getBoundingClientRect();
    const passedCTA = ctaRect.bottom < 0;
    if (passedCTA) sticky.classList.add('show');
    else sticky.classList.remove('show');
}

function updateStockPill(stock) {
    const stockPill = getPdpEl('stockPill');
    if (!stockPill) return;
    stockPill.className = 'stock-pill';
    if (stock <= 0) {
        stockPill.classList.add('out');
        stockPill.textContent = 'Out of stock';
        return;
    }
    if (stock <= 2) {
        stockPill.classList.add('low');
        stockPill.textContent = `Only ${stock} left`;
        return;
    }
    stockPill.classList.add('in');
    stockPill.textContent = 'In stock';
}

function updateStickyContent() {
    const thumb = getPdpEl('stickyThumb');
    const nameEl = getPdpEl('stickyName');
    const priceEl = getPdpEl('stickyPrice');
    const firstImage = document.querySelector('#mainImageStack img');
    const priceDisplay = getPdpEl('priceDisplay');
    const sizeSelect = getPdpEl('stickySizeSelect');
    const stickyQtyInput = getPdpEl('stickyQtyInput');

    if (thumb && firstImage) thumb.src = firstImage.src;
    if (nameEl && state.currentProduct) {
        const rawName = state.currentProduct.name || 'Product';
        nameEl.textContent = rawName.length > 48 ? `${rawName.slice(0, 45)}...` : rawName;
    }
    if (priceEl && priceDisplay) priceEl.textContent = priceDisplay.textContent;
    if (sizeSelect) sizeSelect.value = state.selectedSize || '';
    if (stickyQtyInput) stickyQtyInput.value = String(state.quantity);
}

function updateAddToCartState() {
    const addToCartBtn = getPdpEl('addToCartBtn');
    const stickyBtn = getPdpEl('stickyAddToCartBtn');
    const hasVariant = Number.isInteger(Number(state.selectedVariantId)) && Number(state.selectedVariantId) > 0;
    const canAdd = hasVariant && state.selectedVariantStock > 0 && !state.addToCartInFlight;
    if (addToCartBtn) addToCartBtn.disabled = !canAdd;
    if (stickyBtn) stickyBtn.disabled = !canAdd;
    if (!hasVariant) {
        setPdpInlineMessage(
            hasSinglePurchasableVariant() ? 'Only one size is available and selected for you.' : 'Please choose color and size to continue.',
            'info'
        );
    }
    updateStickyContent();
}

function setViewedCount(product) {
    const countLine = getPdpEl('viewedCountLine');
    const countNumber = getPdpEl('viewedCountNumber');
    if (!countLine || !countNumber) return;

    const raw = Number(
        product?.view_count ??
        product?.views ??
        product?.viewed_count ??
        product?.viewed ??
        0
    );

    if (!Number.isFinite(raw) || raw <= 0) {
        countNumber.textContent = 'Be the first to view this product!';
    } else {
        countNumber.textContent = `${raw.toLocaleString('en-IN')} people have viewed this product recently`;
    }
}

async function loadRelatedProducts(product, categoryName) {
    const grid = getPdpEl('relatedProducts');
    if (!grid) return;
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-gray);">Loading related products...</p>';
    try {
        await ensureApiReady();
        const payload = await window.AMZIRA.products.getProducts({ category: categoryName, limit: 8 });
        const items = payload?.products || payload?.results || (Array.isArray(payload) ? payload : []);
        const filtered = items.filter((item) => String(item?.id) !== String(product?.id)).slice(0, 4);
        if (!filtered.length) {
            grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-gray);">No related products found.</p>';
            return;
        }
        grid.innerHTML = filtered.map((item) => {
            const normalized = normalizeForDisplayProduct(item);
            const price = Number(normalized?.price || item?.sale_price || item?.price || 0);
            const original = Number(normalized?.basePrice || item?.base_price || item?.price || price);
                const mainImage = normalized?.mainImage || item?.primary_image || item?.image || normalized?.images?.[0] || 'images/products/product-1-front.jpg';
                const imageMarkup = buildPictureMarkup(mainImage, item.name || 'Product');
                return `
                        <article class="product-card">
                            <a href="product-detail.html?slug=${encodeURIComponent(item.slug || item.id)}">
                                <div class="product-image">
                                    ${imageMarkup}
                                </div>
                                <div class="product-info">
                                    <h3 class="product-name">${esc(item.name || 'Product')}</h3>
                                    <div class="product-price">
                                        <span class="price-current">₹${price.toLocaleString('en-IN')}</span>
                                        ${original > price ? `<span class="price-original">₹${original.toLocaleString('en-IN')}</span>` : ''}
                                    </div>
                                </div>
                            </a>
                        </article>
                    `;
        }).join('');
    } catch {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-gray);">Unable to load related products.</p>';
    }
}

function updateSku(product) {
    const skuEl = getPdpEl('productSku');
    if (!skuEl) return;
    const sku = product?.sku || product?.product_sku || product?.style_code || product?.id || '--';
    skuEl.textContent = `SKU: ${sku}`;
}

function applyPriceDisplay(currentPrice, basePrice) {
    const priceDisplay = getPdpEl('priceDisplay');
    const originalPrice = getPdpEl('originalPrice');
    const discountPercent = getPdpEl('discountPercent');
    if (!priceDisplay || !originalPrice || !discountPercent) return;

    priceDisplay.textContent = `₹${Number(currentPrice || 0).toLocaleString('en-IN')}`;
    if (Number(basePrice || 0) > Number(currentPrice || 0)) {
        originalPrice.textContent = `₹${Number(basePrice).toLocaleString('en-IN')}`;
        discountPercent.textContent = `${Math.round(((basePrice - currentPrice) / basePrice) * 100)}% OFF`;
        originalPrice.style.display = '';
        discountPercent.style.display = '';
    } else {
        originalPrice.style.display = 'none';
        discountPercent.style.display = 'none';
    }
}

function updatePriceAndRating(product, normalized) {
    const salePrice = Number(normalized?.price ?? product?.sale_price ?? product?.salePrice ?? 0);
    const basePrice = Number(normalized?.basePrice ?? product?.base_price ?? product?.price ?? salePrice);
    const currentPrice = salePrice > 0 ? salePrice : basePrice;
    const effectiveBasePrice = basePrice >= currentPrice ? basePrice : currentPrice;
    applyPriceDisplay(currentPrice, effectiveBasePrice);
    return { currentPrice, basePrice: effectiveBasePrice };
}

const gallery = createGallery({ state, getPdpEl, updateStickyContent });
const sizeManager = createSizeManager({
    state,
    getPdpEl,
    esc,
    safeHexColor,
    displayImages: (images) => gallery.displayImages(images),
    updateSku,
    updateStockPill,
    applyPriceDisplay,
    setPdpInlineMessage,
    updateAddToCartState
});
const deliveryChecker = createDeliveryChecker({ getPdpEl, getProductSlug, ensureApiReady, esc });

async function displayProduct(product) {
    const normalized = normalizeForDisplayProduct(product);
    const categoryName = normalized?.category || product?.category?.name || product?.category || 'Category';
    const categorySlug = product?.category?.slug || String(categoryName).toLowerCase().replace(/\s+/g, '-');
    const subcategoryName = product?.subcategory?.name || product?.subcategory || categoryName;

    state.activeVariants = extractVariants(product).filter((variant) => variant && variant.is_active !== false);
    document.title = `${product?.name || 'Product'} | Amzira`;
    getPdpEl('breadcrumbCategory').textContent = categoryName;
    getPdpEl('breadcrumbCategory').href = `category.html?slug=${encodeURIComponent(categorySlug)}`;
    getPdpEl('breadcrumbProduct').textContent = product?.name || 'Product';
    getPdpEl('productCategory').textContent = String(subcategoryName || '').toUpperCase().replace('-', ' ');
    getPdpEl('productTitle').textContent = normalized?.name || product?.name || 'Product';
    updateSku(product);
    const priceData = updatePriceAndRating(product, normalized);
    state.currentPriceValue = priceData?.currentPrice ?? 0;
    state.basePriceValue = priceData?.basePrice ?? state.currentPriceValue;

    if (normalized?.badge || product?.badge) {
        const badge = getPdpEl('productBadge');
        const badgeLabel = normalized?.badge || product?.badge;
        badge.textContent = badgeLabel;
        badge.className = `image-badge ${String(badgeLabel).toLowerCase()}`;
        badge.style.display = 'block';
    }

    state.defaultProductImages = normalized?.images || product?.images || [product?.primary_image || product?.image];
    gallery.displayImages(state.defaultProductImages);
    const colors = Array.isArray(product?.colors) && product.colors.length
        ? product.colors
        : (Array.isArray(normalized?.colors) && normalized.colors.length ? normalized.colors : Array.from(new Set(state.activeVariants.map((variant) => String(variant?.color || '').trim()).filter(Boolean))).map((name) => ({ name, hex: '#8B1538' })));
    const colorSection = getPdpEl('colorSection');
    if (colors.length > 0) {
        colorSection.style.display = 'block';
        sizeManager.displayColors(colors);
    } else {
        colorSection.style.display = 'none';
        sizeManager.displaySizes(state.activeVariants, null);
    }

    getPdpEl('productDescription').textContent = product?.description || 'Premium quality ethnic wear crafted with care.';
    getPdpEl('fabricInfo').textContent = `Made with ${product?.fabric || 'premium fabric'}.`;
    if (Array.isArray(product?.features) && product.features.length) {
        getPdpEl('productFeatures').innerHTML = product.features.map((feature) => `<li>${esc(feature)}</li>`).join('');
    }

    setViewedCount(product);
    await loadRelatedProducts(product, categoryName);
    updateStickyContent();
    updateStickyBar(false);
}

async function loadProduct() {
    const productSlug = getProductSlug();
    if (!productSlug) {
        setPdpInlineMessage('No product slug provided.', 'error');
        return;
    }

    try {
        setPdpInlineMessage('Please wait while we load this product.', 'info');
        await ensureApiReady();
        state.currentProduct = await window.AMZIRA.products.getProductDetail(encodeURIComponent(String(productSlug).trim()));
        if (!state.currentProduct) {
            setPdpInlineMessage('We could not find this product.', 'error');
            return;
        }
        await displayProduct(state.currentProduct);
    } catch (error) {
        setPdpInlineMessage(error?.message || 'Unable to load product.', 'error');
    }
}

async function handleAddToCart() {
    const addToCartBtn = getPdpEl('addToCartBtn');
    let added = false;
    if (state.addToCartInFlight) return;
    if (!state.selectedSize || !Number.isInteger(Number(state.selectedVariantId)) || Number(state.selectedVariantId) <= 0) {
        setPdpInlineMessage('Please choose color and size before adding to cart.', 'error');
        updateAddToCartState();
        return;
    }

    try {
        state.addToCartInFlight = true;
        if (window.loadingManager?.setButtonLoading) {
            window.loadingManager.setButtonLoading(addToCartBtn, true);
            addToCartBtn.textContent = 'Adding...';
        } else {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        }
        added = await window.cart.addItem(state.currentProduct, state.quantity, state.selectedSize, state.selectedColor);
        setPdpInlineMessage(
            added ? 'Added to cart. Secure payments and easy returns available.' : 'Unable to add this item right now. Please retry.',
            added ? 'success' : 'error'
        );
    } catch {
        setPdpInlineMessage('Unable to add this item right now. Please retry.', 'error');
    } finally {
        state.addToCartInFlight = false;
        if (window.loadingManager?.setButtonLoading) {
            window.loadingManager.setButtonLoading(addToCartBtn, false);
        } else {
            addToCartBtn.disabled = false;
        }
        updateAddToCartState();
    }
    if (state.pendingBuyNowRedirect) {
        state.pendingBuyNowRedirect = false;
        if (added) window.location.href = 'checkout.html';
    }
}

function initPdpTabs() {
    const host = getPdpEl('pdpTabsHost');
    if (!host || host.dataset.initialized === 'true') return;
    host.dataset.initialized = 'true';

    const tabsWrap = document.createElement('div');
    tabsWrap.className = 'pdp-tabs';

    const headers = document.createElement('div');
    headers.className = 'pdp-tab-headers';
    tabsWrap.appendChild(headers);

    const content = document.createElement('div');
    content.className = 'pdp-tab-content';
    tabsWrap.appendChild(content);

    const tabDefs = [
        { key: 'description', label: 'Description' },
        { key: 'fabric', label: 'Fabric & Care' },
        { key: 'qa', label: 'Questions & Answers' }
    ];

    tabDefs.forEach((tabDef, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `tab${index === 0 ? ' active' : ''}`;
        button.dataset.tab = tabDef.key;
        button.textContent = tabDef.label;
        headers.appendChild(button);
    });

    const descriptionPanel = document.createElement('div');
    descriptionPanel.id = 'description';
    descriptionPanel.className = 'tab-panel active';
    const descriptionHeading = document.createElement('h3');
    descriptionHeading.textContent = 'Product Description';
    descriptionPanel.appendChild(descriptionHeading);
    const productDescription = document.createElement('p');
    productDescription.id = 'productDescription';
    productDescription.textContent = 'Loading description...';
    descriptionPanel.appendChild(productDescription);
    const featureHeading = document.createElement('h3');
    featureHeading.textContent = 'Features';
    featureHeading.style.marginTop = '24px';
    descriptionPanel.appendChild(featureHeading);
    const productFeatures = document.createElement('ul');
    productFeatures.id = 'productFeatures';
    const defaultFeature = document.createElement('li');
    defaultFeature.textContent = 'Loading features...';
    productFeatures.appendChild(defaultFeature);
    descriptionPanel.appendChild(productFeatures);
    content.appendChild(descriptionPanel);

    const fabricPanel = document.createElement('div');
    fabricPanel.id = 'fabric';
    fabricPanel.className = 'tab-panel';
    const fabricHeading = document.createElement('h3');
    fabricHeading.textContent = 'Fabric Details';
    fabricPanel.appendChild(fabricHeading);
    const fabricInfo = document.createElement('p');
    fabricInfo.id = 'fabricInfo';
    fabricInfo.textContent = 'Premium fabric with intricate craftsmanship.';
    fabricPanel.appendChild(fabricInfo);
    const careHeading = document.createElement('h3');
    careHeading.textContent = 'Care Instructions';
    careHeading.style.marginTop = '24px';
    fabricPanel.appendChild(careHeading);
    const careList = document.createElement('ul');
    ['Dry clean only', 'Do not bleach', 'Iron on low heat', 'Store in a cool, dry place'].forEach((itemText) => {
        const li = document.createElement('li');
        li.textContent = itemText;
        careList.appendChild(li);
    });
    fabricPanel.appendChild(careList);
    content.appendChild(fabricPanel);

    const qaPanel = document.createElement('div');
    qaPanel.id = 'qa';
    qaPanel.className = 'tab-panel';
    const qaHeading = document.createElement('h3');
    qaHeading.textContent = 'Questions & Answers';
    qaPanel.appendChild(qaHeading);
    const qaPlaceholder = document.createElement('p');
    qaPlaceholder.textContent = 'Questions and answers are not active yet. Please contact support for product-specific help.';
    qaPanel.appendChild(qaPlaceholder);
    content.appendChild(qaPanel);

    headers.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('.tab') : null;
        if (!(target instanceof HTMLElement)) return;
        const targetTab = target.dataset.tab;
        if (!targetTab) return;

        headers.querySelectorAll('.tab').forEach((tabEl) => tabEl.classList.remove('active'));
        content.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
        target.classList.add('active');
        const panel = content.querySelector(`#${targetTab}`);
        if (panel) panel.classList.add('active');
    });

    host.appendChild(tabsWrap);
}

function bindQuantityControls() {
    const qtyMinus = getPdpEl('qtyMinus');
    const qtyPlus = getPdpEl('qtyPlus');
    const qtyInput = getPdpEl('qtyInput');
    const stickyQtyMinus = getPdpEl('stickyQtyMinus');
    const stickyQtyPlus = getPdpEl('stickyQtyPlus');
    const stickyQtyInput = getPdpEl('stickyQtyInput');

    function syncQuantityInputs() {
        if (qtyInput) qtyInput.value = String(state.quantity);
        if (stickyQtyInput) stickyQtyInput.value = String(state.quantity);
    }

    function setQuantity(nextQuantity) {
        const safeQuantity = Math.max(1, Math.min(10, Number(nextQuantity) || 1));
        state.quantity = safeQuantity;
        syncQuantityInputs();
    }

    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
            if (state.quantity > 1) setQuantity(state.quantity - 1);
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
            if (state.quantity < 10) setQuantity(state.quantity + 1);
        });
    }

    if (stickyQtyMinus) {
        stickyQtyMinus.addEventListener('click', () => {
            if (state.quantity > 1) setQuantity(state.quantity - 1);
        });
    }

    if (stickyQtyPlus) {
        stickyQtyPlus.addEventListener('click', () => {
            if (state.quantity < 10) setQuantity(state.quantity + 1);
        });
    }

    syncQuantityInputs();
}

function bindWishlist() {
    const wishlistBtn = getPdpEl('addToWishlist');
    if (!wishlistBtn) return;
    wishlistBtn.addEventListener('click', function toggleWishlist() {
        let wishlist = JSON.parse(localStorage.getItem('amziraWishlist') || '[]');
        const icon = this.querySelector('i');
        const wishlistKey = state.currentProduct?.slug || state.currentProduct?.id;

        if (wishlistKey && wishlist.includes(wishlistKey)) {
            wishlist = wishlist.filter((id) => id !== wishlistKey);
            icon.classList.remove('fas');
            icon.classList.add('far');
            window.cart.showNotification('Removed from wishlist', 'info');
        } else {
            if (wishlistKey) wishlist.push(wishlistKey);
            icon.classList.remove('far');
            icon.classList.add('fas');
            window.cart.showNotification('Added to wishlist', 'success');
        }
        localStorage.setItem('amziraWishlist', JSON.stringify(wishlist));
    });
}

function bindAddToCartButtons() {
    const addToCartBtn = getPdpEl('addToCartBtn');
    const stickyAddBtn = getPdpEl('stickyAddToCartBtn');
    const stickyBuyNowBtn = getPdpEl('stickyBuyNowBtn');

    if (addToCartBtn) addToCartBtn.addEventListener('click', handleAddToCart);
    if (stickyAddBtn) stickyAddBtn.addEventListener('click', handleAddToCart);
    if (stickyBuyNowBtn) {
        stickyBuyNowBtn.addEventListener('click', () => {
            state.pendingBuyNowRedirect = true;
            handleAddToCart();
        });
    }
}

function hydrateWishlistIcon() {
    const wishlist = JSON.parse(localStorage.getItem('amziraWishlist') || '[]');
    const productSlug = getProductSlug();
    if (productSlug && wishlist.includes(productSlug)) {
        const icon = document.querySelector('#addToWishlist i');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initPdpTabs();
    loadProduct();
    ensurePdpInlineMessage();
    setPdpInlineMessage('Secure payments, easy returns, and delivery clarity at checkout.', 'info');
    updateAddToCartState();
    updateStickyBar(true);

    hydrateWishlistIcon();
    bindQuantityControls();
    bindAddToCartButtons();
    bindWishlist();
    sizeManager.bindStickySizeSelect();
    sizeManager.bindSizeChart();
    deliveryChecker.bindDeliveryControls();
    gallery.bindShareActions();

    setTimeout(() => {
        gallery.initImageZoom();
    }, 500);

    window.addEventListener('resize', gallery.adjustImageContainerHeight);
});

window.addEventListener('load', () => {
    gallery.adjustImageContainerHeight();
});

window.addEventListener('scroll', () => updateStickyBar(false), { passive: true });
window.addEventListener('resize', () => updateStickyBar(false));
