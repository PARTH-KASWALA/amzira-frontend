/* ===================================
   MENU & NAVIGATION
   Mobile menu, search overlay, etc.

   IMPORTANT:
   - Header/nav must remain STATIC and must not depend on backend categories/products.
   - Do not inject/replace nav items from API responses.
   =================================== */

(function initMenu(global) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function onReady() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const overlay = createOverlay();

    function createOverlay() {
      const existing = document.getElementById('menuOverlay');
      if (existing) return existing;

      const div = document.createElement('div');
      div.className = 'overlay';
      div.id = 'menuOverlay';
      document.body.appendChild(div);
      return div;
    }

    function openMobileMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    if (overlay) {
      overlay.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('keydown', function onEsc(event) {
      if (event.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Search Overlay
    // If dedicated search.js is loaded, let it own search behavior to avoid duplicate overlays.
    if (!document.querySelector('script[src*="js/search.js"]')) {
      const searchBtn = document.getElementById('searchBtn');
      let searchOverlay = null;

      function createSearchOverlay() {
        const div = document.createElement('div');
        div.className = 'search-overlay';
        div.innerHTML = `
          <button class="search-close" id="searchClose" aria-label="Close search">
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
              <button type="submit" class="search-submit" aria-label="Search">
                <i class="fas fa-search"></i>
              </button>
            </form>
            <div class="search-suggestions">
              <h4>Popular Searches</h4>
              <div class="suggestion-tags">
                <a href="men.html?cat=sherwani" class="suggestion-tag">Sherwani</a>
                <a href="men.html?cat=kurta-pajama" class="suggestion-tag">Kurta Set</a>
                <a href="men.html?cat=kurta-jacket-set" class="suggestion-tag">Kurta Jacket</a>
                <a href="women.html?cat=lehenga" class="suggestion-tag">Lehenga</a>
                <a href="women.html?cat=sarees" class="suggestion-tag">Saree</a>
                <a href="men.html?occasion=wedding" class="suggestion-tag">Wedding</a>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(div);
        return div;
      }

      function closeSearch() {
        if (!searchOverlay) return;
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }

      function openSearch() {
        if (!searchOverlay) {
          searchOverlay = createSearchOverlay();

          const closeBtn = document.getElementById('searchClose');
          if (closeBtn) closeBtn.addEventListener('click', closeSearch);

          const form = document.getElementById('searchForm');
          if (form) {
            form.addEventListener('submit', function onSubmit(e) {
              e.preventDefault();
              const query = this.querySelector('.search-input')?.value || '';
              const trimmed = query.trim();
              if (!trimmed) return;

              global.location.href = `men.html?search=${encodeURIComponent(trimmed)}`;
            });
          }

          document.addEventListener('keydown', function onSearchEsc(e) {
            if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
              closeSearch();
            }
          });
        }

        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
          const input = searchOverlay.querySelector('.search-input');
          if (input) input.focus();
        }, 100);
      }

      if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
      }
    }

    // Account Button
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn && accountBtn.tagName !== 'A') {
      accountBtn.addEventListener('click', function onAccountClick() {
        global.location.href = 'login.html';
      });
    }

    // Cart Button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', function onCartClick() {
        global.location.href = 'cart.html';
      });
    }
  });
})(window);

