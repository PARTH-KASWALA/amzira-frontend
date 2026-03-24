(function () {
    const params = new URLSearchParams(window.location.search);
    const orderRef = params.get("order") || params.get("order_id");
    const apiBase = window.AMZIRA?.API_BASE_URL || `${window.location.origin}/api/v1`;

    const nodes = {
        heroOrderId: document.getElementById("heroOrderId"),
        heroCurrentStatus: document.getElementById("heroCurrentStatus"),
        statusCopy: document.getElementById("statusCopy"),
        errorCopy: document.getElementById("errorCopy"),
        summaryOrderId: document.getElementById("summaryOrderId"),
        summaryOrderDate: document.getElementById("summaryOrderDate"),
        summaryPaymentStatus: document.getElementById("summaryPaymentStatus"),
        summaryOrderStatus: document.getElementById("summaryOrderStatus"),
        orderTotal: document.getElementById("orderTotal"),
        estimatedDelivery: document.getElementById("estimatedDelivery"),
        detailDeliveryEstimate: document.getElementById("detailDeliveryEstimate"),
        paymentBadge: document.getElementById("paymentBadge"),
        orderBadge: document.getElementById("orderBadge"),
        timeline: document.getElementById("timeline"),
        courierName: document.getElementById("courierName"),
        trackingId: document.getElementById("trackingId"),
        currentLocation: document.getElementById("currentLocation"),
        trackingFallback: document.getElementById("trackingFallback"),
        courierTrackButton: document.getElementById("courierTrackButton"),
        returnBadge: document.getElementById("returnBadge"),
        countdown: document.getElementById("countdown"),
        returnCopy: document.getElementById("returnCopy"),
        returnButton: document.getElementById("returnButton"),
        itemsList: document.getElementById("itemsList"),
    };

    const STATUS_TEXT = {
        PLACED: "Placed",
        CONFIRMED: "Confirmed",
        PROCESSING: "Processing",
        SHIPPED: "Shipped",
        OUT_FOR_DELIVERY: "Out for Delivery",
        DELIVERED: "Delivered",
        RETURN_REQUESTED: "Return Requested",
        RETURNED: "Returned",
    };

    const STEP_META = {
        PLACED: "Your order has been received and recorded successfully.",
        CONFIRMED: "Payment is confirmed and your items are being prepared.",
        SHIPPED: "The shipment has been handed over to the courier network.",
        OUT_FOR_DELIVERY: "The courier has your package and delivery is underway.",
        DELIVERED: "The package has reached the delivery address successfully.",
        RETURN_REQUESTED: "A return request is active and reverse pickup is being planned.",
        RETURNED: "The reverse shipment has been completed.",
    };

    let activeOrderId = null;
    let returnTimer = null;
    const FIXED_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

    function formatDate(value, options = {}) {
        if (!value) {
            return "-";
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return "-";
        }

        return parsed.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: options.includeTime === false ? undefined : "numeric",
            minute: options.includeTime === false ? undefined : "2-digit",
        });
    }

    function formatMoney(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    }

    function formatDuration(ms) {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }

    function humanizeStatus(status) {
        const normalized = String(status || "").toUpperCase();
        return STATUS_TEXT[normalized] || normalized.replace(/_/g, " ") || "Pending";
    }

    function escapeHtml(value) {
        if (window.AMZIRA?.utils?.escapeHtml) {
            return window.AMZIRA.utils.escapeHtml(value);
        }

        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function setBadge(node, label, tone) {
        node.textContent = label;
        node.className = `status-badge ${tone}`;
    }

    function showError(message) {
        nodes.errorCopy.hidden = false;
        nodes.errorCopy.textContent = message;
        nodes.statusCopy.textContent = "We could not load this order right now.";
        nodes.heroCurrentStatus.textContent = "Unavailable";
    }

    function renderItems(items) {
        if (!Array.isArray(items) || items.length === 0) {
            nodes.itemsList.innerHTML = '<div class="empty-callout">Item details will appear here once the order is synchronized.</div>';
            return;
        }

        nodes.itemsList.innerHTML = items.map((item) => `
            <article class="item-card">
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.product_name || "Item")}" class="item-card__image">` : ""}
                <h3>${escapeHtml(item.product_name || "Item")}</h3>
                <p>${escapeHtml(item.variant_details || "Standard configuration")}</p>
                <p>Qty: ${Number(item.quantity || 0)}</p>
                <p>Total: ${formatMoney(item.total_price || item.price)}</p>
            </article>
        `).join("");
    }

    function buildTimeline(tracking, order) {
        const trackingStatus = String(
            tracking?.tracking?.current_status || tracking?.status || order?.public_status || order?.status || "PLACED"
        ).toUpperCase();
        const backendTimeline = Array.isArray(tracking?.tracking?.timeline) && tracking.tracking.timeline.length
            ? tracking.tracking.timeline
            : Array.isArray(tracking?.timeline) && tracking.timeline.length
                ? tracking.timeline
                : Array.isArray(order?.timeline)
                    ? order.timeline
                    : [];
        const timelineMap = new Map(
            backendTimeline.map((step) => [String(step.status || "").toUpperCase(), step])
        );
        const activeIndex = Math.max(FIXED_STEPS.indexOf(trackingStatus), 0);

        return FIXED_STEPS.map((normalized, index) => {
            const step = timelineMap.get(normalized) || {};
            let timestamp = "";

            if ((normalized === "PLACED" || normalized === "CONFIRMED") && order?.created_at) {
                timestamp = formatDate(order.created_at);
            } else if (normalized === "DELIVERED" && order?.delivered_at) {
                timestamp = formatDate(order.delivered_at);
            } else if (normalized === "OUT_FOR_DELIVERY" && tracking?.expected_delivery) {
                timestamp = formatDate(tracking.expected_delivery);
            } else if (normalized === "SHIPPED" && order?.pickup_scheduled_at) {
                timestamp = formatDate(order.pickup_scheduled_at);
            } else if (normalized === trackingStatus && tracking?.expected_delivery && normalized !== "DELIVERED") {
                timestamp = formatDate(tracking.expected_delivery);
            }

            return {
                label: humanizeStatus(normalized),
                status: normalized,
                completed: Boolean(step.completed) || index < activeIndex || (normalized === trackingStatus && normalized === "DELIVERED"),
                current: Boolean(step.current) || normalized === trackingStatus,
                timestamp,
                description: normalized === "OUT_FOR_DELIVERY" && tracking?.location
                    ? `Current location: ${tracking.location}.`
                    : STEP_META[normalized] || "The courier will update this stage once it is reached.",
            };
        });
    }

    function renderTimeline(steps) {
        if (!Array.isArray(steps) || steps.length === 0) {
            nodes.timeline.innerHTML = '<div class="empty-callout">Tracking milestones will appear here as the shipment progresses.</div>';
            return;
        }

        nodes.timeline.innerHTML = steps.map((step) => {
            const marker = step.completed ? "✓" : step.current ? "•" : "";
            const classes = [
                "timeline-step",
                step.completed ? "timeline-step--complete" : "",
                step.current ? "timeline-step--current" : "",
            ].filter(Boolean).join(" ");

            return `
                <div class="${classes}">
                    <div class="timeline-step__rail">
                        <div class="timeline-step__icon">${marker}</div>
                    </div>
                    <div class="timeline-step__body">
                        <div class="timeline-step__meta">
                            <strong class="timeline-step__title">${escapeHtml(step.label)}</strong>
                            <span class="timeline-step__time">${escapeHtml(step.timestamp || "Awaiting update")}</span>
                        </div>
                        <p class="timeline-step__copy">${escapeHtml(step.description)}</p>
                    </div>
                </div>
            `;
        }).join("");
    }

    async function requestReturn() {
        if (!activeOrderId) {
            return;
        }

        nodes.returnButton.disabled = true;

        try {
            await window.AMZIRA.apiRequest(`/orders/${activeOrderId}/return`, {
                method: "POST",
                body: JSON.stringify({
                    reason: "other",
                    description: "Return requested from order tracking page",
                }),
            });

            nodes.returnBadge.hidden = true;
            nodes.countdown.textContent = "00:00:00";
            nodes.returnCopy.textContent = "Your return request has been submitted successfully.";
        } catch (error) {
            nodes.returnButton.disabled = false;
            nodes.returnCopy.textContent = window.AMZIRA?.utils?.getApiErrorMessage
                ? window.AMZIRA.utils.getApiErrorMessage(error, "Return request failed.")
                : (error?.message || "Return request failed.");
        }
    }

    async function renderReturnWindow(order) {
        if (returnTimer) {
            returnTimer.stop();
            returnTimer = null;
        }

        nodes.returnButton.disabled = true;
        nodes.returnBadge.hidden = true;
        nodes.countdown.textContent = "--:--:--";
        nodes.returnCopy.textContent = "Return eligibility will appear after delivery is confirmed.";

        if (!order?.id || !order?.delivered_at || !window.AMZIRA?.apiRequest) {
            return;
        }

        activeOrderId = order.id;

        try {
            const eligibility = await window.AMZIRA.apiRequest(`/orders/${order.id}/return-eligibility`);
            if (!eligibility?.eligible) {
                nodes.returnCopy.textContent = eligibility?.reason || "The return window is unavailable for this order.";
                return;
            }

            nodes.returnBadge.hidden = false;
            nodes.returnButton.disabled = false;
            nodes.returnButton.onclick = requestReturn;
            nodes.returnCopy.textContent = `Return available until ${formatDate(eligibility.return_deadline)}.`;

            returnTimer = new window.ReturnTimer(eligibility, {
                onTick(ms) {
                    nodes.countdown.textContent = formatDuration(ms);
                },
                onExpire() {
                    nodes.returnBadge.hidden = true;
                    nodes.returnButton.disabled = true;
                    nodes.countdown.textContent = "00:00:00";
                    nodes.returnCopy.textContent = "The return window has expired.";
                },
            });
            returnTimer.start();
        } catch (_) {
            nodes.returnCopy.textContent = "Sign in to manage returns for this order.";
        }
    }

    function renderTracking(order, tracking) {
        const orderLabel = order?.order_number || tracking?.order_number || orderRef || "-";
        const currentStatus = humanizeStatus(
            tracking?.tracking?.current_status || tracking?.status || order?.public_status || order?.status
        );
        const paymentStatus = humanizeStatus(order?.payment_status || tracking?.payment_status);
        const courierName = tracking?.courier || tracking?.courier_name || order?.courier_name || "-";
        const trackingId = tracking?.awb_code || order?.awb_code || order?.tracking_number || "Awaiting assignment";
        const currentLocation = tracking?.tracking?.location || tracking?.location || order?.current_location || "Awaiting courier scan";
        const deliveryEstimate = tracking?.tracking?.expected_delivery || tracking?.expected_delivery || order?.estimated_delivery;
        const trackingUrl = tracking?.tracking_url || order?.tracking_url;
        const publicStatus = String(order?.public_status || tracking?.status || order?.status || "PLACED").toUpperCase();

        nodes.heroOrderId.textContent = orderLabel;
        nodes.heroCurrentStatus.textContent = currentStatus;
        nodes.statusCopy.textContent = `Latest update: ${currentStatus}${currentLocation && currentLocation !== "Awaiting courier scan" ? ` from ${currentLocation}` : ""}.`;
        nodes.summaryOrderId.textContent = orderLabel;
        nodes.summaryOrderDate.textContent = formatDate(order?.created_at, { includeTime: false });
        nodes.summaryPaymentStatus.textContent = paymentStatus;
        nodes.summaryOrderStatus.textContent = currentStatus;
        nodes.orderTotal.textContent = formatMoney(order?.total || order?.total_amount);
        nodes.estimatedDelivery.textContent = formatDate(deliveryEstimate, { includeTime: false });
        nodes.detailDeliveryEstimate.textContent = formatDate(deliveryEstimate, { includeTime: false });
        nodes.courierName.textContent = courierName;
        nodes.trackingId.textContent = trackingId;
        nodes.currentLocation.textContent = currentLocation;

        setBadge(
            nodes.paymentBadge,
            `Payment ${paymentStatus}`,
            String(order?.payment_status || "").toLowerCase() === "success"
                ? "status-badge--success"
                : "status-badge--warning"
        );

        setBadge(
            nodes.orderBadge,
            currentStatus,
            ["DELIVERED", "RETURN_REQUESTED", "RETURNED"].includes(publicStatus)
                ? "status-badge--success"
                : ["CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(publicStatus)
                    ? "status-badge--warning"
                    : "status-badge--neutral"
        );

        if (trackingUrl) {
            nodes.courierTrackButton.hidden = false;
            nodes.courierTrackButton.href = trackingUrl;
            nodes.trackingFallback.hidden = true;
        } else {
            nodes.courierTrackButton.hidden = true;
            nodes.trackingFallback.hidden = false;
        }

        renderTimeline(buildTimeline(tracking, order));
        renderItems(order?.items || []);
        renderReturnWindow(order);
    }

    async function fetchTrackingPayload() {
        const response = await fetch(`${apiBase}/orders/${encodeURIComponent(orderRef)}/tracking`, {
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (_) {
            throw new Error("Unable to parse tracking response.");
        }

        if (!response.ok || payload?.status !== "success") {
            throw new Error(payload?.message || "Unable to load tracking details.");
        }

        return payload;
    }

    async function loadTracking() {
        if (!orderRef) {
            showError("Missing order ID in the URL.");
            return;
        }

        try {
            const payload = await fetchTrackingPayload();
            renderTracking(payload.order || {}, payload.data || {});
        } catch (error) {
            showError(error.message || "Unable to reach server.");
        }
    }

    loadTracking();
})();
