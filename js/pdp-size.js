export function createSizeManager({
    state,
    getPdpEl,
    esc,
    safeHexColor,
    displayImages,
    updateSku,
    updateStockPill,
    applyPriceDisplay,
    setPdpInlineMessage,
    updateAddToCartState
}) {
    function syncStickySizes() {
        const sizeSelect = getPdpEl('stickySizeSelect');
        if (!sizeSelect) return;

        const sizes = Array.from(new Set(
            (state.activeVariants || [])
                .map((variant) => String(variant?.size || '').trim())
                .filter(Boolean)
        ));

        const currentValue = sizeSelect.value;
        while (sizeSelect.firstChild) sizeSelect.removeChild(sizeSelect.firstChild);

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select';
        sizeSelect.appendChild(defaultOption);

        sizes.forEach((size) => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });

        sizeSelect.disabled = sizes.length === 0;
        sizeSelect.value = state.selectedSize || currentValue || '';
    }

    function displaySizes(variants, colorFilter = null) {
        const container = getPdpEl('sizeSelector');
        const selectedSizeName = getPdpEl('selectedSizeName');
        if (!container || !selectedSizeName) return;

        const filtered = (Array.isArray(variants) ? variants : []).filter((variant) => {
            if (!colorFilter) return true;
            return String(variant?.color || '').toLowerCase() === String(colorFilter).toLowerCase();
        });

        container.innerHTML = filtered.map((variant) => {
            const stock = Number(variant?.stock_quantity || 0);
            const lowLabel = stock > 0 && stock <= 2 ? '<small style="display:block;font-size:10px;">Low</small>' : '';
            return `
                    <button class="size-option ${stock <= 0 ? 'out-of-stock' : ''}" data-size="${esc(variant?.size || '-')}" data-variant-id="${esc(variant?.id || '')}" data-stock="${stock}" type="button">
                        ${esc(variant?.size || '-')}${lowLabel}
                    </button>
                `;
        }).join('');

        if (!filtered.length) {
            state.selectedSize = null;
            state.selectedVariantId = null;
            state.selectedVariantStock = 0;
            selectedSizeName.textContent = 'Unavailable';
            updateStockPill(0);
            updateAddToCartState();
            setPdpInlineMessage('Selected option is unavailable. Please choose another.', 'error');
            return;
        }

        const firstInStock = filtered.find((variant) => Number(variant?.stock_quantity || 0) > 0) || null;
        if (filtered.length === 1 && firstInStock) {
            state.selectedSize = firstInStock.size;
            state.selectedVariantId = Number(firstInStock.id);
            state.selectedVariantStock = Number(firstInStock.stock_quantity || 0);
            selectedSizeName.textContent = state.selectedSize;
            const onlyOption = container.querySelector(`.size-option[data-variant-id="${firstInStock.id}"]`);
            if (onlyOption) onlyOption.classList.add('selected');
        } else {
            state.selectedSize = null;
            state.selectedVariantId = null;
            state.selectedVariantStock = firstInStock ? Number(firstInStock.stock_quantity || 0) : 0;
            selectedSizeName.textContent = firstInStock ? 'Select' : 'Out of Stock';
        }

        updateStockPill(state.selectedVariantStock);
        document.querySelectorAll('.size-option').forEach((option) => {
            option.addEventListener('click', function onSizeSelect() {
                if (this.classList.contains('out-of-stock')) return;
                document.querySelectorAll('.size-option').forEach((item) => item.classList.remove('selected'));
                this.classList.add('selected');
                state.selectedSize = this.dataset.size;
                state.selectedVariantId = Number(this.dataset.variantId || 0) || null;
                state.selectedVariantStock = Number(this.dataset.stock || 0);
                selectedSizeName.textContent = state.selectedSize || 'Select';
                updateStockPill(state.selectedVariantStock);
                setPdpInlineMessage('Size selected. You can add this item to cart.', 'success');
                updateAddToCartState();
            });
        });
        updateAddToCartState();
        syncStickySizes();
    }

    function displayColors(colors) {
        const container = getPdpEl('colorSelector');
        if (!container) return;

        const normalizedColors = (Array.isArray(colors) ? colors : []).map((color) => ({
            name: String(color?.name || color?.label || color?.title || 'Color'),
            hex: String(color?.hex || color?.value || color?.color || color?.code || '#8B1538'),
            images: Array.isArray(color?.images) ? color.images : []
        }));

        while (container.firstChild) container.removeChild(container.firstChild);

        normalizedColors.forEach((color) => {
            const swatch = document.createElement('button');
            swatch.type = 'button';
            swatch.className = 'color-swatch';
            swatch.style.background = safeHexColor(color.hex);
            swatch.dataset.color = color.name;
            swatch.dataset.images = JSON.stringify(color.images || []);
            swatch.title = color.name;
            container.appendChild(swatch);
        });

        state.selectedColor = null;
        state.selectedSize = null;
        state.selectedVariantId = null;
        state.selectedVariantStock = 0;
        const selectedColorName = getPdpEl('selectedColorName');
        const selectedSizeName = getPdpEl('selectedSizeName');
        if (selectedColorName) selectedColorName.textContent = 'Select';
        if (selectedSizeName) selectedSizeName.textContent = 'Select';
        displaySizes(state.activeVariants, null);

        const swatches = container.querySelectorAll('.color-swatch');
        swatches.forEach((swatch) => {
            swatch.addEventListener('click', function onColorSelect() {
                swatches.forEach((item) => item.classList.remove('selected'));
                this.classList.add('selected');
                state.selectedColor = this.dataset.color;
                if (selectedColorName) selectedColorName.textContent = state.selectedColor;

                state.selectedSize = null;
                state.selectedVariantId = null;
                state.selectedVariantStock = 0;
                if (selectedSizeName) selectedSizeName.textContent = 'Select';

                let images = [];
                try {
                    images = JSON.parse(this.dataset.images || '[]');
                } catch {
                    images = [];
                }

                if (Array.isArray(images) && images.length > 0) {
                    displayImages(images);
                } else if (state.defaultProductImages.length > 0) {
                    displayImages(state.defaultProductImages);
                }

                const firstVariant = (state.activeVariants || []).find((variant) => {
                    return String(variant?.color || '').toLowerCase() === String(state.selectedColor || '').toLowerCase();
                }) || null;

                if (firstVariant) {
                    const variantSku = firstVariant?.sku || firstVariant?.variant_id || firstVariant?.id;
                    if (variantSku && getPdpEl('productSku')) {
                        getPdpEl('productSku').textContent = `SKU: ${variantSku}`;
                    }
                    const variantStock = Number(firstVariant?.stock_quantity || 0);
                    updateStockPill(variantStock);

                    const variantSale = Number(firstVariant?.sale_price ?? firstVariant?.salePrice ?? firstVariant?.price ?? 0);
                    const variantBase = Number(firstVariant?.base_price ?? firstVariant?.basePrice ?? firstVariant?.price ?? variantSale);
                    const current = variantSale > 0 ? variantSale : variantBase;
                    const base = variantBase >= current ? variantBase : current;
                    if (current > 0) applyPriceDisplay(current, base);
                    else applyPriceDisplay(state.currentPriceValue, state.basePriceValue);
                } else {
                    updateSku(state.currentProduct);
                    updateStockPill(state.selectedVariantStock);
                    applyPriceDisplay(state.currentPriceValue, state.basePriceValue);
                }

                displaySizes(state.activeVariants, state.selectedColor);
                requestAnimationFrame(() => {
                    const firstInStock = document.querySelector('.size-option:not(.out-of-stock)');
                    if (firstInStock) firstInStock.click();
                    else setPdpInlineMessage('Selected option is unavailable. Please choose another.', 'error');
                });
            });
        });

        if (swatches.length > 0) swatches[0].click();
        updateAddToCartState();
    }

    function bindStickySizeSelect() {
        const stickySizeSelect = document.getElementById('stickySizeSelect');
        if (stickySizeSelect) {
            stickySizeSelect.addEventListener('change', (event) => {
                const value = event.target.value;
                if (!value) return;
                const match = document.querySelector(`.size-option[data-size="${CSS.escape(value)}"]:not(.out-of-stock)`);
                if (match) match.click();
            });
        }
    }

    function openSizeChart() {
        const modal = document.getElementById('sizeChartModal');
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSizeChart() {
        const modal = document.getElementById('sizeChartModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function bindSizeChart() {
        const sizeGuideLink = document.querySelector('.size-guide-link');
        if (sizeGuideLink) {
            sizeGuideLink.addEventListener('click', (e) => {
                e.preventDefault();
                openSizeChart();
            });
        }

        const closeButton = document.querySelector('[data-size-chart-close]');
        if (closeButton) closeButton.addEventListener('click', closeSizeChart);

        const modal = document.getElementById('sizeChartModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeSizeChart();
            });
        }
    }

    return {
        displayColors,
        displaySizes,
        syncStickySizes,
        bindStickySizeSelect,
        bindSizeChart
    };
}
