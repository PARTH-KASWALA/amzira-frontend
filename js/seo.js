(function initSeoUtility(global) {
    'use strict';

    const BRAND_NAME = 'AMZIRA';
    const SITE_ORIGIN = 'https://www.amzira.com';
    const DEFAULT_BANNER_IMAGE = 'https://www.amzira.com/images/hero/hero-1.jpg';
    const DEFAULT_DESCRIPTION = 'Discover premium Indian ethnic wear for weddings, festivals, and special occasions at AMZIRA.';

    function toText(value, fallback) {
        const text = value == null ? '' : String(value).trim();
        if (text) return text;
        return fallback == null ? '' : String(fallback);
    }

    function normalizeSlug(value) {
        return toText(value).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    function capitalizeWords(value) {
        return toText(value)
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }

    function truncateText(value, maxLen) {
        const text = toText(value).replace(/\s+/g, ' ').trim();
        if (!text || text.length <= maxLen) return text;

        const truncated = text.slice(0, maxLen - 1);
        const safeCut = truncated.lastIndexOf(' ');
        return `${(safeCut > 20 ? truncated.slice(0, safeCut) : truncated).trim()}.`;
    }

    function buildCanonicalUrl(slug) {
        return `${SITE_ORIGIN}/category/${encodeURIComponent(normalizeSlug(slug))}`;
    }

    function normalizeImageUrl(imageUrl) {
        const value = toText(imageUrl);
        if (!value) return DEFAULT_BANNER_IMAGE;
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        if (value.startsWith('/')) return `${SITE_ORIGIN}${value}`;
        return `${SITE_ORIGIN}/${value}`;
    }

    function resolveTitle(categoryName) {
        const cleanName = capitalizeWords(categoryName);
        let candidate = `${cleanName} Ethnic Wear - Sherwani, Kurta & Wedding Outfits | ${BRAND_NAME}`;
        candidate = candidate.replace(/\s+/g, ' ').trim();

        if (candidate.length > 60) {
            candidate = `${cleanName} Ethnic Wear & Wedding Outfits | ${BRAND_NAME}`;
        }

        if (candidate.length > 60) {
            candidate = `${cleanName} Ethnic Wear | ${BRAND_NAME}`;
        }

        return truncateText(candidate, 60);
    }

    function resolveDescription(category) {
        const categoryName = capitalizeWords(category?.name || 'Category');
        const raw = toText(category?.description);

        if (raw) {
            return truncateText(raw, 160);
        }

        return truncateText(
            `Explore premium ${categoryName.toLowerCase()} ethnic wear including sherwanis, kurtas, wedding and festive outfits. Shop luxury Indian fashion at ${BRAND_NAME}.`,
            160
        );
    }

    function upsertMetaByName(name, content) {
        if (!name) return null;
        const existing = document.head.querySelectorAll(`meta[name="${name}"]`);
        let meta = existing[0] || null;
        existing.forEach((node, index) => {
            if (index > 0) node.remove();
        });
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', toText(content));
        return meta;
    }

    function upsertMetaByProperty(property, content) {
        if (!property) return null;
        const existing = document.head.querySelectorAll(`meta[property="${property}"]`);
        let meta = existing[0] || null;
        existing.forEach((node, index) => {
            if (index > 0) node.remove();
        });
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', toText(content));
        return meta;
    }

    function upsertCanonical(href) {
        const existing = document.head.querySelectorAll('link[rel="canonical"]');
        let canonical = existing[0] || null;
        existing.forEach((node, index) => {
            if (index > 0) node.remove();
        });
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', toText(href));
        return canonical;
    }

    function removeNoIndex() {
        const robots = document.head.querySelector('meta[name="robots"]');
        if (robots) {
            robots.remove();
        }
    }

    function setNoIndex() {
        upsertMetaByName('robots', 'noindex, nofollow');
    }

    function upsertStructuredData(payload) {
        const existing = document.head.querySelectorAll('script[data-amzira-seo="category-jsonld"]');
        let script = existing[0] || null;
        existing.forEach((node, index) => {
            if (index > 0) node.remove();
        });
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-amzira-seo', 'category-jsonld');
            document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(payload);
    }

    function applyCategorySEO(category, options) {
        const opts = options || {};
        const slug = normalizeSlug(opts.slug || category?.slug || category?.name);
        const categoryName = capitalizeWords(category?.name || 'Category');
        const title = resolveTitle(categoryName);
        const description = resolveDescription(category || {});
        const canonicalUrl = buildCanonicalUrl(slug);
        const imageUrl = normalizeImageUrl(category?.imageUrl || category?.image_url);

        document.title = title;
        upsertMetaByName('description', description);
        upsertCanonical(canonicalUrl);

        upsertMetaByProperty('og:title', `${categoryName} Ethnic Wear - ${BRAND_NAME}`);
        upsertMetaByProperty('og:description', description);
        upsertMetaByProperty('og:type', 'website');
        upsertMetaByProperty('og:url', canonicalUrl);
        upsertMetaByProperty('og:image', imageUrl);

        upsertMetaByName('twitter:card', 'summary_large_image');
        upsertMetaByName('twitter:title', `${categoryName} Ethnic Wear - ${BRAND_NAME}`);
        upsertMetaByName('twitter:description', description);
        upsertMetaByName('twitter:image', imageUrl);

        upsertStructuredData({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${categoryName} Ethnic Wear`,
            description,
            url: canonicalUrl
        });

        removeNoIndex();
    }

    function applyCategoryFallback(reason) {
        const fallbackTitle = `Category Not Found | ${BRAND_NAME}`;
        const fallbackDescription = DEFAULT_DESCRIPTION;

        document.title = fallbackTitle;
        upsertMetaByName('description', fallbackDescription);
        upsertCanonical(`${SITE_ORIGIN}/category`);

        upsertMetaByProperty('og:title', fallbackTitle);
        upsertMetaByProperty('og:description', fallbackDescription);
        upsertMetaByProperty('og:type', 'website');
        upsertMetaByProperty('og:url', `${SITE_ORIGIN}/category`);
        upsertMetaByProperty('og:image', DEFAULT_BANNER_IMAGE);

        upsertMetaByName('twitter:card', 'summary_large_image');
        upsertMetaByName('twitter:title', fallbackTitle);
        upsertMetaByName('twitter:description', fallbackDescription);
        upsertMetaByName('twitter:image', DEFAULT_BANNER_IMAGE);

        upsertStructuredData({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Category Not Found',
            description: `${fallbackDescription} ${toText(reason)}`.trim(),
            url: `${SITE_ORIGIN}/category`
        });

        setNoIndex();
    }

    global.SEO = {
        applyCategorySEO,
        applyCategoryFallback
    };
})(window);
