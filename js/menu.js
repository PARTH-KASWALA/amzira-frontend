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

    async function initDynamicMegaMenu() {
      const navMenu = document.querySelector('.nav-menu');
      if (!navMenu) return false;

      const mobileMenuRoot = document.querySelector('.mobile-menu-l1');
      if (!mobileMenuRoot) return false;

      const cacheKey = 'amziraMegaMenuCategories_v1';
      const cacheTtlMs = 60 * 60 * 1000;

      function parseCached() {
        try {
          const raw = sessionStorage.getItem(cacheKey);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== 'object') return null;
          if (!Number.isFinite(Number(parsed.expiresAt))) return null;
          if (Date.now() > Number(parsed.expiresAt)) return null;
          return parsed.data || null;
        } catch (_) {
          return null;
        }
      }

      function storeCache(data) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data,
          expiresAt: Date.now() + cacheTtlMs
        }));
      }

      async function fetchCategories() {
        const cached = parseCached();
        if (cached) return cached;

        const apiBase = (global.AMZIRA && global.AMZIRA.API_BASE_URL)
          ? global.AMZIRA.API_BASE_URL
          : 'http://localhost:8000/api/v1';

        const response = await fetch(`${apiBase}/categories?include_children=true&active_only=true`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const list = payload?.data || payload?.categories || payload?.results || [];
        storeCache(list);
        return list;
      }

      function isActiveCategory(category) {
        return category && category.is_active !== false;
      }

      function buildTree(flat) {
        const map = new Map();
        const roots = [];
        flat.forEach((cat) => {
          map.set(cat.id, { ...cat, children: [] });
        });
        flat.forEach((cat) => {
          if (!isActiveCategory(cat)) return;
          if (cat.parent_id == null) {
            roots.push(map.get(cat.id));
          } else if (map.has(cat.parent_id)) {
            map.get(cat.parent_id).children.push(map.get(cat.id));
          }
        });
        return roots;
      }

      function normalizeTree(categories) {
        if (!Array.isArray(categories)) return [];
        const hasChildren = categories.some((cat) => Array.isArray(cat?.children));
        if (hasChildren) return categories;
        return buildTree(categories);
      }

      function toSlug(value) {
        return String(value || '').trim().toLowerCase();
      }

      function buildL3Panel(l1, l2) {
        const panel = document.createElement('div');
        panel.className = 'mega-menu-l3-panel';
        panel.setAttribute('data-for', toSlug(l2.slug));

        const columns = document.createElement('div');
        columns.className = 'mega-menu-l3-columns';

        const l3Items = (l2.children || []).filter(isActiveCategory);
        if (!l3Items.length) {
          const column = document.createElement('div');
          column.className = 'mega-menu-l3-column';
          const heading = document.createElement('h4');
          heading.className = 'mega-menu-l3-heading';
          heading.textContent = 'All Products';
          column.appendChild(heading);

          const list = document.createElement('ul');
          list.className = 'mega-menu-l3-list';
          list.setAttribute('role', 'none');
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.setAttribute('role', 'menuitem');
          link.href = `/${toSlug(l1.slug)}/${toSlug(l2.slug)}`;
          link.textContent = `View All ${l2.name}`;
          item.appendChild(link);
          list.appendChild(item);
          column.appendChild(list);
          columns.appendChild(column);
        } else {
          const column = document.createElement('div');
          column.className = 'mega-menu-l3-column';
          const heading = document.createElement('h4');
          heading.className = 'mega-menu-l3-heading';
          heading.textContent = 'Collections';
          column.appendChild(heading);

          const list = document.createElement('ul');
          list.className = 'mega-menu-l3-list';
          list.setAttribute('role', 'none');
          l3Items.forEach((l3) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.setAttribute('role', 'menuitem');
            link.href = `/${toSlug(l1.slug)}/${toSlug(l2.slug)}/${encodeURIComponent(toSlug(l3.slug || l3.name))}`;
            link.textContent = l3.name;
            li.appendChild(link);
            list.appendChild(li);
          });
          column.appendChild(list);
          columns.appendChild(column);
        }

        panel.appendChild(columns);
        return panel;
      }

      function buildL1Item(l1) {
        const li = document.createElement('li');
        li.className = 'nav-item has-mega-menu';
        li.setAttribute('data-category', toSlug(l1.slug));
        li.setAttribute('role', 'none');

        const link = document.createElement('a');
        link.href = `${toSlug(l1.slug)}.html`;
        link.className = 'nav-link';
        link.setAttribute('role', 'menuitem');
        link.setAttribute('aria-haspopup', 'true');
        link.setAttribute('aria-expanded', 'false');
        link.textContent = l1.name;

        const megaMenu = document.createElement('div');
        megaMenu.className = 'mega-menu';
        megaMenu.setAttribute('role', 'menu');
        megaMenu.setAttribute('aria-label', `${l1.name} Categories`);

        const container = document.createElement('div');
        container.className = 'mega-menu-container';

        const sidebar = document.createElement('div');
        sidebar.className = 'mega-menu-sidebar';
        const l2List = document.createElement('ul');
        l2List.className = 'mega-menu-l2-list';
        l2List.setAttribute('role', 'none');

        const content = document.createElement('div');
        content.className = 'mega-menu-content';

        const l2Items = (l1.children || []).filter(isActiveCategory);
        l2Items.forEach((l2, index) => {
          const l2Item = document.createElement('li');
          l2Item.className = 'mega-menu-l2-item';
          if (index === 0) l2Item.classList.add('active');
          l2Item.setAttribute('data-subcategory', toSlug(l2.slug));

          const l2Link = document.createElement('a');
          l2Link.href = `/${toSlug(l1.slug)}/${toSlug(l2.slug)}`;
          l2Link.className = 'mega-menu-l2-link';
          l2Link.setAttribute('role', 'menuitem');

          const name = document.createElement('span');
          name.className = 'l2-name';
          name.textContent = l2.name;
          const arrow = document.createElement('i');
          arrow.className = 'l2-arrow fas fa-chevron-right';

          l2Link.appendChild(name);
          l2Link.appendChild(arrow);
          l2Item.appendChild(l2Link);
          l2List.appendChild(l2Item);

          const panel = buildL3Panel(l1, l2);
          if (index === 0) panel.classList.add('active');
          content.appendChild(panel);
        });

        sidebar.appendChild(l2List);
        container.appendChild(sidebar);
        container.appendChild(content);
        megaMenu.appendChild(container);
        li.appendChild(link);
        li.appendChild(megaMenu);
        return li;
      }

      function buildMobileL1(l1) {
        const li = document.createElement('li');
        li.className = 'mobile-menu-l1-item';

        const toggle = document.createElement('button');
        const l1Id = `${toSlug(l1.slug)}-submenu`;
        toggle.className = 'mobile-menu-l1-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', l1Id);

        const span = document.createElement('span');
        span.textContent = l1.name;
        const icon = document.createElement('i');
        icon.className = 'fas fa-chevron-down';

        toggle.appendChild(span);
        toggle.appendChild(icon);

        const l2List = document.createElement('ul');
        l2List.className = 'mobile-menu-l2';
        l2List.id = l1Id;
        l2List.hidden = true;

        (l1.children || []).filter(isActiveCategory).forEach((l2) => {
          const l2Item = document.createElement('li');
          l2Item.className = 'mobile-menu-l2-item';
          const l2Toggle = document.createElement('button');
          const l2Id = `${toSlug(l1.slug)}-${toSlug(l2.slug)}-submenu`;
          l2Toggle.className = 'mobile-menu-l2-toggle';
          l2Toggle.setAttribute('aria-expanded', 'false');
          l2Toggle.setAttribute('aria-controls', l2Id);
          const l2Span = document.createElement('span');
          l2Span.textContent = l2.name;
          const l2Icon = document.createElement('i');
          l2Icon.className = 'fas fa-chevron-down';
          l2Toggle.appendChild(l2Span);
          l2Toggle.appendChild(l2Icon);

          const l3List = document.createElement('ul');
          l3List.className = 'mobile-menu-l3';
          l3List.id = l2Id;
          l3List.hidden = true;

          const l3Items = (l2.children || []).filter(isActiveCategory);
          if (!l3Items.length) {
            const li3 = document.createElement('li');
            const link = document.createElement('a');
            link.href = `/${toSlug(l1.slug)}/${toSlug(l2.slug)}`;
            link.textContent = `View All ${l2.name}`;
            li3.appendChild(link);
            l3List.appendChild(li3);
          } else {
            l3Items.forEach((l3) => {
              const li3 = document.createElement('li');
              const link = document.createElement('a');
              link.href = `/${toSlug(l1.slug)}/${toSlug(l2.slug)}/${encodeURIComponent(toSlug(l3.slug || l3.name))}`;
              link.textContent = l3.name;
              li3.appendChild(link);
              l3List.appendChild(li3);
            });
          }

          l2Item.appendChild(l2Toggle);
          l2Item.appendChild(l3List);
          l2List.appendChild(l2Item);
        });

        li.appendChild(toggle);
        li.appendChild(l2List);
        return li;
      }

      function sanitizeTopNav() {
        const allowedL1 = new Set(['men', 'women', 'kids']);
        const allowedStatic = new Set(['appointments', 'stores']);
        Array.from(navMenu.children).forEach((li) => {
          if (li.classList.contains('has-mega-menu')) {
            const slug = toSlug(li.getAttribute('data-category') || li.textContent);
            if (!allowedL1.has(slug)) li.remove();
            return;
          }
          const text = toSlug(li.textContent || '');
          if (!allowedStatic.has(text)) {
            li.remove();
          }
        });
      }

      try {
        const categories = await fetchCategories();
        const tree = normalizeTree(categories).filter(isActiveCategory);
        const allowedL1 = new Set(['men', 'women', 'kids']);
        const filteredTree = tree.filter((entry) => allowedL1.has(toSlug(entry?.slug)));
        if (!filteredTree.length) {
          sessionStorage.removeItem(cacheKey);
          return false;
        }

        const preserved = Array.from(navMenu.querySelectorAll('li')).filter((li) => !li.classList.contains('has-mega-menu'));
        navMenu.replaceChildren();
        filteredTree.forEach((l1) => {
          navMenu.appendChild(buildL1Item(l1));
        });
        preserved.forEach((li) => navMenu.appendChild(li));
        sanitizeTopNav();

        const mobilePreserved = Array.from(mobileMenuRoot.children).filter((li) => !li.classList.contains('mobile-menu-l1-item'));
        mobileMenuRoot.replaceChildren();
        filteredTree.forEach((l1) => {
          mobileMenuRoot.appendChild(buildMobileL1(l1));
        });
        mobilePreserved.forEach((li) => mobileMenuRoot.appendChild(li));

        return true;
      } catch (error) {
        console.warn('[MegaMenu] API load failed, using static menu.', error);
        return false;
      }
    }

    function initMegaMenuInteractions() {
      // Mega Menu Hover Intent (Desktop) + Accordion (Mobile)
      const navItems = Array.from(document.querySelectorAll('.nav-item.has-mega-menu'));
      const l2Items = Array.from(document.querySelectorAll('.mega-menu-l2-item'));
      const mobileL1Toggles = Array.from(document.querySelectorAll('.mobile-menu-l1-toggle'));
      const mobileL2Toggles = Array.from(document.querySelectorAll('.mobile-menu-l2-toggle'));

      const state = {
        activeL1: null,
        activeL2: null,
        hoverTimer: null,
        hideTimer: null,
        l2HoverTimer: null
      };

      const config = {
        hoverDelay: 200,
        hideDelay: 300,
        l2HoverDelay: 150
      };

      function setActiveL1(navItem) {
        navItems.forEach((item) => {
          if (item !== navItem) {
            item.classList.remove('active');
            const link = item.querySelector('.nav-link');
            if (link) link.setAttribute('aria-expanded', 'false');
          }
        });
        navItem.classList.add('active');
        const link = navItem.querySelector('.nav-link');
        if (link) link.setAttribute('aria-expanded', 'true');
        state.activeL1 = navItem;
      }

      function clearActiveL1(navItem) {
        navItem.classList.remove('active');
        const link = navItem.querySelector('.nav-link');
        if (link) link.setAttribute('aria-expanded', 'false');
        if (state.activeL1 === navItem) {
          state.activeL1 = null;
        }
      }

      function activateL2Item(l2Item) {
        const megaMenu = l2Item.closest('.mega-menu');
        if (!megaMenu) return;
        megaMenu.querySelectorAll('.mega-menu-l2-item').forEach((item) => item.classList.remove('active'));
        l2Item.classList.add('active');

        const target = l2Item.getAttribute('data-subcategory');
        megaMenu.querySelectorAll('.mega-menu-l3-panel').forEach((panel) => {
          panel.classList.toggle('active', panel.getAttribute('data-for') === target);
        });
        state.activeL2 = target;
      }

      navItems.forEach((navItem) => {
        navItem.addEventListener('mouseenter', () => {
          if (state.hideTimer) {
            clearTimeout(state.hideTimer);
            state.hideTimer = null;
          }
          state.hoverTimer = setTimeout(() => {
            setActiveL1(navItem);
            const firstL2 = navItem.querySelector('.mega-menu-l2-item');
            if (firstL2) activateL2Item(firstL2);
          }, config.hoverDelay);
        });

        navItem.addEventListener('mouseleave', () => {
          if (state.hoverTimer) {
            clearTimeout(state.hoverTimer);
            state.hoverTimer = null;
          }
          state.hideTimer = setTimeout(() => {
            clearActiveL1(navItem);
          }, config.hideDelay);
        });
      });

      l2Items.forEach((l2Item) => {
        l2Item.addEventListener('mouseenter', () => {
          if (state.l2HoverTimer) clearTimeout(state.l2HoverTimer);
          state.l2HoverTimer = setTimeout(() => {
            activateL2Item(l2Item);
          }, config.l2HoverDelay);
        });
      });

      document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav-desktop')) {
          navItems.forEach((navItem) => clearActiveL1(navItem));
        }
      });

      mobileL1Toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
          const submenuId = toggle.getAttribute('aria-controls');
          const submenu = submenuId ? document.getElementById(submenuId) : null;
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

          mobileL1Toggles.forEach((other) => {
            if (other !== toggle) {
              other.setAttribute('aria-expanded', 'false');
              const otherMenuId = other.getAttribute('aria-controls');
              const otherMenu = otherMenuId ? document.getElementById(otherMenuId) : null;
              if (otherMenu) otherMenu.hidden = true;
            }
          });

          toggle.setAttribute('aria-expanded', String(!isExpanded));
          if (submenu) submenu.hidden = isExpanded;
        });
      });

      mobileL2Toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
          const submenuId = toggle.getAttribute('aria-controls');
          const submenu = submenuId ? document.getElementById(submenuId) : null;
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!isExpanded));
          if (submenu) submenu.hidden = isExpanded;
        });
      });
    }

    initDynamicMegaMenu()
      .finally(() => {
        initMegaMenuInteractions();
      });
  });
})(window);
