const DEV_API_BASE_URL = 'http://localhost:8000/api/v1';
const STAGING_API_BASE_URL = 'https://api-staging.amzira.com/api/v1';
const PROD_API_BASE_URL = 'https://api.amzira.com/api/v1';
const PROTECTED_ROUTE_PATTERNS = ['/account', '/checkout', '/payment', '/order-success'];
const STOCK_CHECK_ENDPOINT = '/stock/check';
let unauthorizedHandled = false;

/**
 * Resolve API base URL in an environment-safe order:
 * 1) `window.__AMZIRA_API_BASE_URL__`
 * 2) `<meta name="amzira-api-base" content="...">`
 * 3) Hostname-based fallback
 * @returns {string}
 */
function resolveApiBaseUrl() {
    const runtimeOverride = window.__AMZIRA_API_BASE_URL__;
    if (typeof runtimeOverride === 'string' && runtimeOverride.trim()) {
        return runtimeOverride.trim().replace(/\/$/, '');
    }

    const metaOverride = document.querySelector('meta[name="amzira-api-base"]')?.content;
    if (typeof metaOverride === 'string' && metaOverride.trim()) {
        return metaOverride.trim().replace(/\/$/, '');
    }

    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return DEV_API_BASE_URL;
    if (hostname.includes('staging')) return STAGING_API_BASE_URL;
    return PROD_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

const USER_STORAGE_KEY = 'user';
const CSRF_COOKIE_NAME = 'csrf_token';
let csrfTokenCache = null;

class APIError extends Error {
    constructor(message, { status = null, errors = [], payload = null } = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.errors = Array.isArray(errors) ? errors : [];
        this.payload = payload;
    }
}

/**
 * Normalize backend validation payload into a plain array of strings.
 * @param {any} payload
 * @returns {string[]}
 */
function normalizeErrors(payload) {
    if (!payload) return [];

    if (Array.isArray(payload.errors)) {
        return payload.errors
            .map((entry) => {
                if (typeof entry === 'string') return entry;
                if (entry && typeof entry.message === 'string') return entry.message;
                if (entry && typeof entry.msg === 'string') return entry.msg;
                try {
                    return JSON.stringify(entry);
                } catch (_) {
                    return 'Validation error';
                }
            })
            .filter(Boolean);
    }

    if (Array.isArray(payload.detail)) {
        return payload.detail
            .map((entry) => {
                if (typeof entry === 'string') return entry;
                if (entry && typeof entry.msg === 'string') return entry.msg;
                if (entry && typeof entry.message === 'string') return entry.message;
                return '';
            })
            .filter(Boolean);
    }

    return [];
}

function parseStoredJson(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (_) {
        localStorage.removeItem(key);
        return null;
    }
}

function getStoredUser() {
    return parseStoredJson(USER_STORAGE_KEY);
}

function storeUserProfile(userLike) {
    if (!userLike) return null;
    const user = userLike.user || userLike;
    if (!user || typeof user !== 'object') return null;

    const profile = {
        id: user.id,
        name: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || ''
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    return profile;
}

function clearUserProfile() {
    localStorage.removeItem(USER_STORAGE_KEY);
}

function readCookie(name) {
    const encoded = `${name}=`;
    const parts = document.cookie.split(';');
    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith(encoded)) {
            return decodeURIComponent(trimmed.substring(encoded.length));
        }
    }
    return null;
}

function isUnsafeMethod(method) {
    const upper = (method || 'GET').toUpperCase();
    return upper === 'POST' || upper === 'PUT' || upper === 'PATCH' || upper === 'DELETE';
}

function extractErrorMessage(payload, fallback = 'Request failed') {
    if (!payload) return fallback;
    if (typeof payload === 'string') return payload;
    if (payload.message) return payload.message;

    const detail = payload.detail;
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;

    try {
        return JSON.stringify(detail);
    } catch (_) {
        return fallback;
    }
}

function getDefaultMessageByStatus(status, fallback = 'Request failed') {
    if (status === 400) return 'Invalid request. Please review the form and try again.';
    if (status === 401) return 'Session expired. Please login again.';
    if (status === 403) return 'You are not authorized to perform this action.';
    if (status === 409) return 'This item changed recently. Please review your cart and try again.';
    if (status === 422) return 'Some fields are invalid. Please update and retry.';
    if (status === 429) return 'Too many requests. Please slow down.';
    return fallback;
}

/**
 * Handle an unrecoverable unauthorized API response.
 * Clears local profile, emits auth logout event, and redirects protected routes to login.
 */
function handleUnauthorizedState() {
    if (unauthorizedHandled) return;
    unauthorizedHandled = true;

    clearUserProfile();
    window.dispatchEvent(new Event('auth:logout'));

    const currentPath = window.location.pathname.toLowerCase();
    const isProtectedRoute = PROTECTED_ROUTE_PATTERNS.some((route) => currentPath.includes(route));
    const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');

    if (!isProtectedRoute || isAuthPage) return;

    try {
        sessionStorage.setItem('returnUrl', `${window.location.pathname}${window.location.search || ''}`);
    } catch (_) {
        // Ignore storage errors to avoid blocking redirect.
    }

    window.location.href = 'login.html';
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
    const cookieToken = readCookie(CSRF_COOKIE_NAME);
    if (cookieToken && !force) {
        csrfTokenCache = cookieToken;
        return cookieToken;
    }

    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include'
    });

    const payload = await parseJsonSafe(response);

    if (!response.ok || (payload && payload.success === false)) {
        throw new APIError(extractErrorMessage(payload, 'Failed to fetch CSRF token'), {
            status: response.status,
            errors: normalizeErrors(payload),
            payload
        });
    }

    const bodyToken = payload?.data?.csrf_token || payload?.data?.csrfToken || payload?.data?.token || null;
    const token = readCookie(CSRF_COOKIE_NAME) || bodyToken;
    csrfTokenCache = token || null;

    if (!csrfTokenCache) {
        throw new APIError('CSRF token unavailable', {
            status: response.status,
            errors: [],
            payload
        });
    }

    return csrfTokenCache;
}

async function refreshSession() {
    try {
        const csrfToken = await getCsrfToken();
        const headers = {};
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
    } catch (_) {
        return false;
    }
}

/**
 * Unified API request wrapper for all backend calls.
 * Adds credentials, CSRF, response contract checks, and normalized APIError failures.
 * @param {string} endpoint
 * @param {RequestInit & {retryOn401?: boolean, withoutCsrf?: boolean}} options
 * @returns {Promise<any>}
 */
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
        headers['X-CSRF-Token'] = csrfToken;
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    } catch (_) {
        throw new APIError('Unable to reach the server. Please try again.', {
            status: null,
            errors: []
        });
    }

    if (response.status === 401 && retryOn401 && !endpoint.includes('/auth/refresh')) {
        const refreshed = await refreshSession();
        if (refreshed) {
            return apiRequest(endpoint, {
                ...options,
                retryOn401: false
            });
        }
        handleUnauthorizedState();
    }

    const payload = await parseJsonSafe(response);
    const errors = normalizeErrors(payload);

    if (!response.ok) {
        const backendMessage = extractErrorMessage(payload, `HTTP ${response.status}`);
        const fallbackMessage = getDefaultMessageByStatus(response.status, backendMessage);
        const message = backendMessage && !backendMessage.startsWith('HTTP ')
            ? backendMessage
            : fallbackMessage;

        throw new APIError(message, {
            status: response.status,
            errors,
            payload
        });
    }

    if (!payload || typeof payload.success !== 'boolean') {
        throw new APIError('Invalid API response format', {
            status: response.status,
            errors: [],
            payload
        });
    }

    if (payload.success !== true) {
        throw new APIError(extractErrorMessage(payload, 'Request failed'), {
            status: response.status,
            errors,
            payload
        });
    }

    return payload.data;
}

async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    storeUserProfile(data?.user || data);
    return data;
}

async function register(payload) {
    const normalized = {
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name || payload.name || payload.fullName,
        phone: payload.phone
    };

    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(normalized)
    });
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

async function getCurrentUserProfile() {
    return apiRequest('/users/me', { retryOn401: false });
}

async function checkAuth() {
    try {
        const user = await getCurrentUserProfile();
        const stored = storeUserProfile(user);
        return { authenticated: true, user: stored || user };
    } catch (error) {
        if (error?.status === 401) {
            const refreshed = await refreshSession();
            if (refreshed) {
                try {
                    const user = await getCurrentUserProfile();
                    const stored = storeUserProfile(user);
                    return { authenticated: true, user: stored || user };
                } catch (_) {
                    clearUserProfile();
                    return { authenticated: false, user: null };
                }
            }
        }

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
    const sanitizedPayload = {
        ...orderPayload
    };

    if (typeof sanitizedPayload.customer_notes === 'string') {
        sanitizedPayload.customer_notes = sanitizedPayload.customer_notes.trim().slice(0, 500);
    }

    return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(sanitizedPayload)
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

async function getAddresses() {
    return apiRequest('/users/me/addresses');
}

async function createAddress(payload) {
    return apiRequest('/users/me/addresses', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

async function updateAddress(addressId, payload) {
    return apiRequest(`/users/me/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
}

async function deleteAddress(addressId) {
    return apiRequest(`/users/me/addresses/${addressId}`, {
        method: 'DELETE'
    });
}

/**
 * Validate current cart stock availability before checkout/payment.
 * Expects backend to return `available` and optional affected item metadata.
 * @returns {Promise<any>}
 */
async function checkStock() {
    return apiRequest(STOCK_CHECK_ENDPOINT);
}

function isIpRestrictionError(error) {
    const message = String(error?.message || '').toLowerCase();
    return error?.status === 403 && message.includes('ip') && message.includes('restrict');
}

function ensureAdminWarningStyles() {
    if (document.getElementById('amzira-admin-warning-style')) return;
    const style = document.createElement('style');
    style.id = 'amzira-admin-warning-style';
    style.textContent = `
        .amzira-admin-warning-banner {
            position: sticky;
            top: 0;
            z-index: 10001;
            background: #fff4e5;
            color: #7a3e00;
            border-bottom: 1px solid #ffd8a8;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

function showAdminWarningBanner(message) {
    ensureAdminWarningStyles();

    let banner = document.getElementById('amzira-admin-warning-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'amzira-admin-warning-banner';
        banner.className = 'amzira-admin-warning-banner';
        document.body.prepend(banner);
    }

    banner.textContent = message;
}

function formatApiError(error, fallback = 'Request failed') {
    if (error?.errors && Array.isArray(error.errors) && error.errors.length) {
        return `${error.message || fallback} (${error.errors.join(', ')})`;
    }
    return error?.message || fallback;
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function getApiErrorMessage(error, fallback = 'Request failed') {
    if (!error) return fallback;
    const preferred = formatApiError(error, fallback);
    const fallbackByStatus = getDefaultMessageByStatus(error.status, preferred);

    if (error?.message && error.message !== `HTTP ${error.status}`) {
        return preferred;
    }

    return fallbackByStatus;
}

function handleApiError(error, { fallback = 'Request failed', showToast = true } = {}) {
    const message = getApiErrorMessage(error, fallback);

    if (showToast && window.errorHandler && typeof window.errorHandler.showError === 'function') {
        window.errorHandler.showError(message);
    }

    return {
        status: error?.status || null,
        message,
        errors: Array.isArray(error?.errors) ? error.errors : []
    };
}

async function runAdminAction(endpoint, options = {}) {
    try {
        return await apiRequest(endpoint, options);
    } catch (error) {
        if (isIpRestrictionError(error)) {
            showAdminWarningBanner('This admin action failed due to IP restriction.');
        }
        throw new APIError(formatApiError(error, 'Admin action failed'), {
            status: error?.status || null,
            errors: Array.isArray(error?.errors) ? error.errors : [],
            payload: error?.payload || null
        });
    }
}

async function triggerTestEmail(payload = {}) {
    const data = await runAdminAction('/admin/test-email', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    const taskId = data?.task_id || data?.taskId || null;
    const message = taskId
        ? `Test email triggered successfully. Task ID: ${taskId}`
        : 'Test email triggered successfully.';

    if (window.errorHandler && typeof window.errorHandler.showSuccess === 'function') {
        window.errorHandler.showSuccess(message, 'Email Test');
    }

    return data;
}

window.AMZIRA = {
    API_BASE_URL,
    APIError,
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
        getCurrentUserProfile,
        isAuthenticated: () => Boolean(getStoredUser()),
        clearUserProfile,
        storeUserProfile
    },
    users: {
        getCurrentUserProfile,
        getAddresses,
        createAddress,
        updateAddress,
        deleteAddress
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
    },
    stock: {
        check: checkStock
    },
    admin: {
        runAction: runAdminAction,
        triggerTestEmail,
        showWarningBanner: showAdminWarningBanner
    },
    utils: {
        formatApiError,
        getApiErrorMessage,
        handleApiError,
        escapeHtml
    }
};
