/* ===================================
   MENU & NAVIGATION
   Mobile menu, search overlay, etc.
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const overlay = createOverlay();
    
    function createOverlay() {
        const div = document.createElement('div');
        div.className = 'overlay';
        div.id = 'menuOverlay';
        document.body.appendChild(div);
        return div;
    }
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
    
    // Search Overlay
    const searchBtn = document.getElementById('searchBtn');
    let searchOverlay = null;
    
    function createSearchOverlay() {
        const div = document.createElement('div');
        div.className = 'search-overlay';
        div.innerHTML = `
            <button class="search-close" id="searchClose">
                <i class="fas fa-times"></i>
            </button>
            <div class="search-overlay-content">
                <form class="search-form" id="searchForm">
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Search for products..." 
                        autofocus
                    >
                    <button type="submit" class="search-submit">
                        <i class="fas fa-search"></i>
                    </button>
                </form>
                <div class="search-suggestions">
                    <h4>Popular Searches</h4>
                    <div class="suggestion-tags">
                        <a href="#" class="suggestion-tag">Sherwani</a>
                        <a href="#" class="suggestion-tag">Kurta Set</a>
                        <a href="#" class="suggestion-tag">Kurta Jacket</a>
                        <a href="#" class="suggestion-tag">Lehenga</a>
                        <a href="#" class="suggestion-tag">Saree</a>
                        <a href="#" class="suggestion-tag">Wedding</a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
        return div;
    }
    
    function openSearch() {
        if (!searchOverlay) {
            searchOverlay = createSearchOverlay();
            
            // Close button
            document.getElementById('searchClose').addEventListener('click', closeSearch);
            
            // Search form
            document.getElementById('searchForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const query = this.querySelector('.search-input').value;
                if (query) {
                    window.location.href = `men.html?search=${encodeURIComponent(query)}`;
                }
            });
            
            // Close on ESC key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                    closeSearch();
                }
            });
        }
        
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus input
        setTimeout(() => {
            searchOverlay.querySelector('.search-input').focus();
        }, 100);
    }
    
    function closeSearch() {
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
    }
    
    // Account Dropdown (placeholder)
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', function() {
            alert('Account menu - Login/Register functionality to be implemented');
        });
    }
    
    // Cart Button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
    
    console.log('Menu navigation initialized!');
});