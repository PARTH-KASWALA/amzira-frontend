const { test, expect } = require('@playwright/test');

const productSlug = 'sri-valli-girls-traditional-pattu-pavadai';

test.describe('AMZIRA Next storefront', () => {
  test('browse to PDP, select size, add to cart, and checkout success', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Royal Kanchipuram Lehenga Choli/i })).toBeVisible();

    await page.goto(`/product/${productSlug}`);
    await expect(page.getByRole('heading', { name: /Sri Valli Temple Border/i })).toBeVisible();
    await page.getByRole('radio', { name: '6-7Y', exact: true }).click();
    await page.getByRole('button', { name: /Add to cart/i }).click();

    await page.goto('/cart');
    await expect(page.getByText(/Sri Valli Temple Border/i)).toBeVisible();
    await expect(page.getByText('Size: 6-7Y')).toBeVisible();
    await page.getByRole('link', { name: /Secure checkout/i }).click();

    await page.getByLabel('Full name', { exact: true }).fill('Parth Kaswala');
    await page.getByLabel('Email', { exact: true }).fill('parth@example.com');
    await page.getByLabel('Phone', { exact: true }).fill('9999999999');
    await page.getByLabel('Pincode', { exact: true }).fill('395007');
    await page.getByLabel('Address', { exact: true }).fill('AMZIRA test address');
    await page.getByRole('button', { name: /Place order/i }).click();

    await expect(page).toHaveURL(/\/order-success$/);
    await expect(page.getByRole('heading', { name: /celebration look is reserved/i })).toBeVisible();
  });

  test('checkout payment failure path is reachable', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByRole('button', { name: /Simulate payment failure/i }).click();
    await expect(page).toHaveURL(/\/payment-failure$/);
    await expect(page.getByRole('heading', { name: /cart is still safe/i })).toBeVisible();
  });

  test('unavailable departments redirect to premium coming soon pages', async ({ page }) => {
    await page.goto('/women');
    await expect(page).toHaveURL(/\/coming-soon\/women$/);
    await expect(page.getByRole('heading', { name: /new ceremony wardrobe/i })).toBeVisible();
    const womenHeroImage = page.getByAltText(/future women's collection/i);
    await expect(womenHeroImage).toBeVisible();
    expect(await womenHeroImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);

    await page.goto('/men');
    await expect(page).toHaveURL(/\/coming-soon\/men$/);
    await expect(page.getByRole('heading', { name: /men's ceremony edit/i })).toBeVisible();

    await page.goto('/kids?style=boys-kurta');
    await expect(page).toHaveURL(/\/coming-soon\/kids-boys$/);
    await expect(page.getByRole('heading', { name: /little gentlemen/i })).toBeVisible();
  });

  test('legacy women category routes no longer expose unavailable products', async ({ page }) => {
    await page.goto('/category/bridal-lehenga');
    await expect(page).toHaveURL(/\/coming-soon\/women$/);
  });

  test('legacy auth journeys render as Next pages', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in to AMZIRA/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Forgot password/i })).toBeVisible();

    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();

    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /Reset your password/i })).toBeVisible();
  });

  for (const width of [375, 768, 1024, 1440]) {
    test(`home page renders without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /Royal Kanchipuram Lehenga Choli/i })).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(hasOverflow).toBe(false);
    });
  }
});
