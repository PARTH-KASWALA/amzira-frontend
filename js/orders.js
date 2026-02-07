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

/**
 * Build a self-cleaning countdown timer without setInterval.
 * @param {{expiresAt: string|number|Date, onTick: (msLeft:number)=>void, onExpire: ()=>void}} params
 * @returns {{start: ()=>void, stop: ()=>void}}
 */
function createExpiryTimer({ expiresAt, onTick, onExpire }) {
    const expiresTs = new Date(expiresAt).getTime();
    let timeoutId = null;
    let stopped = false;

    function clear() {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function tick() {
        if (stopped) return;

        const msLeft = Math.max(0, expiresTs - Date.now());
        onTick(msLeft);

        if (msLeft <= 0) {
            onExpire();
            return;
        }

        timeoutId = window.setTimeout(tick, 1000);
    }

    return {
        start() {
            stopped = false;
            clear();
            tick();
        },
        stop() {
            stopped = true;
            clear();
        }
    };
}

/**
 * Normalize backend stock check response.
 * @param {any} stockPayload
 * @returns {{available:boolean, affectedItems:Array<{productId:string,variantId:string,message:string}>}}
 */
function normalizeStockCheck(stockPayload) {
    const available = Boolean(stockPayload?.available !== false);
    const rawItems = stockPayload?.affected_items || stockPayload?.items || stockPayload?.conflicts || [];
    const affectedItems = Array.isArray(rawItems)
        ? rawItems.map((item) => ({
            productId: String(item?.product_id || item?.productId || item?.id || ''),
            variantId: String(item?.variant_id || item?.variantId || ''),
            message: item?.message || item?.detail || 'Item is no longer available'
        }))
        : [];

    return { available, affectedItems };
}

/**
 * Show checkout errors through global error surface.
 * @param {string} message
 */
function showCheckoutError(message) {
    if (window.errorHandler && typeof window.errorHandler.showError === 'function') {
        window.errorHandler.showError(message);
        return;
    }

    alert(message);
}

/**
 * Build user-facing API error text.
 * @param {any} error
 * @param {string} fallback
 * @returns {string}
 */
function getDisplayErrorMessage(error, fallback = 'Checkout failed') {
    if (window.AMZIRA?.utils?.getApiErrorMessage) {
        return window.AMZIRA.utils.getApiErrorMessage(error, fallback);
    }

    if (error?.errors && Array.isArray(error.errors) && error.errors.length) {
        return `${error.message || fallback} (${error.errors.join(', ')})`;
    }

    return error?.message || fallback;
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

/**
 * Checkout entrypoint that validates cart/address state and creates backend order.
 * @param {Event|null} event
 * @param {string|null} explicitPaymentMethod
 * @returns {Promise<void>}
 */
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
        showCheckoutError(getDisplayErrorMessage(error, 'Checkout failed'));
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
}

// Minimal read-only order facade for pages that still reference OrderManager.
const OrderManager = {
    cache: [],

    normalizeOrder(order) {
        if (!order || typeof order !== 'object') return null;

        const items = order.items || order.order_items || [];
        const subtotal = Number(order?.subtotal || 0);
        const shipping = Number(order?.shipping_amount || 0);
        const discount = Number(order?.discount || 0);
        const tax = Number(order?.tax || 0);
        const total = Number(order?.total || order?.grand_total || 0);

        return {
            orderId: order.order_number || order.order_id || order.id,
            orderStatus: String(order.status || order.order_status || 'processing').toLowerCase(),
            paymentMethod: String(order.payment_method || 'razorpay').toLowerCase(),
            orderDate: order.created_at || order.order_date || new Date().toISOString(),
            expectedDelivery: order.estimated_delivery || order.expected_delivery || new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
            deliveryAddress: order.shipping_address || order.deliveryAddress || {},
            pricing: { subtotal, shipping, discount, tax, total },
            items: items.map((item) => ({
                name: item.product_name || item.name || item?.product?.name || 'Product',
                image: item.image || item?.product?.image || '',
                size: item.size || item?.variant?.size || '-',
                quantity: Number(item.quantity || 0),
                price: Number(item.unit_price || item.price || 0)
            }))
        };
    },

    async refreshOrders() {
        try {
            await ensureOrdersApiLayer();
            const payload = await window.AMZIRA.orders.getOrders();
            const source = payload?.orders || payload?.results || (Array.isArray(payload) ? payload : []);
            this.cache = source
                .map((order) => this.normalizeOrder(order))
                .filter(Boolean);
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
window.OrderFlowUtils = {
    createExpiryTimer,
    normalizeStockCheck
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCheckoutButtons, { once: true });
} else {
    bindCheckoutButtons();
}
