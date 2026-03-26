/*
  Shared order utilities and read-only order facade.
  Checkout/payment execution now lives in checkout.html commerce flow.
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

const OrderManager = {
    cache: [],
    lastError: null,

    normalizeOrder(order) {
        if (!order || typeof order !== 'object') return null;

        const items = order.items || order.order_items || [];
        const subtotal = Number(order?.subtotal || 0);
        const shipping = Number(order?.shipping_amount || order?.shipping_charge || 0);
        const discount = Number(order?.discount || order?.discount_amount || 0);
        const tax = Number(order?.tax || order?.tax_amount || 0);
        const total = Number(order?.total || order?.grand_total || order?.total_amount || 0);

        return {
            orderId: order.order_number || order.order_id || order.id,
            orderStatus: String(order.status || order.order_status || 'placed').toLowerCase(),
            paymentStatus: String(order.payment_status || 'pending').toLowerCase(),
            paymentMethod: String(order.payment_method || 'razorpay').toLowerCase(),
            orderDate: order.created_at || order.order_date || new Date().toISOString(),
            expectedDelivery: order.estimated_delivery || order.estimated_delivery_date || order.expected_delivery || new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
            deliveryAddress: order.shipping_address || order.address || order.deliveryAddress || {},
            pricing: { subtotal, shipping, discount, tax, total },
            items: items.map((item) => ({
                name: item.product_name || item.name || item?.product?.name || 'Product',
                image: item.image || item?.product?.image || '',
                size: item.size || item?.variant?.size || item.variant_details || '-',
                quantity: Number(item.quantity || 0),
                price: Number(item.unit_price || item.price || 0),
                totalPrice: Number(item.total_price || 0)
            }))
        };
    },

    async refreshOrders() {
        try {
            await ensureOrdersApiLayer();
            const payload = await window.AMZIRA.orders.getOrders();
            const source = Array.isArray(payload)
                ? payload
                : (Array.isArray(payload?.orders) ? payload.orders : []);
            this.cache = source
                .map((order) => this.normalizeOrder(order))
                .filter(Boolean);
            this.lastError = null;
        } catch (error) {
            this.cache = [];
            this.lastError = error;
        }

        return this.cache;
    },

    getAllOrders() {
        return this.cache;
    },

    getUserOrders() {
        return this.cache;
    },

    getLastError() {
        return this.lastError;
    },

    getOrderById(orderId) {
        return this.cache.find((order) => String(order.orderId || order.id || order.order_number) === String(orderId));
    },

    getStatusDisplay(status) {
        const value = String(status || '').toLowerCase();
        if (value === 'pending' || value === 'placed') return { label: 'Placed', color: '#6366F1', icon: 'receipt' };
        if (value === 'confirmed') return { label: 'Confirmed', color: '#0F766E', icon: 'check-circle' };
        if (value === 'processing' || value === 'out_for_delivery') return { label: 'Out for Delivery', color: '#F59E0B', icon: 'truck-fast' };
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

window.OrderManager = OrderManager;
window.OrderFlowUtils = {
    createExpiryTimer,
    normalizeStockCheck
};
