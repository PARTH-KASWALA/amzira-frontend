/* ===================================
   ORDER MANAGEMENT SYSTEM
   Create, Store, Retrieve orders
   =================================== */

class OrderManager {
    constructor() {
        this.storageKey = 'amziraOrders';
    }

    // Generate order ID
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `AMZIRA${timestamp}${random}`;
    }

    // Create new order
    createOrder(orderData) {
        const user = Auth.getUser();
        if (!user) {
            return { success: false, message: 'User not logged in' };
        }

        const order = {
            orderId: this.generateOrderId(),
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone,
            items: orderData.items,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            pricing: {
                subtotal: orderData.subtotal,
                discount: orderData.discount || 0,
                shipping: orderData.shipping,
                tax: orderData.tax,
                total: orderData.total
            },
            paymentStatus: orderData.paymentStatus || 'pending',
            paymentId: orderData.paymentId || null,
            orderStatus: 'confirmed',
            orderDate: new Date().toISOString(),
            expectedDelivery: this.calculateDeliveryDate(),
            trackingId: null
        };

        // Save order
        const allOrders = this.getAllOrders();
        allOrders.push(order);
        localStorage.setItem(this.storageKey, JSON.stringify(allOrders));

        // Clear cart after order
        localStorage.removeItem('cart');
        
        // Clear selected address
        AddressManager.clearSelectedAddress();

        return { success: true, order: order };
    }

    // Calculate expected delivery date (5-7 days)
    calculateDeliveryDate() {
        const date = new Date();
        date.setDate(date.getDate() + 6); // 6 days from now
        return date.toISOString();
    }

    // Get all orders
    getAllOrders() {
        const orders = localStorage.getItem(this.storageKey);
        return orders ? JSON.parse(orders) : [];
    }

    // Get orders for current user
    getUserOrders() {
        const user = Auth.getUser();
        if (!user) return [];

        const allOrders = this.getAllOrders();
        return allOrders.filter(order => order.userId === user.id)
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }

    // Get order by ID
    getOrderById(orderId) {
        const allOrders = this.getAllOrders();
        return allOrders.find(order => order.orderId === orderId);
    }

    // Update order status
    updateOrderStatus(orderId, status) {
        const allOrders = this.getAllOrders();
        const index = allOrders.findIndex(order => order.orderId === orderId);

        if (index === -1) {
            return { success: false, message: 'Order not found' };
        }

        allOrders[index].orderStatus = status;
        allOrders[index].updatedAt = new Date().toISOString();
        
        localStorage.setItem(this.storageKey, JSON.stringify(allOrders));

        return { success: true, order: allOrders[index] };
    }

    // Update payment status
    updatePaymentStatus(orderId, paymentStatus, paymentId = null) {
        const allOrders = this.getAllOrders();
        const index = allOrders.findIndex(order => order.orderId === orderId);

        if (index === -1) {
            return { success: false, message: 'Order not found' };
        }

        allOrders[index].paymentStatus = paymentStatus;
        if (paymentId) {
            allOrders[index].paymentId = paymentId;
        }
        allOrders[index].updatedAt = new Date().toISOString();
        
        localStorage.setItem(this.storageKey, JSON.stringify(allOrders));

        return { success: true, order: allOrders[index] };
    }

    // Format order status for display
    getStatusDisplay(status) {
        const statusMap = {
            'pending': { label: 'Order Pending', color: '#F59E0B', icon: 'clock' },
            'confirmed': { label: 'Order Confirmed', color: '#10B981', icon: 'check-circle' },
            'processing': { label: 'Processing', color: '#3B82F6', icon: 'sync' },
            'shipped': { label: 'Shipped', color: '#8B5CF6', icon: 'truck' },
            'delivered': { label: 'Delivered', color: '#10B981', icon: 'check-circle' },
            'cancelled': { label: 'Cancelled', color: '#EF4444', icon: 'times-circle' }
        };

        return statusMap[status] || statusMap['pending'];
    }

    // Format payment method
    getPaymentMethodDisplay(method) {
        const methodMap = {
            'card': { label: 'Credit/Debit Card', icon: 'credit-card' },
            'upi': { label: 'UPI', icon: 'mobile-alt' },
            'netbanking': { label: 'Net Banking', icon: 'university' },
            'cod': { label: 'Cash on Delivery', icon: 'money-bill-wave' }
        };

        return methodMap[method] || methodMap['card'];
    }
}

// Initialize order manager
const OrderManager_Instance = new OrderManager();

// Export for global use
if (typeof window !== 'undefined') {
    window.OrderManager = OrderManager_Instance;
}