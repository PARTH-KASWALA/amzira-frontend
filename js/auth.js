/* ===================================
   AUTHENTICATION MANAGEMENT
   Login, Signup, Session handling
   =================================== */

class AuthManager {
    constructor() {
        this.storageKey = 'amziraUser';
        this._salt = 'amzira_static_salt_v1';
        this.init();
    }

    init() {
        this.updateHeaderUI();
        
        // Check for redirect after login
        this.checkRedirect();
    }

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    // Get current user
    getUser() {
        const userData = localStorage.getItem(this.storageKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Login user
    async login(email, password) {
        // Get all users
        const users = this.getAllUsers();

        // Hash incoming password
        const hashedInput = await this.hashPassword(password);

        // Find user by email or phone. Support legacy plaintext passwords as fallback.
        const user = users.find(u => {
            if (u.email !== email && u.phone !== email) return false;
            // Accept if stored password matches hashed input or plaintext (legacy)
            return u.password === hashedInput || u.password === password;
        });

        if (user) {
            // Don't store password in session
            const sessionUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(sessionUser));
            this.updateHeaderUI();
            return { success: true, user: sessionUser };
        }

        return { success: false, message: 'Invalid email/phone or password' };
    }

    // Signup new user
    async signup(userData) {
        const users = this.getAllUsers();
        
        // Check if user already exists
        const exists = users.find(u => u.email === userData.email || u.phone === userData.phone);
        if (exists) {
            return { success: false, message: 'User already exists with this email or phone' };
        }

        // Hash password before storing
        const hashed = await this.hashPassword(userData.password);

        // Create new user
        const newUser = {
            id: 'USER-' + Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: hashed,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('amziraUsers', JSON.stringify(users));

        // Auto login after signup
        const sessionUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            createdAt: newUser.createdAt
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(sessionUser));
        this.updateHeaderUI();
        
        return { success: true, user: sessionUser };
    }

    // Hash password using Web Crypto API
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + this._salt);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fallback: return plaintext (not ideal) so auth flow doesn't break
            console.warn('hashPassword failed, falling back to plaintext', e);
            return password;
        }
    }

    // Logout
    logout() {
        localStorage.removeItem(this.storageKey);
        this.updateHeaderUI();
        
        // Show notification
        if (window.errorHandler) {
            window.errorHandler.showSuccess('Logged out successfully');
        }
        
        // Redirect to home
        window.location.href = 'index.html';
    }

    // Get all users (for login validation)
    getAllUsers() {
        const usersData = localStorage.getItem('amziraUsers');
        return usersData ? JSON.parse(usersData) : [];
    }

    // Update header UI based on auth state
    updateHeaderUI() {
        const accountBtn = document.getElementById('accountBtn');
        if (!accountBtn) return;

        if (this.isLoggedIn()) {
            const user = this.getUser();
            accountBtn.title = user.name;
            accountBtn.innerHTML = '<i class="fas fa-user"></i>';
            
            // Update click handler
            accountBtn.onclick = () => {
                window.location.href = 'account.html';
            };
        } else {
            accountBtn.title = 'Login / Signup';
            accountBtn.innerHTML = '<i class="far fa-user"></i>';
            
            // Update click handler
            accountBtn.onclick = () => {
                window.location.href = 'login.html';
            };
        }
    }

    // Require login (redirect to login if not logged in)
    requireLogin(returnUrl = null) {
        if (!this.isLoggedIn()) {
            // Save return URL
            if (returnUrl) {
                sessionStorage.setItem('returnUrl', returnUrl);
            }
            
            // Redirect to login
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Check for redirect after login
    checkRedirect() {
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl && this.isLoggedIn()) {
            sessionStorage.removeItem('returnUrl');
            window.location.href = returnUrl;
        }
    }

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate phone
    validatePhone(phone) {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    }

    // Validate password strength
    validatePassword(password) {
        return password.length >= 6;
    }
}

// Initialize auth manager
const Auth = new AuthManager();

// Export for global use
if (typeof window !== 'undefined') {
    window.Auth = Auth;
}