/*
  Checkout and order orchestration.
  Required flow:
  1) Fetch backend cart
  2) Create backend order
  3) Redirect for COD OR run Razorpay for online payments
*/

async function ensureOrdersApiLayer() {
    if (window.AMZIRA && window.AMZIRA.apiRequest) return;

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

function showCheckoutError(message) {
    if (window.errorHandler && typeof window.errorHandler.showError === 'function') {
        window.errorHandler.showError(message);
        return;
    }

    alert(message);
}

function normalizeCartItems(cartData) {
    return cartData?.items || cartData?.cart_items || [];
}

function getAddressIdsFromUI() {
    const shipping =
        document.querySelector('input[name="shipping"]:checked')?.value ||
        document.querySelector('input[name="shippingAddress"]:checked')?.value ||
        document.querySelector('#shippingAddressId')?.value ||
        null;

    const billing =
        document.querySelector('input[name="billing"]:checked')?.value ||
        document.querySelector('input[name="billingAddress"]:checked')?.value ||
        document.querySelector('#billingAddressId')?.value ||
        shipping;

    return {
        shippingAddressId: shipping ? Number(shipping) : null,
        billingAddressId: billing ? Number(billing) : null
    };
}

function getPaymentMethodFromUI() {
    const fromRadio = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (fromRadio) return String(fromRadio).toLowerCase();

    const activeTab = document.querySelector('.payment-tab.active')?.getAttribute('data-method');
    if (activeTab) {
        if (activeTab === 'cod') return 'cod';
        return 'razorpay';
    }

    return 'cod';
}

function isCashOnDelivery(paymentMethod) {
    const value = String(paymentMethod || '').toLowerCase();
    return value === 'cod' || value === 'cash_on_delivery';
}

function getOrderIdentifiers(orderData) {
    return {
        id: orderData?.id || orderData?.order_id || orderData?.orderId,
        number: orderData?.order_number || orderData?.order_no || orderData?.number || orderData?.id
    };
}

async function handleRazorpayPayment(orderData, customer) {
    const { id: orderId, number: orderNumber } = getOrderIdentifiers(orderData);

    if (!orderId) {
        throw new Error('Order created but order id was missing');
    }

    const paymentData = await window.AMZIRA.payments.createPaymentOrder(orderId);

    if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay SDK is not loaded');
    }

    const options = {
        key: paymentData?.razorpay_key_id || paymentData?.key || paymentData?.key_id,
        amount: paymentData?.amount,
        currency: paymentData?.currency || 'INR',
        order_id: paymentData?.razorpay_order_id || paymentData?.razorpayOrderId || paymentData?.order_id,
        name: 'AMZIRA',
        description: `Order ${orderNumber || ''}`,
        prefill: {
            name: customer?.name || '',
            email: customer?.email || '',
            contact: customer?.phone || ''
        },
        handler: async function (response) {
            await window.AMZIRA.payments.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
            );

            window.location.href = `order-success.html?order=${encodeURIComponent(orderNumber || orderId)}`;
        },
        modal: {
            ondismiss: function () {
                showCheckoutError('Payment cancelled. Your order is still pending payment.');
            }
        }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
}

async function initiateCheckout(event, explicitPaymentMethod = null) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    try {
        await ensureOrdersApiLayer();

        const cartData = await window.AMZIRA.cart.getCart();
        const items = normalizeCartItems(cartData);

        if (!items.length) {
            throw new Error('Your cart is empty');
        }

        const { shippingAddressId, billingAddressId } = getAddressIdsFromUI();

        if (!shippingAddressId || !billingAddressId) {
            throw new Error('Please select shipping and billing addresses before checkout');
        }

        const paymentMethod = explicitPaymentMethod || getPaymentMethodFromUI();

        const orderData = await window.AMZIRA.orders.createOrder({
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId,
            payment_method: paymentMethod
        });

        const { number: orderNumber, id: orderId } = getOrderIdentifiers(orderData);

        if (isCashOnDelivery(paymentMethod)) {
            window.location.href = `order-success.html?order=${encodeURIComponent(orderNumber || orderId)}`;
            return;
        }

        const currentUser = (window.Auth && typeof window.Auth.getUser === 'function') ? window.Auth.getUser() : null;
        await handleRazorpayPayment(orderData, currentUser);
    } catch (error) {
        showCheckoutError(error?.message || 'Checkout failed');
        throw error;
    }
}

function bindCheckoutButtons() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            initiateCheckout(event);
        });
    }

    const proceedBtn = document.getElementById('proceedToPayment');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', (event) => {
            // Legacy button id retained; behavior now creates the order directly.
            event.stopImmediatePropagation();
            initiateCheckout(event);
        });
    }

    const payBtn = document.getElementById('payButton');
    if (payBtn) {
        payBtn.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            initiateCheckout(event);
        });
    }
}

// Minimal read-only order facade for pages that still reference OrderManager.
const OrderManager = {
    cache: [],

    async refreshOrders() {
        try {
            await ensureOrdersApiLayer();
            const payload = await window.AMZIRA.orders.getOrders();
            this.cache = payload?.orders || payload?.results || (Array.isArray(payload) ? payload : []);
        } catch (_) {
            this.cache = [];
        }

        return this.cache;
    },

    getAllOrders() {
        return this.cache;
    },

    getUserOrders() {
        return this.cache;
    },

    getOrderById(orderId) {
        return this.cache.find((order) => String(order.orderId || order.id || order.order_number) === String(orderId));
    },

    // This legacy path is intentionally disabled to prevent local/mock order creation.
    createOrder() {
        return { success: false, message: 'Use backend checkout flow via /orders endpoint.' };
    },

    getStatusDisplay(status) {
        const value = String(status || '').toLowerCase();
        if (value === 'delivered') return { label: 'Delivered', color: '#10B981', icon: 'check-circle' };
        if (value === 'cancelled') return { label: 'Cancelled', color: '#EF4444', icon: 'times-circle' };
        if (value === 'shipped') return { label: 'Shipped', color: '#3B82F6', icon: 'truck' };
        return { label: 'Processing', color: '#F59E0B', icon: 'clock' };
    },

    getPaymentMethodDisplay(method) {
        const value = String(method || '').toLowerCase();
        if (value === 'cod' || value === 'cash_on_delivery') return { label: 'Cash on Delivery', icon: 'money-bill-wave' };
        return { label: 'Online Payment', icon: 'credit-card' };
    }
};

window.initiateCheckout = initiateCheckout;
window.OrderManager = OrderManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCheckoutButtons, { once: true });
} else {
    bindCheckoutButtons();
}
