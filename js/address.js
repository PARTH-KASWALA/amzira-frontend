/* ===================================
   ADDRESS MANAGEMENT SYSTEM
   Add, Edit, Delete, Select addresses
   =================================== */

class AddressManager {
    constructor() {
        this.storageKey = 'amziraAddresses';
        this.selectedKey = 'selectedAddress';
    }

    // Get all addresses for current user
    getAddresses() {
        const user = Auth.getUser();
        if (!user) return [];

        const allAddresses = localStorage.getItem(this.storageKey);
        const addresses = allAddresses ? JSON.parse(allAddresses) : [];
        
        // Filter addresses for current user
        return addresses.filter(addr => addr.userId === user.id);
    }

    // Get address by ID
    getAddressById(addressId) {
        const addresses = this.getAllAddresses();
        return addresses.find(addr => addr.id === addressId);
    }

    // Get all addresses (admin function)
    getAllAddresses() {
        const allAddresses = localStorage.getItem(this.storageKey);
        return allAddresses ? JSON.parse(allAddresses) : [];
    }

    // Add new address
    addAddress(addressData) {
        const user = Auth.getUser();
        if (!user) {
            return { success: false, message: 'Please login first' };
        }

        // Validate required fields
        if (!this.validateAddress(addressData)) {
            return { success: false, message: 'Please fill all required fields' };
        }

        const allAddresses = this.getAllAddresses();

        const newAddress = {
            id: 'ADDR-' + Date.now(),
            userId: user.id,
            name: addressData.name,
            mobile: addressData.mobile,
            pincode: addressData.pincode,
            address: addressData.address,
            locality: addressData.locality || '',
            city: addressData.city,
            state: addressData.state,
            addressType: addressData.addressType || 'home',
            isDefault: addressData.isDefault || false,
            createdAt: new Date().toISOString()
        };

        // If this is set as default, unset other defaults
        if (newAddress.isDefault) {
            allAddresses.forEach(addr => {
                if (addr.userId === user.id) {
                    addr.isDefault = false;
                }
            });
        }

        allAddresses.push(newAddress);
        localStorage.setItem(this.storageKey, JSON.stringify(allAddresses));

        return { success: true, address: newAddress };
    }

    // Update address
    updateAddress(addressId, addressData) {
        const allAddresses = this.getAllAddresses();
        const index = allAddresses.findIndex(addr => addr.id === addressId);

        if (index === -1) {
            return { success: false, message: 'Address not found' };
        }

        const user = Auth.getUser();
        if (allAddresses[index].userId !== user.id) {
            return { success: false, message: 'Unauthorized' };
        }

        // Validate
        if (!this.validateAddress(addressData)) {
            return { success: false, message: 'Please fill all required fields' };
        }

        // If setting as default, unset others
        if (addressData.isDefault) {
            allAddresses.forEach(addr => {
                if (addr.userId === user.id && addr.id !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        // Update address
        allAddresses[index] = {
            ...allAddresses[index],
            ...addressData,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.storageKey, JSON.stringify(allAddresses));

        return { success: true, address: allAddresses[index] };
    }

    // Delete address
    deleteAddress(addressId) {
        const allAddresses = this.getAllAddresses();
        const index = allAddresses.findIndex(addr => addr.id === addressId);

        if (index === -1) {
            return { success: false, message: 'Address not found' };
        }

        const user = Auth.getUser();
        if (allAddresses[index].userId !== user.id) {
            return { success: false, message: 'Unauthorized' };
        }

        allAddresses.splice(index, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(allAddresses));

        // Clear selected address if it was deleted
        const selectedId = this.getSelectedAddressId();
        if (selectedId === addressId) {
            this.clearSelectedAddress();
        }

        return { success: true };
    }

    // Set selected address for checkout
    selectAddress(addressId) {
        const address = this.getAddressById(addressId);
        if (!address) {
            return { success: false, message: 'Address not found' };
        }

        localStorage.setItem(this.selectedKey, addressId);
        return { success: true, address: address };
    }

    // Get selected address
    getSelectedAddress() {
        const addressId = localStorage.getItem(this.selectedKey);
        if (!addressId) return null;

        return this.getAddressById(addressId);
    }

    // Get selected address ID
    getSelectedAddressId() {
        return localStorage.getItem(this.selectedKey);
    }

    // Clear selected address
    clearSelectedAddress() {
        localStorage.removeItem(this.selectedKey);
    }

    // Get default address
    getDefaultAddress() {
        const addresses = this.getAddresses();
        return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    }

    // Validate address data
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

    // Validate mobile
    validateMobile(mobile) {
        if (!mobile) return false;
        // Clean input and validate
        const cleaned = String(mobile).replace(/\D/g, '');
        const re = /^[6-9]\d{9}$/;
        return re.test(cleaned);
    }

    // Validate pincode
    validatePincode(pincode) {
        if (!pincode) return false;
        const cleaned = String(pincode).replace(/\D/g, '');
        const re = /^\d{6}$/;
        return re.test(cleaned);
    }

    // Format address for display
    formatAddress(address) {
        return `${address.address}, ${address.locality ? address.locality + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`;
    }
}

// Initialize address manager
const AddressManager_Instance = new AddressManager();

// Export for global use
if (typeof window !== 'undefined') {
    window.AddressManager = AddressManager_Instance;
}