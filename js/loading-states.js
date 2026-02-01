/* ===================================
   LOADING STATES & SKELETON UI - FIXED
   Global loading manager for AMZIRA
   =================================== */

class LoadingManager {
    constructor() {
        this.injectStyles();
        this.injectNotificationStyles();
        this.init();
    }

    init() {
        // Global loading manager is ready
        window.loadingManager = this;
    }

    injectStyles() {
        // Prevent duplicate style injection
        if (document.getElementById('loading-manager-styles')) return;

        const styles = `
            /* Loading States & Skeleton UI */
            .loading-overlay {
                position: fixed;
                inset: 0;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .loading-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .loading-content {
                text-align: center;
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color, #8B1538);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }

            .loading-text {
                color: var(--text-dark, #000);
                font-size: 16px;
                font-weight: 500;
            }

            /* Skeleton Loaders */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 16px;
                padding: 20px;
            }

            .skeleton-card {
                background: white;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .skeleton-image {
                width: 100%;
                height: 200px;
                background: #f5f5f5;
                border-radius: 6px;
                margin-bottom: 12px;
            }

            .skeleton-title {
                height: 20px;
                background: #f5f5f5;
                margin-bottom: 8px;
                width: 80%;
            }

            .skeleton-text {
                height: 16px;
                background: #f5f5f5;
                margin-bottom: 6px;
            }

            .skeleton-text.short {
                width: 60%;
            }

            .skeleton-price {
                height: 24px;
                background: #f5f5f5;
                width: 40%;
                margin-bottom: 12px;
            }

            .skeleton-button {
                height: 36px;
                background: #f5f5f5;
                border-radius: 4px;
                width: 100%;
            }

            /* Button Loading States */
            .btn-loading {
                position: relative;
                color: transparent !important;
                pointer-events: none;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }

            .btn-loading.btn-secondary::after {
                border-color: var(--primary-color, #8B1538);
                border-top-color: transparent;
            }

            /* Inline Loading */
            .inline-loader {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #f3f3f3;
                border-radius: 50%;
                border-top-color: var(--primary-color, #8B1538);
                animation: spin 1s linear infinite;
                margin-right: 8px;
                vertical-align: middle;
            }

            /* Animations */
            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @keyframes skeleton-loading {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            /* Responsive */
            @media (max-width: 768px) {
                .loading-content {
                    padding: 24px;
                    margin: 20px;
                }

                .skeleton-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                    padding: 12px;
                }

                .skeleton-card {
                    padding: 12px;
                }

                .skeleton-image {
                    height: 150px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'loading-manager-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    injectNotificationStyles() {
        // Prevent duplicate style injection
        if (document.getElementById('notification-styles')) return;

        const notificationStyles = `
            /* Notification Styles */
            .loading-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }

            .notification-success {
                background: #10B981;
                color: white;
            }

            .notification-error {
                background: #EF4444;
                color: white;
            }

            .notification-info {
                background: #3B82F6;
                color: white;
            }

            .loading-notification i {
                font-size: 18px;
                flex-shrink: 0;
            }

            @keyframes slideIn {
                from { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }

            @keyframes slideOut {
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
            }

            @media (max-width: 768px) {
                .loading-notification {
                    top: 70px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = notificationStyles;
        document.head.appendChild(styleSheet);
    }

    // Overlay Methods
    showOverlay(message = 'Loading...') {
        this.hideOverlay(); // Remove any existing overlay

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'globalLoadingOverlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${this.escapeHtml(message)}</div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Trigger animation
        setTimeout(() => overlay.classList.add('active'), 10);
    }

    hideOverlay() {
        const overlay = document.getElementById('globalLoadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    }

    // Skeleton Methods
    showProductSkeleton(container, count = 6) {
        if (!container) {
            console.warn('LoadingManager: Container not found for skeleton');
            return;
        }

        const skeletonHTML = Array.from({ length: count }, () => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-price"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        `).join('');

        container.innerHTML = `<div class="skeleton-grid">${skeletonHTML}</div>`;
    }

    hideSkeleton(container) {
        if (!container) return;
        // Skeletons are automatically replaced when real content is loaded
        const skeleton = container.querySelector('.skeleton-grid');
        if (skeleton) {
            skeleton.remove();
        }
    }

    // Button Loading Methods
    setButtonLoading(button, isLoading = true) {
        if (!button) {
            console.warn('LoadingManager: Button element not found');
            return;
        }

        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            // Store original text if not already stored
            if (!button.hasAttribute('data-original-text')) {
                button.setAttribute('data-original-text', button.innerHTML);
            }
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;

            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }

    // Inline Loading Methods
    showInlineLoader(element, message = '') {
        if (!element) {
            console.warn('LoadingManager: Element not found for inline loader');
            return null;
        }

        // Remove existing loader if any
        this.hideInlineLoader(element);

        const loader = document.createElement('span');
        loader.className = 'inline-loader';
        loader.setAttribute('data-inline-loader', 'true');

        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(loader);

        if (message) {
            const text = document.createElement('span');
            text.textContent = message;
            wrapper.appendChild(text);
        }

        element.appendChild(wrapper);
        return loader;
    }

    hideInlineLoader(element) {
        if (!element) return;

        const loader = element.querySelector('[data-inline-loader]');
        if (loader && loader.parentElement) {
            loader.parentElement.remove();
        }
    }

    // Utility Methods
    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.loading-notification');
        existing.forEach(note => note.remove());

        const notification = document.createElement('div');
        notification.className = `loading-notification notification-${type}`;
        
        const iconClass = type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' : 
                         'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${iconClass}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Helper method to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clear all loading states
    clearAll() {
        this.hideOverlay();
        const notifications = document.querySelectorAll('.loading-notification');
        notifications.forEach(note => note.remove());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoadingManager();
    });
} else {
    // DOM already loaded
    new LoadingManager();
}