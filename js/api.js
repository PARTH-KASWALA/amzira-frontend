// Centralized API client for FastAPI backend contract.
// Contract: { success: boolean, data: object|null, message: string }

const API_BASE_URL = (() => {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000/api/v1';
    }

    if (hostname.includes('staging')) {
        return 'https://api-staging.amzira.com/api/v1';
    }

    return 'https://api.amzira.com/api/v1';
})();

const USER_STORAGE_KEY = 'user';
let csrfTokenCache = null;

function getStoredUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (_) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
}

function storeUserProfile(userLike) {
    if (!userLike) return null;

    const user = userLike.user || userLike;
    if (!user || typeof user !== 'object') return null;

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
}

function clearUserProfile() {
    localStorage.removeItem(USER_STORAGE_KEY);
}

function isUnsafeMethod(method) {
    const upper = (method || 'GET').toUpperCase();
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upper);
}

function extractErrorMessage(payload, fallback = 'Request failed') {
    if (!payload) return fallback;

    if (typeof payload === 'string') return payload;
    if (payload.message) return payload.message;
    if (payload.detail) {
        if (typeof payload.detail === 'string') return payload.detail;
        try {
            return JSON.stringify(payload.detail);
        } catch (_) {
            return fallback;
        }
    }

    return fallback;
}

function getUserFriendlyMessage(error) {
    const message = String(error?.message || '');

    if (message.includes('Unable to reach the server') || message.includes('Failed to fetch') || message.includes('NetworkError')) {
        return 'Network error. Please check your connection.';
    }

    if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
        return 'Please login to continue.';
    }

    return 'Something went wrong. Please try again.';
}

async function parseJsonSafe(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;

    try {
        return await response.json();
    } catch (_) {
        return null;
    }
}

async function getCsrfToken(force = false) {
    if (csrfTokenCache && !force) return csrfTokenCache;

    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
        throw new Error(extractErrorMessage(payload, 'Failed to fetch CSRF token'));
    }

    if (!payload || payload.success !== true) {
        throw new Error(extractErrorMessage(payload, 'Failed to fetch CSRF token'));
    }

    const token = payload.data?.csrf_token || payload.data?.csrfToken || payload.data?.token;
    csrfTokenCache = token || null;
    return csrfTokenCache;
}

async function refreshSession() {
    let csrfToken = csrfTokenCache;
    if (!csrfToken) {
        try {
            csrfToken = await getCsrfToken();
        } catch (_) {
            csrfToken = null;
        }
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers
    });

    const payload = await parseJsonSafe(response);
    return response.ok && payload && payload.success === true;
}

async function apiRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const retryOn401 = options.retryOn401 !== false;

    const headers = {
        ...(options.headers || {})
    };

    const fetchOptions = {
        method,
        credentials: 'include',
        headers
    };

    if (options.body !== undefined) {
        fetchOptions.body = options.body;

        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
    }

    if (isUnsafeMethod(method) && options.withoutCsrf !== true) {
        const csrfToken = await getCsrfToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    } catch (error) {
        const wrapped = new Error('Unable to reach the server. Please try again.');
        wrapped.cause = error;
        wrapped.endpoint = endpoint;

        if (window.errorHandler && typeof window.errorHandler.showError === 'function') {
            window.errorHandler.showError(getUserFriendlyMessage(wrapped));
        }

        if (window.analytics && typeof window.analytics.trackError === 'function') {
            window.analytics.trackError(wrapped, endpoint);
        }

        throw wrapped;
    }

    if (response.status === 401 && retryOn401 && !endpoint.includes('/auth/refresh')) {
        const refreshed = await refreshSession();
        if (refreshed) {
            return apiRequest(endpoint, {
                ...options,
                retryOn401: false
            });
        }
    }

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
        const error = new Error(extractErrorMessage(payload, `HTTP ${response.status}`));
        error.status = response.status;
        error.endpoint = endpoint;

        if (window.errorHandler && typeof window.errorHandler.showError === 'function') {
            window.errorHandler.showError(getUserFriendlyMessage(error));
        }

        if (window.analytics && typeof window.analytics.trackError === 'function') {
            window.analytics.trackError(error, endpoint);
        }

        throw error;
    }

    if (!payload || typeof payload.success !== 'boolean') {
        const error = new Error('Invalid API response format');
        error.endpoint = endpoint;

        if (window.errorHandler && typeof window.errorHandler.showError === 'function') {
            window.errorHandler.showError(getUserFriendlyMessage(error));
        }

        if (window.analytics && typeof window.analytics.trackError === 'function') {
            window.analytics.trackError(error, endpoint);
        }

        throw error;
    }

    if (payload.success === false) {
        const error = new Error(extractErrorMessage(payload, 'Request failed'));
        error.endpoint = endpoint;

        if (window.errorHandler && typeof window.errorHandler.showError === 'function') {
            window.errorHandler.showError(getUserFriendlyMessage(error));
        }

        if (window.analytics && typeof window.analytics.trackError === 'function') {
            window.analytics.trackError(error, endpoint);
        }

        throw error;
    }

    return payload.data;
}

async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    storeUserProfile(data);
    return data;
}

async function register(payload) {
    const normalized = {
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name || payload.name || payload.fullName,
        phone: payload.phone
    };

    const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(normalized)
    });

    return data;
}

async function logout() {
    try {
        await apiRequest('/auth/logout', {
            method: 'POST',
            retryOn401: false
        });
    } finally {
        clearUserProfile();
    }
}

async function checkAuth() {
    const user = getStoredUser();
    if (!user) {
        return { authenticated: false, user: null };
    }

    try {
        const refreshed = await refreshSession();
        if (!refreshed) {
            clearUserProfile();
            return { authenticated: false, user: null };
        }

        return { authenticated: true, user: getStoredUser() };
    } catch (_) {
        clearUserProfile();
        return { authenticated: false, user: null };
    }
}

async function getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/products?${query}` : '/products';
    return apiRequest(endpoint);
}

async function getProductDetail(slug) {
    return apiRequest(`/products/${slug}`);
}

async function searchProducts(query) {
    return apiRequest(`/products?search=${encodeURIComponent(query)}`);
}

async function getCart() {
    return apiRequest('/cart');
}

async function addToCart(productId, variantId, quantity = 1) {
    return apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
            product_id: productId,
            variant_id: variantId,
            quantity
        })
    });
}

async function updateCartItem(itemId, quantity) {
    return apiRequest(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
    });
}

async function removeFromCart(itemId) {
    return apiRequest(`/cart/items/${itemId}`, {
        method: 'DELETE'
    });
}

async function clearCart() {
    return apiRequest('/cart', {
        method: 'DELETE'
    });
}

async function createOrder(orderPayload) {
    return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
    });
}

async function getOrders() {
    return apiRequest('/orders');
}

async function getOrderDetail(orderNumber) {
    return apiRequest(`/orders/${orderNumber}`);
}

async function createPaymentOrder(orderId) {
    return apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId })
    });
}

async function verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    return apiRequest('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
        })
    });
}

window.AMZIRA = {
    API_BASE_URL,
    apiRequest,
    csrf: {
        getCsrfToken
    },
    auth: {
        login,
        register,
        logout,
        checkAuth,
        getCurrentUser: getStoredUser,
        isAuthenticated: () => Boolean(getStoredUser()),
        clearUserProfile,
        storeUserProfile
    },
    products: {
        getProducts,
        getProductDetail,
        searchProducts
    },
    cart: {
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
    },
    orders: {
        createOrder,
        getOrders,
        getOrderDetail
    },
    payments: {
        createPaymentOrder,
        verifyPayment
    }
};
