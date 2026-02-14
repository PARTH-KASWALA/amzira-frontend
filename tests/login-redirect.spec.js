const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5500';
const LOGIN_URL = `${BASE_URL}/login.html`;

const VALID_USER = process.env.LOGIN_USER || 'user@example.com';
const VALID_PASS = process.env.LOGIN_PASS || 'StrongPass1';

// Adjust if your home page is different
const HOME_URL_REGEX = new RegExp(`${BASE_URL}/(index\\.html)?$`);

// Pages that should NEVER be the login redirect target
const BAD_REDIRECT_REGEX = /(address|account\/address|checkout|address\.html)/i;

test.describe('Login redirect behavior', () => {
  test('positive: redirects to home page after successful login', async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.fill('#emailPhone', VALID_USER);
    await page.fill('#password', VALID_PASS);

    await page.click('#loginBtn');

    // Wait for either redirect or visible error
    const result = await Promise.race([
      page.waitForURL(url => !url.pathname.endsWith('/login.html'), { timeout: 15_000 }).then(() => 'redirect'),
      page.waitForSelector('#errorMessage.show', { timeout: 15_000 }).then(() => 'error')
    ]);

    if (result === 'error') {
      const errText = (await page.textContent('#errorMessage'))?.trim() || 'Unknown login error';
      throw new Error(`Login failed, so redirect never happened. Error: ${errText}`);
    }

    const url = page.url();

    // Accept / or /index.html
    await expect(page).toHaveURL(HOME_URL_REGEX, {
      message: `Expected redirect to home (${HOME_URL_REGEX}) but got ${url}`
    });
  });

  test('negative: should NOT redirect to address page', async ({ page }) => {
    await page.goto(LOGIN_URL);

    await page.fill('#emailPhone', VALID_USER);
    await page.fill('#password', VALID_PASS);

    await page.click('#loginBtn');
    const result = await Promise.race([
      page.waitForURL(url => !url.pathname.endsWith('/login.html'), { timeout: 15_000 }).then(() => 'redirect'),
      page.waitForSelector('#errorMessage.show', { timeout: 15_000 }).then(() => 'error')
    ]);

    if (result === 'error') {
      const errText = (await page.textContent('#errorMessage'))?.trim() || 'Unknown login error';
      throw new Error(`Login failed, so redirect never happened. Error: ${errText}`);
    }

    const url = page.url();
    expect(
      BAD_REDIRECT_REGEX.test(url),
      `Login redirected incorrectly to ${url}`
    ).toBe(false);
  });
});
