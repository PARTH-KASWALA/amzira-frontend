/* ===================================
   ADDRESS MANAGEMENT SYSTEM
   Shared localStorage-backed address manager.
   =================================== */

class AddressManager {
    constructor() {
        this.storageKey = 'addresses';
        this.selectedKey = 'selectedAddressId';
        this.cache = this.getAddresses();
    }

    parseAddresses(value) {
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    normalizeAddress(addr) {
        if (!addr || typeof addr !== 'object') return null;

        const id = addr.id ?? Date.now();
        const name = String(addr.name || addr.full_name || '').trim();
        const phone = String(addr.phone || addr.mobile || '').trim();
        const addressLine = String(addr.addressLine || addr.address_line1 || addr.address || '').trim();
        const locality = String(addr.locality || addr.address_line2 || '').trim();
        const city = String(addr.city || '').trim();
        const state = String(addr.state || '').trim();
        const pincode = String(addr.pincode || '').trim();
        const addressType = String(addr.addressType || addr.address_type || 'home').trim() || 'home';
        const isDefault = Boolean(addr.isDefault || addr.is_default);

        return {
            id,
            name,
            phone,
            addressLine,
            city,
            state,
            pincode,
            isDefault,
            locality,
            addressType,
            mobile: phone,
            address: addressLine,
            full_name: name,
            address_line1: addressLine,
            address_line2: locality,
            address_type: addressType,
            is_default: isDefault
        };
    }

    toStoredAddress(addressData, existingId = Date.now()) {
        const normalized = this.normalizeAddress({
            id: existingId,
            name: addressData.name,
            phone: addressData.phone || addressData.mobile,
            addressLine: addressData.addressLine || addressData.address,
            locality: addressData.locality,
            city: addressData.city,
            state: addressData.state,
            pincode: addressData.pincode,
            addressType: addressData.addressType || addressData.address_type || 'home',
            isDefault: Boolean(addressData.isDefault)
        });

        return {
            id: normalized.id,
            name: normalized.name,
            phone: normalized.phone,
            addressLine: normalized.addressLine,
            city: normalized.city,
            state: normalized.state,
            pincode: normalized.pincode,
            isDefault: normalized.isDefault,
            locality: normalized.locality,
            addressType: normalized.addressType
        };
    }

    getAddresses() {
        const addresses = this.parseAddresses(localStorage.getItem(this.storageKey))
            .map((addr) => this.normalizeAddress(addr))
            .filter(Boolean);

        return this.ensureDefaultAddress(addresses);
    }

    saveAddresses(addresses) {
        const normalized = this.ensureDefaultAddress(
            (Array.isArray(addresses) ? addresses : [])
                .map((addr) => this.normalizeAddress(addr))
                .filter(Boolean)
        );

        const serialized = normalized.map((addr) => ({
            id: addr.id,
            name: addr.name,
            phone: addr.phone,
            addressLine: addr.addressLine,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            isDefault: addr.isDefault,
            locality: addr.locality,
            addressType: addr.addressType
        }));

        localStorage.setItem(this.storageKey, JSON.stringify(serialized));
        console.log('Saved addresses:', localStorage.getItem(this.storageKey));
        this.cache = normalized;
        return this.cache;
    }

    ensureDefaultAddress(addresses) {
        if (!addresses.length) return [];

        let foundDefault = false;
        return addresses.map((addr, index) => {
            const normalized = { ...addr };
            if (normalized.isDefault && !foundDefault) {
                foundDefault = true;
                normalized.isDefault = true;
            } else {
                normalized.isDefault = false;
            }

            if (!foundDefault && index === 0) {
                normalized.isDefault = true;
                foundDefault = true;
            }

            normalized.is_default = normalized.isDefault;
            return normalized;
        });
    }

    async refresh() {
        this.cache = this.getAddresses();
        console.log('Saved addresses:', localStorage.getItem(this.storageKey));
        return this.cache;
    }

    getAddressById(addressId) {
        return this.getAddresses().find((addr) => String(addr.id) === String(addressId)) || null;
    }

    async addAddress(addressData) {
        if (!this.validateAddress(addressData)) {
            return { success: false, message: 'Please fill all required fields' };
        }

        const addresses = this.getAddresses();
        const nextAddress = this.toStoredAddress(addressData, Date.now());

        if (addresses.length === 0) {
            nextAddress.isDefault = true;
        }

        if (nextAddress.isDefault) {
            addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        addresses.push(nextAddress);
        this.saveAddresses(addresses);
        return { success: true, address: this.getAddressById(nextAddress.id) };
    }

    async updateAddress(addressId, addressData) {
        if (!this.validateAddress(addressData)) {
            return { success: false, message: 'Please fill all required fields' };
        }

        const addresses = this.getAddresses();
        const index = addresses.findIndex((addr) => String(addr.id) === String(addressId));
        if (index === -1) {
            return { success: false, message: 'Address not found' };
        }

        const updatedAddress = this.toStoredAddress(addressData, addresses[index].id);
        if (!addresses.some((addr, idx) => idx !== index && addr.isDefault) || updatedAddress.isDefault) {
            updatedAddress.isDefault = true;
            addresses.forEach((addr, idx) => {
                if (idx !== index) addr.isDefault = false;
            });
        }

        addresses[index] = updatedAddress;
        this.saveAddresses(addresses);
        return { success: true, address: this.getAddressById(updatedAddress.id) };
    }

    async deleteAddress(addressId) {
        const addresses = this.getAddresses().filter((addr) => String(addr.id) !== String(addressId));
        this.saveAddresses(addresses);

        const selectedId = this.getSelectedAddressId();
        if (selectedId && String(selectedId) === String(addressId)) {
            this.clearSelectedAddress();
            const nextDefault = this.getDefaultAddress();
            if (nextDefault) {
                this.selectAddress(nextDefault.id);
            }
        }

        return { success: true };
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
        if (!addressId) return this.getDefaultAddress();
        return this.getAddressById(addressId) || this.getDefaultAddress();
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
            (data.phone || data.mobile) && this.validateMobile(data.phone || data.mobile) &&
            data.pincode && this.validatePincode(data.pincode) &&
            (data.addressLine || data.address) && String(data.addressLine || data.address).trim() !== '' &&
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
        const normalized = this.normalizeAddress(address) || {};
        return `${normalized.addressLine || ''}${normalized.locality ? `, ${normalized.locality}` : ''}, ${normalized.city || ''}, ${normalized.state || ''} - ${normalized.pincode || ''}`;
    }
}

const AddressManager_Instance = new AddressManager();

function getAddresses() {
    return AddressManager_Instance.getAddresses();
}

function saveAddresses(addresses) {
    return AddressManager_Instance.saveAddresses(addresses);
}

function addAddress(newAddress) {
    return AddressManager_Instance.addAddress(newAddress);
}

if (typeof window !== 'undefined') {
    window.AddressManagerClass = AddressManager;
    window.AddressManager = AddressManager_Instance;
    window.getAddresses = getAddresses;
    window.saveAddresses = saveAddresses;
    window.addAddress = addAddress;
}
