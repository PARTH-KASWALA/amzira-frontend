const { test, expect } = require('@playwright/test');

const productSlug = 'valli-royal-red-kanjivaram-bridal-pattu-lehenga';

test.describe('AMZIRA Next storefront', () => {
  test('browse to PDP, select size, add to cart, and checkout success', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Kanjivaram richness/i })).toBeVisible();

    await page.goto(`/product/${productSlug}`);
    await expect(page.getByRole('heading', { name: /Valli Royal Red/i })).toBeVisible();
    await page.getByRole('radio', { name: 'M', exact: true }).click();
    await page.getByRole('button', { name: /Add to cart/i }).click();

    await page.goto('/cart');
    await expect(page.getByText(/Valli Royal Red/i)).toBeVisible();
    await expect(page.getByText('Size: M')).toBeVisible();
    await page.getByRole('link', { name: /Secure checkout/i }).click();

    await page.getByLabel('Full name').fill('Parth Kaswala');
    await page.getByLabel('Email').fill('parth@example.com');
    await page.getByLabel('Phone').fill('9999999999');
    await page.getByLabel('Pincode').fill('395007');
    await page.getByLabel('Address').fill('AMZIRA test address');
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

  for (const width of [375, 768, 1024, 1440]) {
    test(`home page renders without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /Kanjivaram richness/i })).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(hasOverflow).toBe(false);
    });
  }
});
