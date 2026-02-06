# 🔐 Cookie-Based Auth - Quick Reference

## TL;DR

```javascript
// ✅ DO THIS - Login with backend
const result = await Auth.login(email, password);
// Backend sets httpOnly cookies
// Frontend stores user profile: { id, name, email, phone }

// ✅ DO THIS - API calls with credentials
fetch('/api/products', {
    credentials: 'include'  // Sends cookies automatically
})

// ✅ DO THIS - Validate session before critical ops
const { authenticated } = await Auth.checkAuth();

// ✅ DO THIS - Logout with backend call
await Auth.logout();  // Calls /auth/logout, clears cookies

// ❌ NEVER DO THIS
localStorage.setItem('access_token', token);  // WRONG!
localStorage.setItem('refresh_token', token);  // WRONG!
const token = localStorage.getItem('token');  // WRONG!
headers: { 'Authorization': `Bearer ${token}` }  // WRONG!
```

---

## Common Tasks

### Check if User is Logged In (Quick)
```javascript
if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    console.log(user.name);  // Get name, email, etc.
}
```

### Validate Session (Before Critical Operation)
```javascript
async function checkout() {
    const { authenticated, user } = await Auth.checkAuth();
    if (!authenticated) {
        window.location.href = '/login.html';
        return;
    }
    // Safe to proceed
}
```

### Make API Call
```javascript
const products = await fetch('/api/products?limit=10', {
    credentials: 'include'  // ✅ REQUIRED
});
```

### Protect a Page
```javascript
// In page initialization
Auth.requireLogin('/return-url-after-login.html');
// User redirected to login if not authenticated
// After login, user returned to original page
```

### Custom API Request
```javascript
// Using the apiRequest helper (includes credentials: 'include')
const data = await apiRequest('/custom-endpoint', {
    method: 'POST',
    body: JSON.stringify({ key: 'value' })
});
```

---

## Storage Guide

| What | Where | Why |
|------|-------|-----|
| access_token | httpOnly Cookie (automatic) | Secure, can't access from JS |
| refresh_token | httpOnly Cookie (automatic) | Secure, can't access from JS |
| user.name | localStorage | Safe - not sensitive |
| user.email | localStorage | Safe - not sensitive |
| user.phone | localStorage | Safe - not sensitive |
| user.id | localStorage | Safe - not sensitive |
| passwords | Nowhere | Never store! Send directly to backend |

---

## Available Auth Functions

### `Auth.login(email, password)` → Promise
Login user with email/password. Returns user profile on success.

### `Auth.signup(userData)` → Promise
Create new account. Auto-logs in on success.

### `Auth.logout()` → Promise
Logout user. Calls backend to invalidate session.

### `Auth.checkAuth()` → Promise<{ authenticated, user }>
Validate session with backend. Use before critical operations.

### `Auth.isLoggedIn()` → Boolean
Quick check if user profile in localStorage. Doesn't validate backend session.

### `Auth.getUser()` → Object|null
Get locally-stored user profile (or null if not logged in).

### `Auth.requireLogin(returnUrl)` → Boolean
Redirect to login if not authenticated. Optionally save return URL.

---

## API Request Patterns

### ✅ Correct
```javascript
// Pattern 1: Using apiRequest helper (recommended)
const data = await apiRequest('/endpoint', {
    method: 'POST',
    body: JSON.stringify({ ... })
});

// Pattern 2: Using fetch with credentials
const response = await fetch('/api/endpoint', {
    method: 'GET',
    credentials: 'include'  // ✅ Must include
});

// Pattern 3: With custom headers
const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'X-Custom': 'value' },
    credentials: 'include',  // ✅ Still required!
    body: JSON.stringify({ ... })
});
```

### ❌ Wrong
```javascript
// Missing credentials - cookies won't be sent
fetch('/api/endpoint');  // ❌ No credentials!

// Trying to use Authorization header
fetch('/api/endpoint', {
    headers: {
        'Authorization': `Bearer ${token}`  // ❌ Tokens not in JS!
    }
});

// Storing token in localStorage
const token = JSON.parse(localStorage.getItem('access_token'));  // ❌ Never stored!
```

---

## Error Handling

### 401 Response
Backend automatically handles this:
1. `apiRequest()` detects 401
2. Calls `refreshSession()` to refresh token
3. Retries original request
4. If refresh fails, redirects to login

### Manual Handling
```javascript
try {
    const data = await apiRequest('/protected-endpoint');
} catch (error) {
    if (error.message.includes('401')) {
        // Session expired - already redirected by apiRequest
    } else {
        // Other error
        console.error(error);
    }
}
```

---

## Browser DevTools Check

### Verify Cookies Are Set
1. Open DevTools → Application → Cookies
2. Look for: `access_token`, `refresh_token`
3. Verify: HttpOnly ✅, Secure ✅, SameSite ✅

### Verify No Tokens in Storage
1. Open DevTools → Application → Local Storage
2. Should see: `user` (profile only)
3. Should NOT see: `access_token`, `refresh_token`, `token`

### Verify credentials: 'include'
1. Open DevTools → Network → [API request]
2. Look at Request Headers
3. Should see: `Cookie: access_token=...; refresh_token=...`

---

## Troubleshooting

### "401 Unauthorized" Error
```
→ Session expired or invalid
→ Call Auth.checkAuth() to validate
→ If false, redirect to login
→ Or let apiRequest() handle it automatically
```

### "Cookies not being sent"
```
→ Missing credentials: 'include'
→ Check: fetch(..., { credentials: 'include' })
→ Also: apiRequest() adds it automatically
```

### "Can't access token from localStorage"
```
→ That's the point! Tokens are in httpOnly cookies
→ JavaScript can't (and shouldn't) access them
→ Only use user profile from localStorage
```

### "How do I refresh the token?"
```
→ Backend handles automatically via refresh endpoint
→ apiRequest() calls refreshSession() on 401
→ No manual token refresh needed!
```

---

## Migration from Old System

If migrating from localStorage tokens to cookies:

```javascript
// OLD (WRONG)
localStorage.setItem('token', accessToken);  // ❌ Delete this

// NEW (CORRECT)
// Backend sets cookies automatically
// Frontend only stores user profile
localStorage.setItem('user', JSON.stringify(user));  // ✅ Do this
```

---

## For Backend Integration

Ensure backend endpoints:
1. ✅ Set `Set-Cookie` headers with HttpOnly, Secure, SameSite flags
2. ✅ Accept and validate cookies on protected endpoints
3. ✅ Return 401 if cookie/token invalid
4. ✅ Implement `/auth/refresh` to refresh access_token
5. ✅ Implement `/auth/me` to return current user profile
6. ✅ Set correct CORS headers if cross-origin

---

**Last Updated:** February 6, 2026
**Status:** ✅ Production Ready
