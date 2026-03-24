export function createDeliveryChecker({ getPdpEl, getProductSlug, ensureApiReady, esc }) {
    async function checkDelivery() {
        const resultDiv = getPdpEl('deliveryResult');
        const pincode = String(getPdpEl('pincodeInput')?.value || '').replace(/\D/g, '');
        const slug = getProductSlug();
        if (!resultDiv) return;
        if (pincode.length != 6) {
            resultDiv.className = 'delivery-result info';
            resultDiv.innerHTML = '<i class="fas fa-info-circle"></i> Please enter a valid 6-digit pincode.';
            return;
        }
        if (!slug) {
            resultDiv.className = 'delivery-result info';
            resultDiv.innerHTML = '<i class="fas fa-info-circle"></i> Missing product slug for delivery lookup.';
            return;
        }

        resultDiv.className = 'delivery-result info';
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking delivery options...';
        try {
            await ensureApiReady();
            const payload = await window.AMZIRA.apiRequest(`/products/${encodeURIComponent(String(slug))}/delivery-estimate?pincode=${encodeURIComponent(pincode)}`);
            const data = payload?.data || payload || {};
            const startDate = data?.estimated_delivery_date_start;
            const endDate = data?.estimated_delivery_date_end;
            const eta = startDate && endDate
                ? `${new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : `${data?.delivery_days_min ?? 4}-${data?.delivery_days_max ?? 6} days`;
            const cod = data?.cod_available === false ? 'COD unavailable' : 'COD available';
            const shipping = Number(data?.shipping_cost || 0) <= 0 ? 'Free shipping' : `Shipping ₹${Number(data.shipping_cost).toLocaleString('en-IN')}`;
            resultDiv.className = 'delivery-result success';
            resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> Delivery: ${esc(String(eta))} | ${esc(cod)} | ${esc(shipping)}`;
        } catch {
            const dayOffset = (Number(pincode.slice(-1)) % 3) + 3;
            const date = new Date();
            date.setDate(date.getDate() + dayOffset);
            resultDiv.className = 'delivery-result success';
            resultDiv.innerHTML = `<i class="fas fa-truck"></i> Estimated delivery by ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. COD availability shown at checkout.`;
        }
    }

    function bindDeliveryControls() {
        const deliveryBtn = getPdpEl('checkDeliveryBtn');
        const pincodeInput = getPdpEl('pincodeInput');
        if (deliveryBtn) deliveryBtn.addEventListener('click', () => checkDelivery());
        if (pincodeInput) {
            pincodeInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') checkDelivery();
            });
        }
    }

    return { checkDelivery, bindDeliveryControls };
}
