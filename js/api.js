// API Configuration
const API_BASE_URL = 'https://api.amzira.com/api/v1';

// Token Management
function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function saveTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

// API Request Function
async function apiRequest(endpoint, options = {}) {
    const accessToken = getAccessToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        
        // Handle token expiration
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry request with new token
                finalOptions.headers.Authorization = `Bearer ${getAccessToken()}`;
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
                return await handleResponse(retryResponse);
            } else {
                // Redirect to login
                window.location.href = '/login.html';
                return null;
            }
        }
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (!response.ok) {
            clearTokens();
            return false;
        }
        
        const data = await response.json();
        saveTokens(data.access_token, refreshToken);
        return true;
    } catch (error) {
        clearTokens();
        return false;
    }
}

// ============= AUTH FUNCTIONS =============

async function login(email, password) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    saveTokens(response.access_token, response.refresh_token);
    
    // Save user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
}

async function register(email, password, fullName, phone) {
    const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            phone
        })
    });
    
    // Auto-login after registration
    await login(email, password);
    
    return response;
}

function logout() {
    clearTokens();
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
    return !!getAccessToken();
}

// ============= PRODUCT FUNCTIONS =============

async function getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/products?${queryString}`);
}

async function getProductDetail(slug) {
    return await apiRequest(`/products/${slug}`);
}

async function searchProducts(query) {
    return await apiRequest(`/products?search=${encodeURIComponent(query)}`);
}

// ============= CART FUNCTIONS =============

async function getCart() {
    return await apiRequest('/cart');
}

async function addToCart(productId, variantId, quantity = 1) {
    return await apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
            product_id: productId,
            variant_id: variantId,
            quantity
        })
    });
}

async function updateCartItem(itemId, quantity) {
    return await apiRequest(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
    });
}

async function removeFromCart(itemId) {
    return await apiRequest(`/cart/items/${itemId}`, {
        method: 'DELETE'
    });
}

async function clearCart() {
    return await apiRequest('/cart', {
        method: 'DELETE'
    });
}

// ============= ORDER FUNCTIONS =============

async function createOrder(shippingAddressId, billingAddressId, customerNotes = null) {
    return await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId,
            payment_method: 'razorpay',
            customer_notes: customerNotes
        })
    });
}

async function getOrders() {
    return await apiRequest('/orders');
}

async function getOrderDetail(orderNumber) {
    return await apiRequest(`/orders/${orderNumber}`);
}

// ============= PAYMENT FUNCTIONS =============

async function createPaymentOrder(orderId) {
    return await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId })
    });
}

async function verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    return await apiRequest('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
        })
    });
}

// ============= ADDRESS FUNCTIONS =============

async function getAddresses() {
    return await apiRequest('/users/me/addresses');
}

async function addAddress(addressData) {
    return await apiRequest('/users/me/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData)
    });
}

// Export functions
window.AMZIRA = {
    auth: { login, register, logout, getCurrentUser, isAuthenticated },
    products: { getProducts, getProductDetail, searchProducts },
    cart: { getCart, addToCart, updateCartItem, removeFromCart, clearCart },
    orders: { createOrder, getOrders, getOrderDetail },
    payments: { createPaymentOrder, verifyPayment },
    addresses: { getAddresses, addAddress }
};