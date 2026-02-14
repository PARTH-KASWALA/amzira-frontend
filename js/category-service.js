(function initCategoryService(global) {
    'use strict';

    const CACHE_KEY = 'amzira_categories_v1';
    const CACHE_TTL_MS = 10 * 60 * 1000;

    function toText(value) {
        return value == null ? '' : String(value).trim();
    }

    function toSlug(value) {
        return toText(value).toLowerCase();
    }

    function normalizeCategory(input) {
        if (!input || typeof input !== 'object') return null;

        const id = input.id;
        const name = toText(input.name);
        const slug = toSlug(input.slug || input.name);
        if (!name || !slug) return null;

        return {
            id,
            name,
            slug,
            description: toText(input.description),
            imageUrl: toText(input.image_url || input.imageUrl),
            displayOrder: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : Number.MAX_SAFE_INTEGER,
            isActive: input.is_active !== false
        };
    }

    function parseCache() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (!Array.isArray(parsed.data)) return null;
            if (!Number.isFinite(Number(parsed.expiresAt))) return null;
            return parsed;
        } catch (_) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }
    }

    function getCachedCategories() {
        const cached = parseCache();
        if (!cached) return null;
        if (Date.now() >= Number(cached.expiresAt)) {
            sessionStorage.removeItem(CACHE_KEY);
            return null;
        }

        return cached.data
            .map(normalizeCategory)
            .filter(Boolean)
            .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    function setCachedCategories(categories) {
        const normalized = Array.isArray(categories)
            ? categories.map(normalizeCategory).filter(Boolean)
            : [];

        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
                data: normalized,
                expiresAt: Date.now() + CACHE_TTL_MS
            })
        );

        return normalized;
    }

    async function ensureApiLayer() {
        if (global.AMZIRA && global.AMZIRA.apiRequest) return;

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

    async function fetchCategoriesFromApi() {
        await ensureApiLayer();

        let response;
        if (global.AMZIRA?.categories?.getCategories) {
            response = await global.AMZIRA.categories.getCategories();
        } else if (global.AMZIRA?.apiRequest) {
            response = await global.AMZIRA.apiRequest('/categories');
        } else {
            throw new Error('API client unavailable');
        }

        const list = response?.data
            || response?.categories
            || response?.results
            || (Array.isArray(response) ? response : []);
        return list
            .map(normalizeCategory)
            .filter((category) => category && category.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    async function getCategories(options) {
        const forceRefresh = Boolean(options && options.forceRefresh);

        if (!forceRefresh) {
            const cached = getCachedCategories();
            if (cached) return cached;
        }

        const categories = await fetchCategoriesFromApi();
        return setCachedCategories(categories);
    }

    function getCategoryUrl(slug) {
        return `category.html?slug=${encodeURIComponent(toSlug(slug))}`;
    }

    function getCurrentCategorySlug() {
        const pathname = (global.location?.pathname || '').toLowerCase();
        const fileName = pathname.split('/').pop() || '';
        if (fileName === 'men.html') return 'men';
        if (fileName === 'women.html') return 'women';
        if (fileName === 'kids.html') return 'kids';

        const urlParams = new URLSearchParams(global.location?.search || '');
        return toSlug(urlParams.get('slug'));
    }

    function findCategoryBySlug(slug, categories) {
        const normalizedSlug = toSlug(slug);
        if (!normalizedSlug || !Array.isArray(categories)) return null;
        return categories.find((category) => category.slug === normalizedSlug) || null;
    }

    global.AMZIRACategoryService = {
        CACHE_KEY,
        CACHE_TTL_MS,
        getCategories,
        getCachedCategories,
        findCategoryBySlug,
        getCategoryUrl,
        getCurrentCategorySlug,
        setCachedCategories,
        normalizeCategory,
        ensureApiLayer
    };
})(window);
