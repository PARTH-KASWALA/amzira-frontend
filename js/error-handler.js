/**
 * Global Error Handler for Amzira E-commerce
 * Provides centralized error handling with toast notifications, retry functionality, and field validation
 */
class ErrorHandler {
    constructor() {
        this.toastContainer = null;
        this.retryQueue = new Map();
        this.init();
    }

    init() {
        this.injectCSS();
        this.createToastContainer();
        this.setupGlobalErrorHandling();
        this.setupFetchInterception();
    }

    injectCSS() {
        const css = `
            /* Error Handler Styles */
            .error-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            }

            .error-toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                transform: translateX(420px);
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: auto;
                border-left: 4px solid #ef4444;
                position: relative;
                overflow: hidden;
            }

            .error-toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .error-toast.success {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .error-toast.warning {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .error-toast.info {
                border-left-color: #3b82f6;
                background: #eff6ff;
            }

            .error-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                margin-top: 2px;
            }

            .error-content {
                flex: 1;
                min-width: 0;
            }

            .error-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 4px;
                color: #1f2937;
            }

            .error-message {
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }

            .error-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .error-btn {
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .error-btn.retry {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .error-btn.retry:hover {
                background: #dc2626;
                border-color: #dc2626;
            }

            .error-btn.dismiss {
                background: #f3f4f6;
                color: #6b7280;
                border-color: #d1d5db;
            }

            .error-btn.dismiss:hover {
                background: #e5e7eb;
            }

            .error-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .error-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                background: #ef4444;
                transition: width 0.3s ease;
            }

            .error-toast.success .error-progress {
                background: #10b981;
            }

            .error-toast.warning .error-progress {
                background: #f59e0b;
            }

            .error-toast.info .error-progress {
                background: #3b82f6;
            }

            /* Field Error Styles */
            .field-error {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 1px #ef4444 !important;
            }

            .field-error-message {
                color: #ef4444;
                font-size: 12px;
                margin-top: 4px;
                display: block;
            }

            .field-success {
                border-color: #10b981 !important;
                box-shadow: 0 0 0 1px #10b981 !important;
            }

            /* Loading overlay for retry operations */
            .error-retry-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }

            .error-retry-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f4f6;
                border-top: 3px solid #ef4444;
                border-radius: 50%;
                animation: error-spin 1s linear infinite;
            }

            @keyframes error-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Mobile responsive */
            @media (max-width: 480px) {
                .error-toast-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                    max-width: none;
                }

                .error-toast {
                    transform: translateY(-100px);
                }

                .error-toast.show {
                    transform: translateY(0);
                }
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'error-toast-container';
        document.body.appendChild(this.toastContainer);
    }

    setupGlobalErrorHandling() {
        // Handle JavaScript runtime errors
        window.addEventListener('error', (event) => {
            this.handleJSError(event.error, event.message, event.filename, event.lineno);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
            event.preventDefault(); // Prevent default browser handling
        });

        // Handle console errors (optional - for debugging)
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            // Only show toast for actual errors, not debug logs
            if (args[0] && typeof args[0] === 'string' && args[0].includes('Error')) {
                this.showError(args.join(' '), 'Console Error');
            }
        };
    }

    setupFetchInterception() {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);

                // Check for HTTP error status codes
                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.response = response;

                    // Try to get error details from response
                    try {
                        const errorData = await response.clone().json();
                        error.details = errorData;
                    } catch (e) {
                        // Response might not be JSON
                    }

                    throw error;
                }

                return response;
            } catch (error) {
                // Re-throw network errors and other fetch failures
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    error.message = 'Network connection failed. Please check your internet connection.';
                }
                throw error;
            }
        };
    }

    handleJSError(error, message, filename, lineno) {
        const errorMessage = message || 'An unexpected error occurred';
        const details = filename ? `${filename}:${lineno}` : '';

        this.showError(`${errorMessage}${details ? ` (${details})` : ''}`, 'JavaScript Error');
    }

    handlePromiseRejection(reason) {
        const message = reason instanceof Error ? reason.message : 'An unexpected error occurred';
        this.showError(message, 'Unhandled Promise Rejection');
    }

    async showError(message, title = 'Error', options = {}) {
        const {
            type = 'error',
            duration = 5000,
            showDismiss = true,
            retryable = false,
            retryCallback = null
        } = options;

        const toast = document.createElement('div');
        toast.className = `error-toast ${type}`;

        const iconSvg = this.getIconForType(type);

        // Escape title and message to prevent XSS
        const safeTitle = this.escapeHtml(title);
        const safeMessage = this.escapeHtml(message);

        toast.innerHTML = `
            <div class="error-icon">${iconSvg}</div>
            <div class="error-content">
                <div class="error-title">${safeTitle}</div>
                <div class="error-message">${safeMessage}</div>
                ${(retryable || showDismiss) ? `
                    <div class="error-actions">
                        ${retryable ? `<button class="error-btn retry" data-action="retry">Retry</button>` : ''}
                        ${showDismiss ? `<button class="error-btn dismiss" data-action="dismiss">Dismiss</button>` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="error-progress" style="width: 100%"></div>
        `;

        this.toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Setup event listeners
        const retryBtn = toast.querySelector('[data-action="retry"]');
        const dismissBtn = toast.querySelector('[data-action="dismiss"]');

        if (retryBtn && retryCallback) {
            retryBtn.addEventListener('click', async () => {
                retryBtn.disabled = true;
                retryBtn.textContent = 'Retrying...';

                try {
                    await retryCallback();
                    this.showSuccess('Operation completed successfully', 'Success');
                    this.removeToast(toast);
                } catch (error) {
                    this.showError('Retry failed. Please try again.', 'Retry Failed');
                } finally {
                    retryBtn.disabled = false;
                    retryBtn.textContent = 'Retry';
                }
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.removeToast(toast));
        }

        // Auto-dismiss after duration
        if (duration > 0) {
            const progressBar = toast.querySelector('.error-progress');
            let startTime = Date.now();

            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, duration - elapsed);
                const percentage = (remaining / duration) * 100;

                if (progressBar) {
                    progressBar.style.width = `${percentage}%`;
                }

                if (remaining > 0) {
                    requestAnimationFrame(updateProgress);
                } else {
                    this.removeToast(toast);
                }
            };

            requestAnimationFrame(updateProgress);
        }

        return toast;
    }

    // Simple HTML escape helper
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    showSuccess(message, title = 'Success') {
        return this.showError(message, title, { type: 'success', duration: 3000 });
    }

    showWarning(message, title = 'Warning') {
        return this.showError(message, title, { type: 'warning', duration: 4000 });
    }

    showInfo(message, title = 'Info') {
        return this.showError(message, title, { type: 'info', duration: 3000 });
    }

    showRetryableError(message, retryCallback, title = 'Error') {
        return this.showError(message, title, {
            retryable: true,
            retryCallback,
            duration: 0 // Don't auto-dismiss retryable errors
        });
    }

    showFieldError(field, message) {
        // Clear previous error state
        this.clearFieldError(field);

        // Add error styling
        field.classList.add('field-error');

        // Create and insert error message
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error-message';
        errorElement.textContent = message;

        field.parentNode.insertBefore(errorElement, field.nextSibling);

        // Focus the field
        field.focus();

        // Auto-clear error on input
        const clearError = () => this.clearFieldError(field);
        field.addEventListener('input', clearError, { once: true });
        field.addEventListener('change', clearError, { once: true });
    }

    clearFieldError(field) {
        field.classList.remove('field-error');
        field.classList.remove('field-success');

        const errorMessage = field.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    showFieldSuccess(field) {
        this.clearFieldError(field);
        field.classList.add('field-success');

        // Auto-clear success after 2 seconds
        setTimeout(() => {
            field.classList.remove('field-success');
        }, 2000);
    }

    async withErrorHandling(asyncFn, errorMessage = 'Operation failed', options = {}) {
        try {
            return await asyncFn();
        } catch (error) {
            console.error('Error caught by withErrorHandling:', error);

            const {
                showToast = true,
                retryable = false,
                retryCallback = null
            } = options;

            if (showToast) {
                if (retryable && retryCallback) {
                    this.showRetryableError(errorMessage, retryCallback);
                } else {
                    this.showError(errorMessage);
                }
            }

            throw error; // Re-throw so calling code can handle if needed
        }
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getIconForType(type) {
        const icons = {
            error: `<svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>`,
            success: `<svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>`,
            warning: `<svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`,
            info: `<svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>`
        };

        return icons[type] || icons.error;
    }

    // Utility method to create a loading overlay for retry operations
    showRetryOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'error-retry-overlay';
        overlay.innerHTML = '<div class="error-retry-spinner"></div>';
        document.body.appendChild(overlay);

        return {
            hide: () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }
        };
    }
}

// Initialize global error handler
const errorHandler = new ErrorHandler();

// Export for use in other modules
window.errorHandler = errorHandler;