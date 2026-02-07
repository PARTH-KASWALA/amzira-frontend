/*
  Authentication manager backed by FastAPI cookie auth.
  - No JWT/local token storage in frontend.
  - Only non-sensitive user profile is stored in localStorage.
  - All auth calls route through AMZIRA.apiRequest (credentials: include).
*/

class AuthManager {
    constructor() {
        this.userStorageKey = 'user';
        this.apiReadyPromise = null;
        this.init();
    }

    init() {
        this.updateHeaderUI();
        this.checkAuth();
        this.checkRedirect();
    }

    async ensureApiReady() {
        if (window.AMZIRA && window.AMZIRA.apiRequest) {
            return;
        }

        if (!this.apiReadyPromise) {
            this.apiReadyPromise = new Promise((resolve, reject) => {
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
                script.onload = () => {
                    if (window.AMZIRA && window.AMZIRA.apiRequest) {
                        resolve();
                    } else {
                        reject(new Error('API layer loaded but AMZIRA is unavailable'));
                    }
                };
                script.onerror = () => reject(new Error('Failed to load API layer'));
                document.head.appendChild(script);
            });
        }

        return this.apiReadyPromise;
    }

    isLoggedIn() {
        const user = this.getUser();
        return Boolean(user && user.id);
    }

    getUser() {
        const userData = localStorage.getItem(this.userStorageKey);
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (_) {
            localStorage.removeItem(this.userStorageKey);
            return null;
        }
    }

    async login(email, password) {
        try {
            await this.ensureApiReady();
            const data = await window.AMZIRA.auth.login(email, password);

            const user = data?.user || data || null;
            if (window.AMZIRA?.auth?.storeUserProfile) {
                window.AMZIRA.auth.storeUserProfile(user);
            }

            this.updateHeaderUI();
            window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));

            return {
                success: true,
                user
            };
        } catch (error) {
            return {
                success: false,
                message: error?.message || 'Login failed'
            };
        }
    }

    async signup(userData) {
        try {
            await this.ensureApiReady();

            await window.AMZIRA.auth.register({
                email: userData.email,
                password: userData.password,
                full_name: userData.name,
                phone: userData.phone
            });

            // Backend auth cookie is set on login endpoint. Perform login explicitly.
            return this.login(userData.email, userData.password);
        } catch (error) {
            return {
                success: false,
                message: error?.message || 'Signup failed'
            };
        }
    }

    async logout() {
        try {
            await this.ensureApiReady();
            await window.AMZIRA.auth.logout();
        } catch (_) {
            // Local cleanup still runs for graceful logout UX when backend is down.
        } finally {
            localStorage.removeItem(this.userStorageKey);
            this.updateHeaderUI();
            window.dispatchEvent(new Event('auth:logout'));

            if (window.errorHandler && typeof window.errorHandler.showSuccess === 'function') {
                window.errorHandler.showSuccess('Logged out successfully');
            }

            window.location.href = 'index.html';
        }
    }

    async checkAuth() {
        try {
            await this.ensureApiReady();
            const result = await window.AMZIRA.auth.checkAuth();

            if (result.authenticated && result.user) {
                if (window.AMZIRA?.auth?.storeUserProfile) {
                    window.AMZIRA.auth.storeUserProfile(result.user);
                }
                this.updateHeaderUI();
                return { authenticated: true, user: result.user };
            }

            localStorage.removeItem(this.userStorageKey);
            this.updateHeaderUI();
            return { authenticated: false, user: null };
        } catch (_) {
            localStorage.removeItem(this.userStorageKey);
            this.updateHeaderUI();
            return { authenticated: false, user: null };
        }
    }

    requireLogin(returnUrl = null) {
        if (!this.isLoggedIn()) {
            if (returnUrl) {
                sessionStorage.setItem('returnUrl', returnUrl);
            }
            window.location.href = 'login.html';
            return false;
        }

        return true;
    }

    checkRedirect() {
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (!returnUrl || !this.isLoggedIn()) return;

        sessionStorage.removeItem('returnUrl');
        window.location.href = returnUrl;
    }

    updateHeaderUI() {
        const accountBtn = document.getElementById('accountBtn');
        if (!accountBtn) return;

        if (this.isLoggedIn()) {
            const user = this.getUser();
            accountBtn.title = user?.name || 'Account';
            accountBtn.innerHTML = '<i class="fas fa-user"></i>';
            accountBtn.onclick = () => {
                window.location.href = 'account.html';
            };
            return;
        }

        accountBtn.title = 'Login / Signup';
        accountBtn.innerHTML = '<i class="far fa-user"></i>';
        accountBtn.onclick = () => {
            window.location.href = 'login.html';
        };
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    }

    validatePassword(password) {
        return typeof password === 'string' && password.length >= 6;
    }
}

const Auth = new AuthManager();

if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
