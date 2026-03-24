let imageZoomInstance = null;

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

function createResponsivePicture(imageUrl, altText) {
    const webp400 = buildWebpVariant(imageUrl, '400');
    const webp800 = buildWebpVariant(imageUrl, '800');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText;
    img.loading = 'lazy';
    img.width = 600;
    img.height = 800;

    if (!webp400 || !webp800) {
        return img;
    }

    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = `${webp400} 400w, ${webp800} 800w`;
    picture.appendChild(source);
    picture.appendChild(img);
    return picture;
}

function showShareNotification(message, type = 'success') {
    const note = document.createElement('div');
    note.textContent = message;
    note.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 14px;
        z-index: 9999;
    `;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2000);
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showShareNotification('Link copied to clipboard!');
    } catch {
        showShareNotification('Failed to copy link', 'error');
    }

    document.body.removeChild(textarea);
}

function shareOnWhatsApp(productName) {
    const productUrl = window.location.href;
    const message = `Check out this ${productName} on Amzira: ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function shareOnFacebook() {
    const productUrl = window.location.href;
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
        '_blank',
        'width=600,height=400'
    );
}

function shareOnTwitter(productName) {
    const productUrl = window.location.href;
    const text = `Check out this ${productName} on Amzira!`;
    window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`,
        '_blank',
        'width=600,height=400'
    );
}

function copyProductLink() {
    const productUrl = window.location.href;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(productUrl)
            .then(() => showShareNotification('Link copied to clipboard!'))
            .catch(() => fallbackCopyText(productUrl));
    } else {
        fallbackCopyText(productUrl);
    }
}

function bindShareActions() {
    document.querySelectorAll('[data-share]').forEach((button) => {
        button.addEventListener('click', () => {
            const productName = document.getElementById('productTitle')?.textContent || 'product';
            const action = button.getAttribute('data-share');
            if (action === 'whatsapp') shareOnWhatsApp(productName);
            if (action === 'facebook') shareOnFacebook();
            if (action === 'twitter') shareOnTwitter(productName);
            if (action === 'copy') copyProductLink();
        });
    });
}

class ImageZoom {
    constructor() {
        this.zoomLevel = 2;
        this.refresh();
    }

    refresh() {
        const images = Array.from(document.querySelectorAll('#mainImageStack img'));
        images.forEach((imageEl) => {
            if (imageEl.dataset.zoomBound === 'true') return;
            imageEl.dataset.zoomBound = 'true';
            this.addHoverZoom(imageEl);
            imageEl.addEventListener('click', () => {
                const index = Number(imageEl.dataset.galleryIndex || 0);
                this.openLightbox(index);
            });
        });
    }

    addHoverZoom(img) {
        const container = img.parentElement;
        if (!container) return;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            img.style.transformOrigin = `${x}% ${y}%`;
            img.style.transform = `scale(${this.zoomLevel})`;
            img.style.transition = 'transform 0.1s ease';
        });

        container.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
            img.style.transition = 'transform 0.3s ease';
        });
    }

    openLightbox(startIndex = 0) {
        const images = Array.from(document.querySelectorAll('#mainImageStack img')).map((img) => img.src);
        if (!images.length) return;
        let currentIndex = Math.max(0, Math.min(startIndex, images.length - 1));

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';

        const content = document.createElement('div');
        content.className = 'lightbox-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

        const imageEl = document.createElement('img');
        imageEl.alt = 'Product Image';
        imageEl.src = images[currentIndex];

        content.appendChild(closeBtn);
        content.appendChild(prevBtn);
        content.appendChild(nextBtn);
        content.appendChild(imageEl);

        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox';
        lightbox.appendChild(overlay);
        lightbox.appendChild(content);

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        setTimeout(() => lightbox.classList.add('active'), 10);

        const updateImage = () => {
            imageEl.src = images[currentIndex];
        };

        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage();
        };

        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKeyDown);
            setTimeout(() => lightbox.remove(), 300);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        };

        closeBtn.onclick = closeLightbox;
        overlay.onclick = closeLightbox;
        document.addEventListener('keydown', onKeyDown);
    }
}

function initImageZoom() {
    if (imageZoomInstance) return;
    imageZoomInstance = new ImageZoom();
}

function refreshImageZoom() {
    if (imageZoomInstance) imageZoomInstance.refresh();
}

function adjustImageContainerHeight() {
    const imageContainer = document.querySelector('.main-image-container');
    const featuresSection = document.querySelector('.features-section');
    const imageStack = document.querySelector('.main-image-stack');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!imageContainer || !featuresSection) return;
    if (isMobile) {
        imageContainer.style.height = '';
        if (imageStack) imageStack.style.removeProperty('--pdp-image-height');
        return;
    }

    const containerTop = imageContainer.getBoundingClientRect().top + window.scrollY;
    const featuresBottom = featuresSection.getBoundingClientRect().bottom + window.scrollY;
    const calculated = Math.max(240, featuresBottom - containerTop);
    imageContainer.style.height = `${calculated}px`;
    if (imageStack) {
        const styles = getComputedStyle(imageStack);
        const visibleRows = Number(styles.getPropertyValue('--visible-rows')) || 2.5;
        const gap = Number.parseFloat(styles.getPropertyValue('--stack-gap')) || 20;
        const imageHeight = Math.max(200, (calculated - (gap * (visibleRows - 1))) / visibleRows);
        imageStack.style.setProperty('--pdp-image-height', `${Math.floor(imageHeight)}px`);
    }
}

function displayImages({ images, state, getPdpEl, updateStickyContent }) {
    const thumbnailColumn = getPdpEl('thumbnailColumn');
    const mainImageStack = getPdpEl('mainImageStack');
    const mainImageContainer = getPdpEl('mainImageContainer');
    if (!thumbnailColumn || !mainImageStack || !mainImageContainer) return;

    const normalizedImages = (Array.isArray(images) ? images : [])
        .map((img) => (typeof img === 'string' ? img : String(img?.image_url || img?.url || '')))
        .filter(Boolean);
    if (!normalizedImages.length) normalizedImages.push('images/products/product-1-front.jpg');

    while (thumbnailColumn.firstChild) {
        thumbnailColumn.removeChild(thumbnailColumn.firstChild);
    }
    while (mainImageStack.firstChild) {
        mainImageStack.removeChild(mainImageStack.firstChild);
    }

    normalizedImages.forEach((img, index) => {
        const thumb = document.createElement('img');
        thumb.src = img;
        thumb.alt = `${state.currentProduct?.name || 'Product'} thumbnail ${index + 1}`;
        thumb.dataset.index = String(index);
        if (index === 0) thumb.classList.add('active');
        thumb.addEventListener('error', function onThumbError() {
            this.src = 'images/products/product-1-front.jpg';
        }, { once: true });
        thumbnailColumn.appendChild(thumb);

                const altText = `${state.currentProduct?.name || 'Product'} image ${index + 1}`;
                const picture = createResponsivePicture(img, altText);
                const imageEl = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
                imageEl.dataset.galleryIndex = String(index);
                imageEl.addEventListener('error', function onError() {
                    this.src = 'images/products/product-1-front.jpg';
                }, { once: true });
                mainImageStack.appendChild(picture);

        thumb.addEventListener('click', () => {
            thumbnailColumn.querySelectorAll('img.active').forEach((node) => node.classList.remove('active'));
            thumb.classList.add('active');
            imageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    refreshImageZoom();
    updateStickyContent();
    requestAnimationFrame(adjustImageContainerHeight);
}

export function createGallery({ state, getPdpEl, updateStickyContent }) {
    return {
        displayImages: (images) => displayImages({ images, state, getPdpEl, updateStickyContent }),
        adjustImageContainerHeight,
        initImageZoom,
        refreshImageZoom,
        bindShareActions
    };
}
