(function () {
    window.__AMZIRA_SIMPLE_CHECKOUT__ = true;

    const state = {
        userId: null,
        selectedAddressId: null,
        checkoutValidated: false,
        checkoutPreview: null,
        cart: null,
        isSubmitting: false,
    };
    const ORDER_SUCCESS_KEY = "last_order_number";

    function getApiBaseUrl() {
        if (window.AMZIRA && typeof window.AMZIRA.API_BASE_URL === "string") {
            return window.AMZIRA.API_BASE_URL.replace(/\/$/, "");
        }

        const { protocol, hostname } = window.location;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return `${protocol}//${hostname}:8000/api/v1`;
        }

        return `${window.location.origin}/api/v1`;
    }

    function getBackendOrigin() {
        return getApiBaseUrl().replace(/\/api\/v1$/, "");
    }

    async function ensureCsrfToken() {
        await fetch(`${getApiBaseUrl()}/auth/csrf-token`, {
            method: "GET",
            credentials: "include",
        });
    }

    function readCookie(name) {
        const prefix = `${name}=`;
        return document.cookie
            .split(";")
            .map((part) => part.trim())
            .find((part) => part.startsWith(prefix))
            ?.slice(prefix.length) || "";
    }

    async function apiFetch(path, options = {}) {
        const method = (options.method || "GET").toUpperCase();
        const headers = {
            ...(options.headers || {}),
        };

        if (method !== "GET") {
            await ensureCsrfToken();
            const csrfToken = readCookie("csrf_token");
            if (csrfToken) {
                headers["X-CSRF-Token"] = csrfToken;
            }
        }

        const response = await fetch(`${getBackendOrigin()}${path}`, {
            method,
            credentials: "include",
            headers,
            body: options.body,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || `Request failed (${response.status})`);
        }
        return payload.data;
    }

    function getUserId() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get("user_id");
        if (fromQuery) return Number(fromQuery);

        try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "null");
            if (storedUser?.id) return Number(storedUser.id);
        } catch (_) {
            // Ignore invalid local storage payload.
        }

        const storedFallback = localStorage.getItem("checkout_user_id");
        if (storedFallback) return Number(storedFallback);

        return null;
    }

    function formatINR(value) {
        const amount = Number(value || 0);
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    function setProceedButtonState() {
        const button = document.querySelector(".continue-payment-btn");
        if (!button) return;

        const hasCart = Array.isArray(state.cart?.items) && state.cart.items.length > 0;
        const hasAddress = Boolean(document.querySelector('input[name="selectedAddress"]:checked'));
        button.disabled = !hasCart || !hasAddress || state.isSubmitting;
        button.textContent = state.isSubmitting
            ? "Processing..."
            : (state.checkoutValidated ? "Pay Now" : "Continue to Payment");
    }

    function renderCart(cart) {
        state.cart = cart;

        const cartItemsEl = document.getElementById("cartItems");
        if (cartItemsEl) {
            if (!cart.items.length) {
                cartItemsEl.innerHTML = "<p>Your cart is empty</p>";
            } else {
                cartItemsEl.innerHTML = cart.items.map((item) => `
                    <div class="cart-item">
                        <div class="item-details">
                            <div class="item-name">${item.product_name}</div>
                            <div class="item-meta">Qty: ${item.quantity}</div>
                            <div class="item-price">${formatINR(item.total_price)}</div>
                        </div>
                    </div>
                `).join("");
            }
        }

        const subtotalEl = document.getElementById("subtotal");
        const taxEl = document.getElementById("tax");
        const totalEl = document.getElementById("total");
        if (subtotalEl) subtotalEl.textContent = formatINR(cart.subtotal);
        if (taxEl) taxEl.textContent = formatINR(cart.tax);
        if (totalEl) totalEl.textContent = formatINR(cart.total);

        setProceedButtonState();
    }

    function renderAddresses(addresses) {
        const container = document.querySelector(".address-list");
        if (!container) return;

        container.innerHTML = "";

        if (!addresses.length) {
            container.innerHTML = "<p>No saved addresses</p>";
            state.selectedAddressId = null;
            setProceedButtonState();
            return;
        }

        const defaultAddress = addresses.find((addr) => addr.is_default || addr.isDefault) || addresses[0];
        const selectedId = state.selectedAddressId || localStorage.getItem("selectedAddressId") || String(defaultAddress.id);
        state.selectedAddressId = String(selectedId);

        addresses.forEach((addr) => {
            const card = document.createElement("div");
            card.className = "address-card";
            if (String(addr.id) === String(selectedId)) {
                card.classList.add("selected");
            }

            card.innerHTML = `
                <input type="radio" name="selectedAddress" value="${addr.id}" ${String(addr.id) === String(selectedId) ? "checked" : ""} />
                <p><strong>${addr.name}</strong></p>
                <p>${addr.address_line}</p>
                <p>${addr.city}, ${addr.state} - ${addr.pincode}</p>
                <p>${addr.phone}</p>
                ${(addr.is_default || addr.isDefault) ? "<span class='default-badge'>Default</span>" : ""}
            `;

            const radio = card.querySelector('input[name="selectedAddress"]');
            radio.addEventListener("change", () => {
                state.selectedAddressId = String(addr.id);
                state.checkoutValidated = false;
                localStorage.setItem("selectedAddressId", String(addr.id));
                document.querySelectorAll(".address-card").forEach((node) => node.classList.remove("selected"));
                card.classList.add("selected");
                setProceedButtonState();
            });

            card.addEventListener("click", () => radio.click());
            container.appendChild(card);
        });

        setProceedButtonState();
    }

    async function loadCart() {
        const cart = await apiFetch(`/cart/${state.userId}`);
        renderCart(cart);
        return cart;
    }

    async function loadAddresses() {
        const addresses = await apiFetch(`/addresses/${state.userId}`);
        renderAddresses(addresses);
        return addresses;
    }

    async function saveAddress(event) {
        event.preventDefault();

        const newAddress = {
            user_id: state.userId,
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            address_line: document.getElementById("address").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value,
            pincode: document.getElementById("pincode").value,
        };

        await apiFetch("/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAddress),
        });

        alert("Address saved");
        document.getElementById("address-form").reset();
        document.getElementById("address-form-container").style.display = "none";
        state.checkoutValidated = false;
        await loadAddresses();
    }

    async function validateCheckout() {
        const selected = document.querySelector('input[name="selectedAddress"]:checked');
        if (!selected) {
            alert("Select address");
            return null;
        }

        const preview = await apiFetch("/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: state.userId,
                address_id: Number(selected.value),
            }),
        });

        state.selectedAddressId = String(selected.value);
        state.checkoutValidated = true;
        state.checkoutPreview = preview;
        setProceedButtonState();
        return preview;
    }

    async function ensureRazorpaySdk() {
        if (typeof window.Razorpay === "function") {
            return;
        }
        throw new Error("Razorpay SDK is not loaded");
    }

    async function createPaymentOrder() {
        const selected = document.querySelector('input[name="selectedAddress"]:checked');
        if (!selected) {
            alert("Please select a delivery address");
            return null;
        }

        const paymentOrder = await apiFetch("/create-payment-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: state.userId,
                address_id: Number(selected.value),
            }),
        });

        return {
            ...paymentOrder,
            addressId: Number(selected.value),
        };
    }

    async function openRazorpayCheckout(paymentOrder) {
        await ensureRazorpaySdk();

        function redirectToOrderSuccess(orderRef) {
            const normalizedOrderRef = orderRef || "UNKNOWN";
            sessionStorage.setItem(ORDER_SUCCESS_KEY, normalizedOrderRef);
            const redirectUrl = `/order-success.html?order=${encodeURIComponent(normalizedOrderRef)}`;
            console.log("Redirecting now...", redirectUrl);
            window.location.href = redirectUrl;
        }

        const options = {
            key: paymentOrder.razorpay_key_id,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency || "INR",
            order_id: paymentOrder.razorpay_order_id,
            name: "AMZIRA",
            description: "Checkout Payment",
            handler: async function (response) {
                console.log("Payment success response:", response);

                let orderRef = response.razorpay_order_id || "UNKNOWN";

                try {
                    const result = await apiFetch("/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    console.log("Verify API result:", result);
                    orderRef = result.order_number || result.order_id || orderRef;
                } catch (error) {
                    console.error("Verify error:", error);
                    orderRef = "ERROR";
                } finally {
                    state.checkoutValidated = false;
                    state.checkoutPreview = null;
                    loadCart().catch((cartError) => {
                        console.error("Cart refresh failed after payment:", cartError);
                    });
                    redirectToOrderSuccess(orderRef);
                }
            },
            modal: {
                ondismiss: function () {
                    state.checkoutValidated = false;
                    state.checkoutPreview = null;
                    setProceedButtonState();
                },
            },
            theme: {
                color: "#8b1538",
            },
        };

        console.log("Opening Razorpay...");
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    }

    async function handleProceed() {
        if (state.isSubmitting) return;
        if (!document.querySelector('input[name="selectedAddress"]:checked')) {
            alert("Please select a delivery address");
            return;
        }

        state.isSubmitting = true;
        setProceedButtonState();

        if (!state.checkoutValidated) {
            try {
                await validateCheckout();
                return;
            } finally {
                state.isSubmitting = false;
                setProceedButtonState();
            }
        }

        try {
            const paymentOrder = await createPaymentOrder();
            if (!paymentOrder) {
                return;
            }
            await openRazorpayCheckout(paymentOrder);
        } finally {
            state.isSubmitting = false;
            setProceedButtonState();
        }
    }

    function bindEvents() {
        const addAddressBtn = document.querySelector(".add-address-btn");
        if (addAddressBtn) {
            addAddressBtn.addEventListener("click", () => {
                document.getElementById("address-form-container").style.display = "block";
            });
        }

        const addressForm = document.getElementById("address-form");
        if (addressForm) {
            addressForm.addEventListener("submit", saveAddress);
        }

        const proceedBtn = document.querySelector(".continue-payment-btn");
        if (proceedBtn) {
            proceedBtn.addEventListener("click", handleProceed);
        }
    }

    async function initializeProductionCheckout() {
        state.userId = getUserId();
        if (!state.userId) {
            const cartItemsEl = document.getElementById("cartItems");
            if (cartItemsEl) {
                cartItemsEl.innerHTML = "<p>Unable to resolve user. Login first or pass ?user_id=...</p>";
            }
            return;
        }

        localStorage.setItem("checkout_user_id", String(state.userId));
        bindEvents();
        await Promise.all([loadCart(), loadAddresses()]);
    }

    if (typeof window !== "undefined") {
        window.loadAddresses = loadAddresses;
        window.initializeProductionCheckout = initializeProductionCheckout;
    }

    document.addEventListener("DOMContentLoaded", initializeProductionCheckout);
})();
