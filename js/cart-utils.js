const CART_KEY = "cart";

function safeParse(value) {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

export function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (_) {
        return [];
    }
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(Array.isArray(cart) ? cart : []));
}

export function addToCart(product) {
    const cart = getCart();
    cart.push(product);
    saveCart(cart);
}

export function removeFromCart(productId, size) {
    const cart = getCart().filter(
        (item) => !(item?.product_id === productId && item?.size === size)
    );
    saveCart(cart);
}

export function clearCart() {
    saveCart([]);
}

export function getCartCount() {
    return getCart().reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
}

if (typeof window !== 'undefined') {
    window.CartUtils = {
        CART_KEY,
        getCart,
        saveCart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartCount,
    };
}
