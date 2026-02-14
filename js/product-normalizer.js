/* ===================================
   Product Normalizer
   Defensive schema for inconsistent backend data
   =================================== */

(function initProductNormalizer(global) {
    'use strict';

    const PRODUCT_SCHEMA = {
        id: null,
        name: '',
        category: '',
        price: 0,
        basePrice: 0,
        discount: 0,
        images: [],
        mainImage: '',
        colors: [],
        sizes: [],
        inStock: true,
        badge: null,
        rating: 0,
        reviews: 0
    };

    function toNumber(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function resolveAssetUrl(url) {
        if (typeof url !== 'string') return '';
        if (!url.trim()) return '';
        if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
            return url;
        }
        const apiBase = global?.AMZIRA?.API_BASE_URL || '';
        const assetBase = apiBase.replace(/\/api\/v1\/?$/, '');
        if (url.startsWith('/static/')) {
            return assetBase ? `${assetBase}${url}` : url;
        }
        if (url.startsWith('static/')) {
            return assetBase ? `${assetBase}/${url}` : url;
        }
        return url;
    }

    function normalizeImages(raw) {
        if (!raw) return [];
        if (Array.isArray(raw.images)) {
            return raw.images
                .map((image) => {
                    if (!image) return '';
                    if (typeof image === 'string') return resolveAssetUrl(image);
                    if (typeof image === 'object') return resolveAssetUrl(image.image_url || image.url || image.src || '');
                    return '';
                })
                .filter(Boolean);
        }
        if (Array.isArray(raw.image)) return raw.image.map(resolveAssetUrl).filter(Boolean);
        if (typeof raw.image === 'string') return [resolveAssetUrl(raw.image)];
        if (typeof raw.image_url === 'string') return [resolveAssetUrl(raw.image_url)];
        if (typeof raw.thumbnail === 'string') return [resolveAssetUrl(raw.thumbnail)];
        return [];
    }

    function resolveMainImage(raw, images) {
        if (Array.isArray(images) && images.length > 0) return images[0];
        if (typeof raw.image_url === 'string') return resolveAssetUrl(raw.image_url);
        if (typeof raw.thumbnail === 'string') return resolveAssetUrl(raw.thumbnail);
        if (typeof raw.primary_image === 'string') return resolveAssetUrl(raw.primary_image);
        if (typeof raw.image === 'string') return resolveAssetUrl(raw.image);
        return 'images/products/product-1-front.jpg';
    }

    function normalizeColors(raw) {
        if (Array.isArray(raw.colors)) return raw.colors;
        if (typeof raw.color === 'string' && raw.color.trim()) {
            return [{ name: raw.color.trim(), hex: '#000000' }];
        }
        return [];
    }

    function normalizeSizes(raw) {
        if (Array.isArray(raw.sizes)) return raw.sizes;
        if (typeof raw.size === 'string' && raw.size.trim()) return [raw.size.trim()];
        return [];
    }

    function normalizeProduct(raw) {
        if (!raw || typeof raw !== 'object') return null;

        const price = toNumber(
            raw.sale_price || raw.salePrice || raw.price || raw.selling_price || raw.current_price,
            0
        );
        const basePrice = toNumber(
            raw.base_price || raw.basePrice || raw.original_price || raw.mrp || raw.list_price,
            0
        );

        const images = normalizeImages(raw);
        const mainImage = resolveMainImage(raw, images);

        const computedDiscount = (() => {
            const priceValue = toNumber(price, 0);
            const baseValue = toNumber(basePrice, 0);
            if (!baseValue || !priceValue || baseValue <= priceValue) return 0;
            return Math.round(((baseValue - priceValue) / baseValue) * 100);
        })();

        return {
            id: raw.id || raw.product_id || raw._id || '',
            name: raw.name || raw.title || raw.product_name || 'Unnamed Product',
            category: typeof raw.category === 'string'
                ? raw.category
                : (raw.category && raw.category.name) || raw.category_name || raw.subcategory || 'Uncategorized',
            price,
            basePrice,
            discount: Number(raw.discount) || computedDiscount,
            images,
            mainImage,
            colors: normalizeColors(raw),
            sizes: normalizeSizes(raw),
            inStock: raw.in_stock !== false && raw.inStock !== false && raw.stock_status !== 'out_of_stock',
            badge:
                raw.badge ||
                (raw.is_new || raw.isNew ? 'new' : null) ||
                (raw.is_bestseller || raw.isBestseller ? 'bestseller' : null) ||
                (Number(raw.discount) > 20 ? 'sale' : null),
            rating: toNumber(raw.rating || raw.average_rating, 0),
            reviews: Math.max(0, Math.floor(toNumber(raw.reviews || raw.review_count, 0)))
        };
    }

    function normalizeProducts(rawProducts) {
        if (!Array.isArray(rawProducts)) return [];
        return rawProducts.map(normalizeProduct).filter(Boolean);
    }

    global.ProductNormalizer = {
        SCHEMA: PRODUCT_SCHEMA,
        normalize: normalizeProduct,
        normalizeMany: normalizeProducts
    };
})(window);
