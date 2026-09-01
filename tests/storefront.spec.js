const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const productSlug = 'aarohi-royal-blue-orange-checked-butta-pattu-pavadai';
const productName = 'Aarohi Royal Blue Orange Checked Butta Pattu Pavadai';

test.describe('AMZIRA storefront', () => {
  test('documents smooth scrolling for Next.js route transitions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-scroll-behavior', 'smooth');
  });

  test('guest can choose a real variant, add it to cart, and reach the secure sign-in boundary', async ({ page }) => {
    await page.goto(`/product/${productSlug}`);
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();
    await page.getByRole('radio', { name: '6-7Y', exact: true }).click();
    await page.getByRole('button', { name: /Add to cart/i }).click();
    await expect(page.getByRole('button', { name: /Added to cart/i })).toBeVisible();
    await page.waitForLoadState('networkidle');

    await page.goto('/cart');
    await expect(page.getByRole('link', { name: productName })).toBeVisible();
    await expect(page.getByText('Size: 6-7Y')).toBeVisible();
    await page.getByRole('link', { name: /Sign in to checkout/i }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Fcheckout|\/login\?next=\/checkout/);
    await expect(page.getByRole('heading', { name: /Sign in to AMZIRA/i })).toBeVisible();
  });

  test('guest checkout and account show complete authentication recovery states', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: 'Secure checkout', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Sign in for secure checkout/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Place order|Simulate payment/i })).toHaveCount(0);
    await page.waitForLoadState('networkidle');

    await page.goto('/account');
    await expect(page.getByRole('heading', { name: /Sign in to open your closet/i })).toBeVisible();
  });

  test('signup displays the backend field validation message', async ({ page }) => {
    await page.route('**/api/v1/auth/csrf-token', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":null}' });
    });
    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Validation failed',
          errors: [{ loc: ['body', 'email'], msg: 'Reserved email domains cannot be used.' }]
        })
      });
    });

    await page.goto('/signup');
    await page.getByLabel('Full name').fill('Test User');
    await page.getByLabel('Mobile number').fill('9876543210');
    await page.getByLabel('Email').fill('test@amzira.local');
    await page.locator('input[name="password"]').fill('Password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('status')).toHaveText('Email: Reserved email domains cannot be used.');
  });

  test('catalog filters are functional GET controls and remain in the URL', async ({ page }) => {
    await page.goto('/category/kids-pattu-pavadai');
    await page.getByLabel('Occasion').selectOption('festival');
    await page.getByLabel('Sort').selectOption('price_asc');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page).toHaveURL(/occasion=festival/);
    await expect(page).toHaveURL(/sort_by=price_asc/);
  });

  test('kids mega menu routes to the matching backend category slices', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Kids' }).click();

    const shortcuts = page.getByRole('navigation', { name: 'Kids collection shortcuts' });
    await expect(shortcuts.getByRole('link', { name: /Girls' Lehenga Choli/i })).toHaveAttribute(
      'href',
      '/category/girls-lehenga-choli'
    );
    await expect(shortcuts.getByRole('link', { name: /Pattu Pavadai/i })).toHaveAttribute(
      'href',
      '/category/pattu-pavadai'
    );

    const collections = page.locator('.mega-menu__column');
    await expect(collections.nth(0).locator('li')).toHaveCount(4);
    await expect(collections.nth(1).locator('li')).toHaveCount(3);
    await expect(collections.nth(0)).toContainText('South Indian Lehenga Choli');
    await expect(collections.nth(0)).toContainText('Temple & Peacock Work');
    await expect(collections.nth(1)).toContainText('Classic Pattu Pavadai');
    await expect(collections.nth(1)).toContainText('Gold Zari Pattu Pavadai');
    await expect(page.locator('#kids-mega-menu')).not.toContainText(/Debli|Piramit|Black V|Satin Jacquard/);

    for (const category of [
      { slug: 'kids-pattu-pavadai', heading: 'Kids', count: 110 },
      { slug: 'girls-lehenga-choli', heading: 'Girls Lehenga Choli', count: 33 },
      { slug: 'pattu-pavadai', heading: 'Pattu Pavadai', count: 77 }
    ]) {
      await page.goto(`/category/${category.slug}`);
      await expect(page.getByRole('heading', { level: 1, name: category.heading })).toBeVisible();
      await expect(page.getByText(`${category.count} styles available`)).toBeVisible();
    }

    await page.goto('/category/pattu-pavadai');
    await page.getByLabel('Shop by style').selectOption('classic-pattu-pavadai');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page).toHaveURL(/subcategory=classic-pattu-pavadai/);
    await expect(page.getByText('29 styles available')).toBeVisible();
  });

  test('kids catalog product cards open their matching product detail page', async ({ page }) => {
    await page.goto('/category/kids-pattu-pavadai');
    await page.getByRole('link', { name: /View Aarohi Royal Blue Orange Checked Butta Pattu Pavadai/i }).click();

    await expect(page).toHaveURL(/\/product\/aarohi-royal-blue-orange-checked-butta-pattu-pavadai$/);
    await expect(page.getByRole('heading', { name: /Aarohi Royal Blue Orange Checked Butta Pattu Pavadai/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /This style has moved/i })).toHaveCount(0);
  });

  test('product size chart uses the supplied choli and lehenga measurements', async ({ page }) => {
    await page.goto(`/product/${productSlug}`);
    await page.getByRole('button', { name: /Size chart/i }).click();

    const dialog = page.getByRole('dialog', { name: /Lehenga Choli Size Guide/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('tab', { name: 'Size chart' })).toHaveAttribute('aria-selected', 'true');
    await expect(dialog.getByRole('row', { name: /6-7Y.*26.*13.*14.*11.*13.*27.*14.*38 \+ 38/ })).toBeVisible();
    await expect(dialog.getByRole('row', { name: /9-10Y.*33.*13.5.*15.*12.*14.*33.*14.5.*39 \+ 39/ })).toBeVisible();
    await dialog.getByRole('button', { name: 'cm', exact: true }).click();
    await expect(dialog.getByRole('row', { name: /6-7Y.*26.*33.*35.6.*27.9.*33.*68.6.*35.6.*96.5 \+ 96.5/ })).toBeVisible();
    await dialog.getByRole('tab', { name: 'How to measure' }).click();
    await expect(dialog.getByText('Measure over light clothing')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('every kids catalog product opens with a visible main image', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/category/kids-pattu-pavadai');
    const productLinks = await page.locator('article.group a[aria-label^="View "]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute('href')).filter(Boolean))]
    );
    expect(productLinks).toHaveLength(110);

    for (const href of productLinks) {
      await page.goto(href, { waitUntil: 'commit' });
      const mainImage = page.locator('main img').first();
      await expect(mainImage).toBeVisible();
      await expect.poll(() => mainImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
  });

  test('catalog product galleries load every image without the backend media server', async ({ page }) => {
    for (const slug of [
      'ishani-red-black-checked-butta-pattu-pavadai',
      'tara-royal-blue-ivory-checked-butta-pattu-pavadai'
    ]) {
      await page.goto(`/product/${slug}`);
      const galleryImages = page.locator('main img');
      await expect(galleryImages.first()).toBeVisible();
      expect(await galleryImages.count()).toBeGreaterThan(1);

      for (const image of await galleryImages.all()) {
        await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
      }
    }
  });

  test('heritage inventory highlight opens a valid product detail page', async ({ page }) => {
    await page.goto('/heritage');
    const rotatingInventory = page.locator('.heritage-inventory-outfit');
    await expect(rotatingInventory).toBeVisible();
    await expect(page.locator('.heritage-inventory-count')).toHaveText(/\d{2} \/ \d{2}/);
    await expect(rotatingInventory).toHaveAttribute('href', /^\/product\//);

    const inventoryHighlight = page.getByRole('link', { name: /inventory highlight/i });
    await expect(inventoryHighlight).toBeVisible();
    await inventoryHighlight.click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByRole('button', { name: /Add to cart/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /This style has moved/i })).toHaveCount(0);
  });

  test('order tracking has a real query state instead of placeholder copy', async ({ page }) => {
    await page.goto('/order-tracking');
    await expect(page.getByLabel('Order reference')).toBeVisible();
    await expect(page.getByRole('button', { name: /Track order/i })).toBeVisible();
    await expect(page.getByText(/connects to the FastAPI/i)).toHaveCount(0);
  });

  test('password reset links open a complete recovery form', async ({ page }) => {
    await page.goto('/reset-password?token=test-token');
    await expect(page.getByRole('heading', { name: /Choose a new password/i })).toBeVisible();
    await expect(page.getByLabel('New password')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Update password/i })).toBeVisible();
  });

  test('key public routes have no serious or critical accessibility violations', async ({ page }) => {
    for (const path of ['/', '/category/kids-pattu-pavadai', `/product/${productSlug}`, '/coming-soon/women']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blockingViolations = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact)
      );
      expect(blockingViolations, `${path} accessibility violations`).toEqual([]);
    }
  });

  for (const department of [
    { path: '/women', destination: /\/coming-soon\/women$/, heading: /new ceremony wardrobe/i },
    { path: '/men', destination: /\/coming-soon\/men$/, heading: /men's ceremony edit/i },
    { path: '/kids?style=boys-kurta', destination: /\/coming-soon\/kids-boys$/, heading: /little gentlemen/i }
  ]) {
    test(`${department.path} redirects to its premium coming-soon page`, async ({ page }) => {
      await page.goto(department.path);
      await expect(page).toHaveURL(department.destination);
      await expect(page.getByRole('heading', { name: department.heading })).toBeVisible();
      const heroImage = page.locator('main section img').first();
      await expect(heroImage).toBeVisible();
      await expect.poll(() => heroImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    });
  }

  for (const campaign of [
    { department: 'women', alt: /Woman wearing a deep rose and gold South Indian lehenga/i, asset: /women-ceremony-hero/ },
    { department: 'men', alt: /Man wearing an ivory and antique-gold sherwani/i, asset: /men-ceremony-hero/ },
    { department: 'kids-boys', alt: /Young boy wearing an ivory and emerald South Indian ceremony outfit/i, asset: /boys-ceremony-hero/ }
  ]) {
    test(`${campaign.department} coming-soon page uses its dedicated ceremony campaign image`, async ({ page }) => {
      await page.goto(`/coming-soon/${campaign.department}`);
      const hero = page.getByAltText(campaign.alt);

      await expect(hero).toBeVisible();
      await expect(hero).toHaveAttribute('src', campaign.asset);
      await expect.poll(() => hero.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    });
  }

  for (const department of ['women', 'men', 'kids-boys']) {
    test(`${department} coming-soon hero uses the ornamental temple-arch divider`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 950 });
      await page.goto(`/coming-soon/${department}`);

      const templeEdge = page.locator('.ceremony-hero__edge--temple');
      await expect(templeEdge).toBeVisible();
      await expect(templeEdge.locator('.ceremony-hero__edge-lotus')).toHaveCount(1);
    });
  }

  test('legacy unavailable category routes do not expose inventory', async ({ page }) => {
    await page.goto('/category/bridal-lehenga');
    await expect(page).toHaveURL(/\/coming-soon\/women$/);
  });

  for (const width of [375, 768, 1024, 1440]) {
    test(`home page has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto('/');
      await expect(page.getByRole('region', { name: 'Featured AMZIRA styles' })).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(hasOverflow).toBe(false);
    });
  }
});
