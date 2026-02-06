// Backward-compatible entrypoint.
// The real implementation now lives in js/orders.js.

(function loadOrdersModule() {
    if (window.initiateCheckout || window.OrderManager) {
        return;
    }

    const existing = document.querySelector('script[data-amzira-orders="true"]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = 'js/orders.js';
    script.async = false;
    script.dataset.amziraOrders = 'true';
    document.head.appendChild(script);
})();
