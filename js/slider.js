/* ===================================
   SLIDER FUNCTIONALITY
   Using Swiper.js for all carousels
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    const esc = (value) => {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    };

    // Backend product image resolver (UI contract: return a usable string URL or placeholder).
    // Keep as a single source of truth for "Shop By Occasion" images.
    function resolveProductImage(product) {
        if (product.primary_image) return product.primary_image;

        if (Array.isArray(product.images) && product.images.length > 0) {
            if (typeof product.images[0] === "string") return product.images[0];
            if (product.images[0].url) return product.images[0].url;
        }

        return "/assets/images/placeholder-product.jpg";
    }

    // Occasion-specific resolver with explicit fallback.
    function resolveOccasionImage(product, defaultImage) {
        if (product && product.primary_image) return product.primary_image;

        if (product && Array.isArray(product.images) && product.images.length > 0) {
            const first = product.images[0];
            if (typeof first === "string") return first;
            if (first && typeof first === "object" && first.url) return first.url;
        }

        return defaultImage;
    }

    function getMediaBaseUrl() {
        const apiBase = window.AMZIRA && typeof window.AMZIRA.API_BASE_URL === 'string' ? window.AMZIRA.API_BASE_URL : '';
        if (!apiBase) return '';
        // Convert ".../api/v1" -> "..."
        return apiBase.replace(/\/api\/v\d+\/?$/, '');
    }

    function toAbsoluteImageUrl(url) {
        if (typeof url !== 'string') return '';
        const trimmed = url.trim();
        if (!trimmed) return '';
        if (/^(data:|blob:|https?:)?\/\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) return trimmed;

        // Local static assets should stay relative to the current site.
        if (trimmed.startsWith('images/')) return trimmed;
        if (trimmed.startsWith('/images/')) return trimmed;
        if (trimmed.startsWith('/assets/')) return trimmed;

        const mediaBase = getMediaBaseUrl();
        if (!mediaBase) return trimmed;

        if (trimmed.startsWith('/')) return `${mediaBase}${trimmed}`;
        return `${mediaBase}/${trimmed}`;
    }

    function productIdentityKey(product) {
        const key = product?.id || product?.slug || product?.product_id || product?._id || '';
        return String(key || '').trim();
    }

    function getProductOccasionSet(product) {
        const set = new Set();
        const add = (value) => {
            const v = String(value || '').trim().toLowerCase();
            if (v) set.add(v);
        };

        add(product?.occasion);
        if (Array.isArray(product?.occasions)) product.occasions.forEach(add);
        if (Array.isArray(product?.tags)) product.tags.forEach(add);
        // Some backends encode occasion in category/subcategory labels.
        add(product?.subcategory);
        add(product?.category?.name);
        add(product?.category);
        return set;
    }

    function pickProductsForOccasionCards(products, occasions) {
        const list = Array.isArray(products) ? products : [];
        const used = new Set();
        const remaining = list.slice();
        const picks = new Map();

        const tryPick = (predicate) => {
            for (const product of remaining) {
                const key = productIdentityKey(product);
                if (!key || used.has(key)) continue;
                if (!predicate(product)) continue;
                used.add(key);
                return product;
            }
            return null;
        };

        occasions.forEach((occasion) => {
            const needle = String(occasion || '').trim().toLowerCase();
            const picked = tryPick((product) => {
                const occSet = getProductOccasionSet(product);
                return occSet.has(needle);
            }) || tryPick(() => true);

            if (picked) picks.set(occasion, picked);
        });

        return picks;
    }

    function getProductIdValue(product) {
        return product?.id || product?._id || product?.product_id || product?.slug || '';
    }

    function getProductNameValue(product) {
        return product?.name || product?.title || '';
    }

    function normalizeTagValue(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getProductTagSet(product) {
        const set = new Set();
        const add = (value) => {
            const v = normalizeTagValue(value);
            if (v) set.add(v);
        };

        if (Array.isArray(product?.tags)) product.tags.forEach(add);
        if (typeof product?.tags === 'string') product.tags.split(',').forEach(add);
        add(product?.occasion);
        if (Array.isArray(product?.occasions)) product.occasions.forEach(add);
        return set;
    }

    function hasOccasionTag(product, key) {
        const needle = normalizeTagValue(key);
        if (!needle) return false;
        const tags = getProductTagSet(product);
        return tags.has(needle);
    }
    /* UI LOCK: Hero images bound via data-bg — production ready */
    const bindHeroSlideBackgrounds = () => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const heroSlides = document.querySelectorAll('.hero-swiper .hero-slide[data-bg]');

        heroSlides.forEach((slide) => {
            const desktopBg = slide.getAttribute('data-bg');
            const mobileBg = slide.getAttribute('data-bg-mobile');
            const selected = isMobile && mobileBg ? mobileBg : desktopBg;
            if (!selected) return;

            slide.style.setProperty('background-image', `url("${selected}")`, 'important');
            slide.style.setProperty('background-size', 'cover', 'important');
            slide.style.setProperty('background-position', 'center', 'important');
            slide.style.setProperty('background-repeat', 'no-repeat', 'important');
        });
    };

    bindHeroSlideBackgrounds();
    window.addEventListener('resize', bindHeroSlideBackgrounds);
    
    // UI LOCK: Hero slider — 4 slides, production-ready
    // Hero Slider
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        speed: 1000,
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },
        autoplay: {
            delay: 7000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    
    // UI LOCK: New Arrivals mirrors Bestsellers behavior
    const newArrivalsSwiper = new Swiper('#newArrivalsSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        slidesPerGroup: 1,
        speed: 620,
        loop: true,
        observer: true,
        observeParents: true,
        watchOverflow: true,
        autoplay: {
            delay: 7600,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        navigation: {
            nextEl: '#newArrivalsNext',
            prevEl: '#newArrivalsPrev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
        },
    });
    
    // UI LOCK: Bestsellers slider — static fallback enabled, production-safe
    // Bestsellers Slider
    const bestsellersSwiper = new Swiper('#bestsellersSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        slidesPerGroup: 1,
        speed: 620,
        loop: true,
        observer: true,
        observeParents: true,
        watchOverflow: true,
        autoplay: {
            delay: 7600,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        navigation: {
            nextEl: '#bestsellersNext',
            prevEl: '#bestsellersPrev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
        },
    });

    const occasionSlidesEl = document.getElementById('occasionSlides');
    if (occasionSlidesEl) {
        const OCCASIONS = ['Wedding', 'Reception', 'Engagement', 'Sangeet', 'Mehendi'];

        const occasionData = {
            men: [
                { title: 'Wedding', image: 'images/occasions/wedding.jpg', href: 'men.html?occasion=wedding' },
                { title: 'Reception', image: 'images/occasions/reception.jpg', href: 'men.html?occasion=reception' },
                { title: 'Engagement', image: 'images/occasions/engagement.jpg', href: 'men.html?occasion=engagement' },
                { title: 'Sangeet', image: 'images/occasions/sangeet.jpg', href: 'men.html?occasion=sangeet' },
                { title: 'Mehendi', image: 'images/occasions/mehendi.jpg', href: 'men.html?occasion=mehendi' }
            ],
            women: [
                { title: 'Wedding', image: 'images/occasions/bride.jpg', href: 'women.html?occasion=wedding' },
                { title: 'Reception', image: 'images/occasions/bride_side.jpg', href: 'women.html?occasion=reception' },
                { title: 'Engagement', image: 'images/occasions/engagement.jpg', href: 'women.html?occasion=engagement' },
                { title: 'Sangeet', image: 'images/occasions/sangeet.jpg', href: 'women.html?occasion=sangeet' },
                { title: 'Mehendi', image: 'images/occasions/mehendi.jpg', href: 'women.html?occasion=mehendi' }
            ]
        };

        function applyBackendOccasionImages(gender, products) {
            const cards = occasionData[gender];
            if (!Array.isArray(cards) || cards.length === 0) return;
            const list = Array.isArray(products) ? products : [];
            if (!list.length) return;

            const placeholderImages = {
                wedding: cards[0]?.image,
                reception: cards[1]?.image,
                engagement: cards[2]?.image,
                sangeet: cards[3]?.image,
                mehendi: cards[4]?.image,
            };

            const used = new Set();
            const pickByOccasion = (key) => {
                for (const product of list) {
                    const id = getProductIdValue(product);
                    if (!id || used.has(id)) continue;
                    if (!hasOccasionTag(product, key)) continue;
                    used.add(id);
                    return product;
                }
                return null;
            };

            const occasionMapping = {
                wedding: pickByOccasion('wedding'),
                reception: pickByOccasion('reception'),
                engagement: pickByOccasion('engagement'),
                sangeet: pickByOccasion('sangeet'),
                mehendi: pickByOccasion('mehendi'),
            };

            cards.forEach((card) => {
                const key = normalizeTagValue(card.title);
                const product = occasionMapping[key];
                const fallback = placeholderImages[key] || card.image;

                if (!product) {
                    card.image = fallback;
                    return;
                }

                const productId = getProductIdValue(product);
                const productName = getProductNameValue(product);
                if (!productId || !String(productName || '').trim()) {
                    card.image = fallback;
                    return;
                }

                // Support common backend variants via a non-mutating shim.
                const firstImage = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : null;
                const shimmed = (firstImage && typeof firstImage === 'object' && !firstImage.url && firstImage.image_url)
                    ? { ...product, images: [{ ...firstImage, url: firstImage.image_url }, ...product.images.slice(1)] }
                    : product;

                const resolved = resolveOccasionImage(shimmed, fallback);
                const absolute = toAbsoluteImageUrl(resolved);
                if (!absolute) {
                    card.image = fallback;
                    return;
                }
                card.image = absolute;
            });
        }

        const renderOccasionSlides = (gender) => {
            const cards = occasionData[gender] || [];
            occasionSlidesEl.innerHTML = cards.map((card) => `
                <a href="${esc(card.href)}" class="swiper-slide occasion-card" aria-label="${esc(card.title)}">
                    <img src="${esc(card.image)}" alt="${esc(card.title)}" onerror="this.onerror=null;this.src='images/categories/occasion.jpg';">
                    <h3>${esc(card.title)}</h3>
                </a>
            `).join('');
        };

        let activeOccasionTab = 'men';
        renderOccasionSlides(activeOccasionTab);

        const occasionSwiper = new Swiper('#occasionSwiper', {
            slidesPerView: 1.15,
            spaceBetween: 14,
            speed: 620,
            navigation: {
                nextEl: '.occasion-next',
                prevEl: '.occasion-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2.15,
                    spaceBetween: 16,
                },
                768: {
                    slidesPerView: 2.6,
                    spaceBetween: 18,
                },
                1024: {
                    slidesPerView: 5,
                    spaceBetween: 16,
                },
            },
        });

        const tabButtons = document.querySelectorAll('[data-occasion-tab]');
        tabButtons.forEach((tab) => {
            tab.addEventListener('click', () => {
                const selected = tab.getAttribute('data-occasion-tab');
                activeOccasionTab = selected || 'men';
                tabButtons.forEach((btn) => {
                    const active = btn === tab;
                    btn.classList.toggle('is-active', active);
                    btn.setAttribute('aria-selected', String(active));
                });

                renderOccasionSlides(activeOccasionTab);
                occasionSwiper.slideTo(0, 0);
                occasionSwiper.update();
            });
        });

        // If backend data already exists (rare, but possible), apply it without changing card structure.
        const apiData = window.__AMZIRA_HOME_OCCASION_PRODUCTS__;
        if (apiData && (Array.isArray(apiData.men) || Array.isArray(apiData.women))) {
            if (Array.isArray(apiData.men) && apiData.men.length) applyBackendOccasionImages('men', apiData.men);
            if (Array.isArray(apiData.women) && apiData.women.length) applyBackendOccasionImages('women', apiData.women);
            renderOccasionSlides(activeOccasionTab);
            occasionSwiper.update();
        }

        window.addEventListener('appReady', function() {
            const latest = window.__AMZIRA_HOME_OCCASION_PRODUCTS__;
            if (!latest) return;
            if (Array.isArray(latest.men) && latest.men.length) applyBackendOccasionImages('men', latest.men);
            if (Array.isArray(latest.women) && latest.women.length) applyBackendOccasionImages('women', latest.women);
            renderOccasionSlides(activeOccasionTab);
            occasionSwiper.update();
        });
    }
    
    // Product Detail Image Gallery (if exists)
    const galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        direction: 'vertical',
    });
    
    const galleryMain = new Swiper('.gallery-main', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        thumbs: {
            swiper: galleryThumbs,
        },
    });
    
    // Similar Products Slider (Product Detail Page)
    const similarSwiper = new Swiper('#similarSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        slidesPerGroup: 4,
        speed: 600,
        navigation: {
            nextEl: '#similarNext',
            prevEl: '#similarPrev',
        },
        breakpoints: {
            480: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },
            768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            },
            1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
            },
        },
    });
    
    // Customer Reviews Carousel
    const reviewsSwiper = new Swiper('.reviews-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        speed: 640,
        // Pre-launch UI polish — Manyavar standard
        autoplay: {
            delay: 6200,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.reviews-swiper .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
    });

    // Re-sync sliders after dynamic product DOM updates.
    window.addEventListener('appReady', function() {
        try {
            newArrivalsSwiper.update();
            bestsellersSwiper.update();
            const occasionSwiperEl = document.querySelector('#occasionSwiper');
            if (occasionSwiperEl && occasionSwiperEl.swiper) {
                occasionSwiperEl.swiper.update();
            }
            if (newArrivalsSwiper.autoplay) newArrivalsSwiper.autoplay.start();
            if (bestsellersSwiper.autoplay) bestsellersSwiper.autoplay.start();
        } catch (e) {
            console.warn('Slider refresh after appReady failed:', e);
        }
    });
    
    console.log('Sliders initialized successfully!');
});
