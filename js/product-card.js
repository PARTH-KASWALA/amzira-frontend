(function initProductCards(global) {
    'use strict';

    function toText(value, fallback) {
        const raw = value == null ? '' : String(value).trim();
        if (raw) return raw;
        return fallback == null ? '' : String(fallback);
    }

    function toNumber(value, fallback) {
        const n = Number(value);
        if (Number.isFinite(n)) return n;
        return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
    }

    function getProductId(product) {
        return toText(product?.slug || product?.handle || product?.url_slug || product?.seo_slug || product?.permalink);
    }

    function getProductName(product) {
        return toText(product?.name || product?.title, 'Product');
    }

    function getProductImage(product) {
        if (Array.isArray(product?.images) && product.images.length > 0) {
            const first = product.images[0];
            if (typeof first === 'string') return first;
            if (first && typeof first === 'object') {
                return toText(first.url || first.image_url || first.src);
            }
        }

        return toText(
            product?.primary_image ||
            product?.image_url ||
            product?.image ||
            product?.thumbnail ||
            product?.image_front ||
            product?.imageFront,
            'images/products/product-1-front.jpg'
        );
    }

    function getPrices(product) {
        const sale = toNumber(product?.sale_price ?? product?.salePrice ?? product?.price ?? product?.base_price, 0);
        const original = toNumber(product?.base_price ?? product?.price ?? product?.mrp ?? product?.original_price ?? sale, sale);
        const currentPrice = sale > 0 ? sale : original;
        const originalPrice = original >= currentPrice ? original : currentPrice;
        return { currentPrice, originalPrice };
    }

    function getCategoryLabel(product) {
        if (product?.category && typeof product.category === 'object') {
            return toText(product.category.name);
        }
        return toText(product?.category || product?.subcategory || '');
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

    function getDiscountPercent(product, currentPrice, originalPrice) {
        const backendDiscount = toNumber(product?.discount_percentage ?? product?.discountPercent ?? product?.discount, NaN);
        if (Number.isFinite(backendDiscount) && backendDiscount > 0) {
            return Math.round(backendDiscount);
        }

        if (originalPrice > currentPrice && currentPrice >= 0) {
            return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }

        return 0;
    }

    function getStockQuantity(product) {
        const quantity = toNumber(
            product?.stock_quantity ??
            product?.stock ??
            product?.inventory ??
            product?.available_quantity ??
            product?.quantity,
            0
        );

        return quantity < 0 ? 0 : quantity;
    }

    function buildProductDetailUrl(product) {
        const raw = toText(product?.slug || product?.handle || product?.url_slug || product?.seo_slug || product?.permalink);
        const identifier = String(raw || '').trim();
        return identifier ? `product-detail.html?slug=${encodeURIComponent(identifier)}` : '#';
    }

    function formatCurrency(value, locale, currency) {
        const amount = toNumber(value, 0);
        try {
            return new Intl.NumberFormat(locale || 'en-IN', {
                style: 'currency',
                currency: currency || 'INR',
                maximumFractionDigits: 0
            }).format(amount);
        } catch (_) {
            return `₹${Math.round(amount)}`;
        }
    }

    function createStockBadge(stockQuantity) {
        const badge = document.createElement('span');
        badge.className = 'stock-badge';

        if (stockQuantity < 1) {
            badge.classList.add('out-of-stock');
            badge.textContent = 'Out of Stock';
        } else if (stockQuantity < 5) {
            badge.classList.add('low-stock');
            badge.textContent = 'Low Stock';
        } else {
            badge.classList.add('in-stock');
            badge.textContent = 'In Stock';
        }

        return badge;
    }

    function createProductCard(product, options) {
        const opts = options || {};
        const name = getProductName(product);
        const imageUrl = getProductImage(product);
        const productId = getProductId(product);
        const stockQuantity = getStockQuantity(product);
        const outOfStock = stockQuantity < 1;
        const categoryLabel = getCategoryLabel(product);
        const variantId = getDefaultVariantId(product);
        const listingAddToCartDisabled = isListingAddToCartDisabled(product);
        const prices = getPrices(product);
        const discountPercent = getDiscountPercent(product, prices.currentPrice, prices.originalPrice);

        const card = document.createElement('article');
        card.className = 'product-card amzira-product-card';

        const imageWrap = document.createElement('div');
        imageWrap.className = 'product-image category-product-image';

        const productLink = document.createElement('a');
        productLink.className = 'product-image-link';
        productLink.href = buildProductDetailUrl(product);
        productLink.setAttribute('aria-label', `${name} details`);

        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = name;
        image.loading = 'lazy';
        image.decoding = 'async';

        productLink.appendChild(image);
        imageWrap.appendChild(productLink);
        imageWrap.appendChild(createStockBadge(stockQuantity));

        const info = document.createElement('div');
        info.className = 'product-info';

        const title = document.createElement('h3');
        title.className = 'product-name';
        const titleLink = document.createElement('a');
        titleLink.href = buildProductDetailUrl(product);
        titleLink.textContent = name;
        title.appendChild(titleLink);

        if (categoryLabel) {
            const category = document.createElement('p');
            category.className = 'product-category';
            category.textContent = categoryLabel;
            info.appendChild(category);
        }

        const priceWrap = document.createElement('div');
        priceWrap.className = 'product-price';

        const currentPrice = document.createElement('span');
        currentPrice.className = 'price-current';
        currentPrice.textContent = formatCurrency(prices.currentPrice, opts.locale, opts.currency);
        priceWrap.appendChild(currentPrice);

        if (prices.originalPrice > prices.currentPrice) {
            const originalPrice = document.createElement('span');
            originalPrice.className = 'price-original';
            originalPrice.textContent = formatCurrency(prices.originalPrice, opts.locale, opts.currency);
            priceWrap.appendChild(originalPrice);
        }

        if (discountPercent > 0) {
            const discount = document.createElement('span');
            discount.className = 'price-discount';
            discount.textContent = `${discountPercent}% OFF`;
            priceWrap.appendChild(discount);
        }

        const stockText = document.createElement('p');
        stockText.className = 'product-stock-text';
        stockText.textContent = outOfStock ? 'Currently unavailable' : `${stockQuantity} in stock`;

        let cta;
        if (listingAddToCartDisabled) {
            cta = document.createElement('a');
            cta.className = 'btn btn-secondary btn-block';
            cta.href = buildProductDetailUrl(product);
            cta.textContent = 'View Details';
        } else {
            cta = document.createElement('button');
            cta.type = 'button';
            cta.className = 'btn btn-primary btn-block add-to-cart-btn';
            cta.dataset.productId = productId;
            if (variantId) cta.dataset.variantId = String(variantId);
        }

        if (!listingAddToCartDisabled && outOfStock) {
            cta.disabled = true;
            cta.classList.add('disabled');
            cta.textContent = 'Out of Stock';
        } else if (!listingAddToCartDisabled && !variantId) {
            cta.disabled = true;
            cta.classList.add('disabled');
            cta.textContent = 'Please select size/color';
        } else if (!listingAddToCartDisabled) {
            cta.textContent = 'Add to Cart';
            if (typeof opts.onAddToCart === 'function') {
                cta.addEventListener('click', function onClick() {
                    opts.onAddToCart(product, cta);
                });
            }
        }

        info.appendChild(title);
        info.appendChild(priceWrap);
        info.appendChild(stockText);
        info.appendChild(cta);

        card.appendChild(imageWrap);
        card.appendChild(info);

        return card;
    }

    function createProductSkeletonCard() {
        const card = document.createElement('article');
        card.className = 'product-card category-skeleton-card';

        const image = document.createElement('div');
        image.className = 'category-skeleton-block category-skeleton-image';

        const lineOne = document.createElement('div');
        lineOne.className = 'category-skeleton-block category-skeleton-line';

        const lineTwo = document.createElement('div');
        lineTwo.className = 'category-skeleton-block category-skeleton-line short';

        const button = document.createElement('div');
        button.className = 'category-skeleton-block category-skeleton-button';

        card.appendChild(image);
        card.appendChild(lineOne);
        card.appendChild(lineTwo);
        card.appendChild(button);

        return card;
    }

    global.AMZIRAProductCards = {
        createProductCard,
        createProductSkeletonCard,
        getStockQuantity,
        formatCurrency
    };
})(window);
