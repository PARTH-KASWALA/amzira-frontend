/* ===================================
   ADDRESS MANAGEMENT SYSTEM
   Backend-first address manager with local selection state.
   =================================== */

class AddressManager {
    constructor() {
        this.selectedKey = 'selectedAddress';
        this.cache = [];
        this.lastLoadedAt = 0;
        this.cacheTtlMs = 15000;
        this.requestTimeoutMs = 10000;
    }

    async withTimeout(promise, label = 'Request') {
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(`${label} timed out`)), this.requestTimeoutMs);
        });
        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async ensureApiReady() {
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

    normalizeAddress(addr) {
        if (!addr || typeof addr !== 'object') return null;

        return {
            id: addr.id,
            name: addr.full_name || addr.name || '',
            mobile: addr.phone || addr.mobile || '',
            pincode: addr.pincode || '',
            address: addr.address_line1 || addr.address || '',
            locality: addr.address_line2 || addr.locality || '',
            city: addr.city || '',
            state: addr.state || '',
            addressType: addr.address_type || addr.addressType || 'home',
            isDefault: Boolean(addr.is_default || addr.isDefault)
        };
    }

    toBackendPayload(addressData) {
        return {
            full_name: addressData.name,
            phone: String(addressData.mobile || '').trim(),
            address_line1: addressData.address,
            address_line2: addressData.locality || null,
            city: addressData.city,
            state: addressData.state,
            pincode: String(addressData.pincode || '').trim(),
            country: 'India',
            address_type: addressData.addressType || 'home',
            is_default: Boolean(addressData.isDefault)
        };
    }

    async refresh(force = false) {
        if (!window.Auth || !Auth.isLoggedIn()) {
            this.cache = [];
            return [];
        }

        const shouldUseCache = !force && this.cache.length > 0 && (Date.now() - this.lastLoadedAt) < this.cacheTtlMs;
        if (shouldUseCache) {
            return this.cache;
        }

        await this.ensureApiReady();
        const response = await window.AMZIRA.users.getAddresses();
        const source = response?.addresses || response?.results || (Array.isArray(response) ? response : []);

        this.cache = source
            .map((addr) => this.normalizeAddress(addr))
            .filter(Boolean);
        this.lastLoadedAt = Date.now();

        return this.cache;
    }

    getAddresses() {
        return Array.isArray(this.cache) ? this.cache : [];
    }

    getAddressById(addressId) {
        return this.getAddresses().find((addr) => String(addr.id) === String(addressId)) || null;
    }

    async addAddress(addressData) {
        if (!window.Auth || !Auth.isLoggedIn()) {
            return { success: false, message: 'Please login first' };
        }

        if (!this.validateAddress(addressData)) {
            return { success: false, message: 'Please fill all required fields' };
        }

        try {
            await this.ensureApiReady();
            const created = await this.withTimeout(
                window.AMZIRA.users.createAddress(this.toBackendPayload(addressData)),
                'Save address'
            );
            await this.refresh(true);
            return { success: true, address: this.normalizeAddress(created) };
        } catch (error) {
            return {
                success: false,
                message: window.AMZIRA?.utils?.getApiErrorMessage
                    ? window.AMZIRA.utils.getApiErrorMessage(error, 'Failed to save address')
                    : (error?.message || 'Failed to save address')
            };
        }
    }

    async updateAddress(addressId, addressData) {
        if (!this.validateAddress(addressData)) {
            return { success: false, message: 'Please fill all required fields' };
        }

        try {
            await this.ensureApiReady();
            const updated = await this.withTimeout(
                window.AMZIRA.users.updateAddress(addressId, this.toBackendPayload(addressData)),
                'Update address'
            );
            await this.refresh(true);
            return { success: true, address: this.normalizeAddress(updated) };
        } catch (error) {
            return {
                success: false,
                message: window.AMZIRA?.utils?.getApiErrorMessage
                    ? window.AMZIRA.utils.getApiErrorMessage(error, 'Failed to update address')
                    : (error?.message || 'Failed to update address')
            };
        }
    }

    async deleteAddress(addressId) {
        try {
            await this.ensureApiReady();
            await window.AMZIRA.users.deleteAddress(addressId);
            await this.refresh(true);

            const selectedId = this.getSelectedAddressId();
            if (selectedId && String(selectedId) === String(addressId)) {
                this.clearSelectedAddress();
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: window.AMZIRA?.utils?.getApiErrorMessage
                    ? window.AMZIRA.utils.getApiErrorMessage(error, 'Failed to delete address')
                    : (error?.message || 'Failed to delete address')
            };
        }
    }

    selectAddress(addressId) {
        const address = this.getAddressById(addressId);
        if (!address) {
            return { success: false, message: 'Address not found' };
        }

        localStorage.setItem(this.selectedKey, String(address.id));
        return { success: true, address };
    }

    getSelectedAddress() {
        const addressId = localStorage.getItem(this.selectedKey);
        if (!addressId) return null;

        return this.getAddressById(addressId);
    }

    getSelectedAddressId() {
        return localStorage.getItem(this.selectedKey);
    }

    clearSelectedAddress() {
        localStorage.removeItem(this.selectedKey);
    }

    getDefaultAddress() {
        const addresses = this.getAddresses();
        return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
    }

    validateAddress(data) {
        return (
            data.name && data.name.trim() !== '' &&
            data.mobile && this.validateMobile(data.mobile) &&
            data.pincode && this.validatePincode(data.pincode) &&
            data.address && data.address.trim() !== '' &&
            data.city && data.city.trim() !== '' &&
            data.state && data.state.trim() !== ''
        );
    }

    validateMobile(mobile) {
        if (!mobile) return false;
        const cleaned = String(mobile).replace(/\D/g, '');
        return /^[6-9]\d{9}$/.test(cleaned);
    }

    validatePincode(pincode) {
        if (!pincode) return false;
        const cleaned = String(pincode).replace(/\D/g, '');
        return /^\d{6}$/.test(cleaned);
    }

    formatAddress(address) {
        return `${address.address}, ${address.locality ? `${address.locality}, ` : ''}${address.city}, ${address.state} - ${address.pincode}`;
    }
}

const AddressManager_Instance = new AddressManager();

if (typeof window !== 'undefined') {
    window.AddressManagerClass = AddressManager;
    window.AddressManager = AddressManager_Instance;
}
