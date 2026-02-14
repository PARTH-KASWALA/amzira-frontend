(function initCategoryPage(global) {
    'use strict';

    function normalizeSlug(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getQueryParam(name) {
        const params = new URLSearchParams(global.location.search || '');
        return params.get(name);
    }

    function getPageParam() {
        const raw = Number(getQueryParam('page') || 1);
        if (!Number.isInteger(raw) || raw < 1) return 1;
        return raw;
    }

    function updatePageParam(nextPage) {
        const url = new URL(global.location.href);
        if (nextPage <= 1) {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', String(nextPage));
        }
        global.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }

    function ensureScript(src, marker) {
        if (marker && document.querySelector(`script[${marker}="true"]`)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            if (marker) script.setAttribute(marker, 'true');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    async function ensureDependencies() {
        if (!global.AMZIRACategoryService) {
            await ensureScript('js/category-service.js', 'data-amzira-category-service');
        }

        if (!global.AMZIRAProductCards) {
            await ensureScript('js/product-card.js', 'data-amzira-product-cards');
        }

        if (!global.SEO) {
            await ensureScript('js/seo.js', 'data-amzira-seo');
        }

        await global.AMZIRACategoryService.ensureApiLayer();
    }

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (!element) return;
        element.textContent = value;
    }

    function renderSkeleton(grid, count) {
        if (!grid || !global.AMZIRAProductCards) return;
        grid.replaceChildren();
        for (let i = 0; i < count; i += 1) {
            grid.appendChild(global.AMZIRAProductCards.createProductSkeletonCard());
        }
    }

    function renderState(root, title, message, options) {
        if (!root) return;
        root.replaceChildren();

        const state = document.createElement('section');
        state.className = 'category-state';

        const heading = document.createElement('h2');
        heading.textContent = title;
        state.appendChild(heading);

        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        state.appendChild(paragraph);

        if (options && options.buttonLabel && typeof options.onButtonClick === 'function') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary';
            button.textContent = options.buttonLabel;
            button.addEventListener('click', options.onButtonClick);
            state.appendChild(button);
        }

        root.appendChild(state);
    }

    function extractProducts(payload) {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.products)) return payload.products;
        if (Array.isArray(payload?.results)) return payload.results;
        return [];
    }

    function filterBySearch(products, searchTerm) {
        const term = String(searchTerm || '').trim().toLowerCase();
        if (!term) return products;

        return products.filter((product) => {
            const name = String(product?.name || product?.title || '').toLowerCase();
            return name.includes(term);
        });
    }

    function renderPagination(root, currentPage, totalPages, onPageChange) {
        if (!root) return;
        root.replaceChildren();

        if (!Number.isInteger(totalPages) || totalPages <= 1) return;

        const nav = document.createElement('nav');
        nav.className = 'pagination';
        nav.setAttribute('aria-label', 'Category pagination');

        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'pagination-btn';
        prev.textContent = 'Prev';
        prev.disabled = currentPage <= 1;
        prev.addEventListener('click', () => onPageChange(currentPage - 1));
        nav.appendChild(prev);

        const windowStart = Math.max(1, currentPage - 2);
        const windowEnd = Math.min(totalPages, currentPage + 2);

        for (let page = windowStart; page <= windowEnd; page += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `pagination-btn ${page === currentPage ? 'active' : ''}`;
            button.textContent = String(page);
            if (page === currentPage) {
                button.setAttribute('aria-current', 'page');
                button.disabled = true;
            } else {
                button.addEventListener('click', () => onPageChange(page));
            }
            nav.appendChild(button);
        }

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'pagination-btn';
        next.textContent = 'Next';
        next.disabled = currentPage >= totalPages;
        next.addEventListener('click', () => onPageChange(currentPage + 1));
        nav.appendChild(next);

        root.appendChild(nav);
    }

    async function addToCart(product, button) {
        if (!product || !button) return;

        if (!global.cart || typeof global.cart.addItem !== 'function') {
            if (global.errorHandler?.showError) {
                global.errorHandler.showError('Cart service unavailable. Please refresh and try again.');
            }
            return;
        }

        const originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = 'Adding...';

        try {
            const productId = product?.id || product?.product_id;
            const variantIdRaw =
                button.dataset.variantId ||
                product?.default_variant?.variant_id ||
                product?.default_variant?.id ||
                product?.default_variant_id ||
                product?.defaultVariantId;
            const variantId = Number(variantIdRaw);
            if (!Number.isInteger(variantId) || variantId <= 0) {
                if (global.errorHandler?.showWarning) {
                    global.errorHandler.showWarning('Please select size/color');
                }
                return;
            }

            const added = await global.cart.addItem(productId, 1, variantId);
            if (added && global.errorHandler?.showSuccess) {
                global.errorHandler.showSuccess('Added to cart', 'Cart Updated');
            }
        } catch (error) {
            if (global.errorHandler?.showError) {
                const message = global.AMZIRA?.utils?.getApiErrorMessage?.(error, 'Unable to add this item right now.');
                global.errorHandler.showError(message || 'Unable to add this item right now.');
            }
        } finally {
            button.disabled = false;
            button.textContent = originalLabel;
        }
    }

    async function loadCategoryPage() {
        const productsGrid = document.getElementById('categoryProductsGrid');
        const stateRoot = document.getElementById('categoryStateRoot');
        const paginationRoot = document.getElementById('categoryPaginationRoot') || (() => {
            const node = document.createElement('div');
            node.id = 'categoryPaginationRoot';
            node.className = 'pagination-container';
            if (productsGrid?.parentNode) {
                productsGrid.parentNode.insertBefore(node, productsGrid.nextSibling);
            }
            return node;
        })();
        const ITEMS_PER_PAGE = 24;
        const MAX_RENDERABLE_ITEMS = 500;

        try {
            await ensureDependencies();
        } catch (error) {
            if (stateRoot) {
                renderState(stateRoot, 'Unable to load category', 'Required scripts could not load. Please refresh this page.');
            }
            return;
        }

        const categoryService = global.AMZIRACategoryService;
        const cards = global.AMZIRAProductCards;
        const slug = normalizeSlug(getQueryParam('slug'));
        const search = getQueryParam('search') || '';
        const requestedPage = getPageParam();

        if (!slug) {
            if (global.SEO?.applyCategoryFallback) {
                global.SEO.applyCategoryFallback('Invalid or missing category slug.');
            }
            setText('#categoryTitle', 'Category not found');
            setText('#breadcrumbCategory', 'Category not found');
            setText('#categoryStatusText', 'Category unavailable');
            if (stateRoot) {
                renderState(stateRoot, 'Category not found', 'We could not find that category. Please choose another one from the menu.');
            }
            return;
        }

        renderSkeleton(productsGrid, 8);
        if (stateRoot) stateRoot.replaceChildren();

        try {
            const categories = await categoryService.getCategories();
            const category = categoryService.findCategoryBySlug(slug, categories);

            if (!category) {
                if (global.SEO?.applyCategoryFallback) {
                    global.SEO.applyCategoryFallback('Category slug did not resolve to an active category.');
                }
                setText('#categoryTitle', 'Category not found');
                setText('#breadcrumbCategory', 'Category not found');
                setText('#categoryStatusText', 'Category unavailable');
                renderState(
                    stateRoot,
                    'Category not found',
                    'This category does not exist or is not active anymore.',
                    {
                        buttonLabel: 'Back to Home',
                        onButtonClick: () => {
                            global.location.href = 'index.html';
                        }
                    }
                );
                productsGrid.replaceChildren();
                paginationRoot.replaceChildren();
                return;
            }

            if (global.SEO?.applyCategorySEO) {
                // Apply SEO immediately after category resolution and before product rendering.
                global.SEO.applyCategorySEO(category, { slug });
            }

            setText('#categoryTitle', category.name);
            setText('#breadcrumbCategory', category.name);

            const payload = await global.AMZIRA.products.getProductsByCategory(slug);
            const allProducts = extractProducts(payload);
            const products = filterBySearch(allProducts, search);
            const guardedProducts = products.slice(0, MAX_RENDERABLE_ITEMS);

            if (!guardedProducts.length) {
                productsGrid.replaceChildren();
                paginationRoot.replaceChildren();
                const emptyMessage = search
                    ? `No products matched "${search}" in ${category.name}.`
                    : `${category.name} is coming soon. No live products are available yet.`;

                renderState(
                    stateRoot,
                    search ? 'No products found' : 'Coming Soon',
                    emptyMessage,
                    {
                        buttonLabel: search ? 'Browse all categories' : 'Browse Men, Women & Kids',
                        onButtonClick: () => {
                            global.location.href = search ? 'index.html' : 'men.html';
                        }
                    }
                );

                setText('#categoryStatusText', '0 products');
                return;
            }

            const totalPages = Math.max(1, Math.ceil(guardedProducts.length / ITEMS_PER_PAGE));
            const currentPage = Math.min(requestedPage, totalPages);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const pageProducts = guardedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            productsGrid.replaceChildren();
            pageProducts.forEach((product) => {
                const card = cards.createProductCard(product, {
                    currency: 'INR',
                    locale: 'en-IN',
                    onAddToCart: addToCart
                });
                productsGrid.appendChild(card);
            });

            renderPagination(paginationRoot, currentPage, totalPages, (nextPage) => {
                updatePageParam(nextPage);
                loadCategoryPage();
                const shell = document.querySelector('.category-shell');
                if (shell && typeof shell.scrollIntoView === 'function') {
                    shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });

            if (currentPage !== requestedPage) {
                updatePageParam(currentPage);
            }

            const guardNotice = products.length > MAX_RENDERABLE_ITEMS
                ? `Showing first ${MAX_RENDERABLE_ITEMS} products for performance.`
                : '';
            const pageStartLabel = startIndex + 1;
            const pageEndLabel = startIndex + pageProducts.length;
            setText(
                '#categoryStatusText',
                `${products.length} products • Showing ${pageStartLabel}-${pageEndLabel}${guardNotice ? ` • ${guardNotice}` : ''}`
            );
        } catch (error) {
            productsGrid.replaceChildren();
            paginationRoot.replaceChildren();

            if (error?.status === 401) {
                global.location.href = 'login.html';
                return;
            }

            if (error?.status === 403) {
                setText('#categoryStatusText', 'Access denied');
                renderState(
                    stateRoot,
                    'Permission denied',
                    'You do not have permission to access this catalog right now.',
                    {
                        buttonLabel: 'Go Home',
                        onButtonClick: () => {
                            global.location.href = 'index.html';
                        }
                    }
                );
                return;
            }

            if (global.SEO?.applyCategoryFallback) {
                global.SEO.applyCategoryFallback('Category API request failed.');
            }

            if (error?.status === 429) {
                setText('#categoryStatusText', 'Please retry shortly');
                renderState(
                    stateRoot,
                    'Too many requests',
                    'The catalog is receiving high traffic. Please try again in a moment.',
                    {
                        buttonLabel: 'Retry',
                        onButtonClick: () => {
                            loadCategoryPage();
                        }
                    }
                );
                return;
            }

            renderState(
                stateRoot,
                'Unable to load products',
                global.AMZIRA?.utils?.getApiErrorMessage?.(error, 'Catalog unavailable or timed out. Please retry.') || 'Catalog unavailable or timed out. Please retry.',
                {
                    buttonLabel: 'Retry',
                    onButtonClick: () => {
                        loadCategoryPage();
                    }
                }
            );
            setText('#categoryStatusText', 'Unable to load products');
        }
    }

    document.addEventListener('DOMContentLoaded', function onReady() {
        loadCategoryPage();
    });
})(window);
