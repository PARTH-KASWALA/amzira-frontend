const { test, expect } = require('@playwright/test');

const admin = {
  id: 7,
  email: 'seller@amzira.com',
  full_name: 'AMZIRA Seller',
  phone: '9876543210',
  role: 'admin'
};

const orderDetail = {
  id: 42,
  order_number: 'AMZ-2026-0042',
  customer: { name: 'Ananya Rao', email: 'ananya@example.com', phone: '9988776655' },
  status: 'confirmed',
  allowed_next_statuses: ['processing', 'cancelled'],
  subtotal: 4200,
  tax_amount: 210,
  shipping_charge: 0,
  discount_amount: 200,
  coupon_code: 'FESTIVE',
  total_amount: 4210,
  items: [{ id: 1, product_id: 10, variant_id: 12, product_name: 'Ruby Pattu Pavadai', variant_details: 'Size: 6-7Y, Color: Ruby', quantity: 1, unit_price: 4200, total_price: 4200 }],
  shipping_address: { full_name: 'Ananya Rao', phone: '9988776655', address_line1: '12 Temple Road', address_line2: null, city: 'Chennai', state: 'Tamil Nadu', pincode: '600004', country: 'India' },
  payment: { method: 'razorpay', status: 'success', amount: 4210, currency: 'INR', transaction_reference: 'pay_test42', refunded_amount: 0, paid_at: '2026-09-02T03:30:00Z' },
  customer_notes: null,
  admin_notes: null,
  tracking_number: null,
  carrier_name: null,
  courier_name: null,
  awb_code: null,
  tracking_url: null,
  current_location: null,
  estimated_delivery_date: null,
  delivered_at: null,
  status_history: [{ id: 1, old_status: 'placed', new_status: 'confirmed', changed_by: 7, notes: 'Payment confirmed', created_at: '2026-09-02T03:31:00Z' }],
  created_at: '2026-09-02T03:30:00Z'
};

async function mockAdminSession(page, role = 'admin') {
  await page.route('**/api/v1/users/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { ...admin, role } })
  }));
}

test.describe('AMZIRA seller order desk', () => {
  test('a guest is redirected to seller login with the intended destination', async ({ page }) => {
    await page.route('**/api/v1/users/me', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{"success":false,"message":"Not authenticated"}' }));
    await page.route('**/api/v1/auth/csrf-token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":null}' }));
    await page.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{"success":false,"message":"Not authenticated"}' }));

    await page.goto('/seller/orders');
    await expect(page).toHaveURL(/\/seller\/login\?next=%2Fseller%2Forders/);
    await expect(page.getByRole('heading', { name: 'Seller desk' })).toBeVisible();
  });

  test('a customer account cannot render protected seller operations', async ({ page }) => {
    await mockAdminSession(page, 'customer');
    await page.goto('/seller/orders');
    await expect(page.getByRole('heading', { name: 'Seller access required' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toHaveCount(0);
  });

  test('admin can load and filter the server-backed order list', async ({ page }) => {
    await mockAdminSession(page);
    let requestedUrl = '';
    await page.route('**/api/v1/admin/orders?**', (route) => {
      requestedUrl = route.request().url();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {
          total: 1, page: 1, limit: 20, pages: 1,
          orders: [{ id: 42, order_number: 'AMZ-2026-0042', customer_name: 'Ananya Rao', customer_email: 'ananya@example.com', customer_phone: '9988776655', status: 'confirmed', payment_status: 'success', payment_method: 'razorpay', total_amount: 4210, items_count: 1, created_at: '2026-09-02T03:30:00Z', tracking_number: null, courier_name: null }]
        } })
      });
    });

    await page.goto('/seller/orders');
    await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'AMZ-2026-0042' })).toBeVisible();
    await page.getByLabel('Order status').selectOption('confirmed');
    await expect(page).toHaveURL(/status=confirmed/);
    await expect.poll(() => requestedUrl).toContain('status=confirmed');
  });

  test('admin can inspect an order and make a controlled lifecycle update', async ({ page }) => {
    await mockAdminSession(page);
    let currentDetail = orderDetail;
    let updatePayload = null;
    await page.route('**/api/v1/admin/orders/42', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: currentDetail })
    }));
    await page.route('**/api/v1/auth/csrf-token', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":null}' }));
    await page.route('**/api/v1/admin/orders/42/status', async (route) => {
      updatePayload = route.request().postDataJSON();
      currentDetail = { ...currentDetail, status: 'processing', allowed_next_statuses: ['shipped', 'cancelled'] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":{"order_id":42,"status":"processing"}}' });
    });

    await page.goto('/seller/orders/42');
    await expect(page.getByRole('heading', { name: 'AMZ-2026-0042' })).toBeVisible();
    await expect(page.getByText('Ananya Rao').first()).toBeVisible();
    await expect(page.getByText('pay_test42')).toBeVisible();
    await expect(page.getByText(/cannot be cancelled here until its refund is processed/i)).toBeVisible();
    await page.getByLabel('Internal note').fill('Packed and quality checked');
    await page.getByRole('button', { name: 'Update to Packed' }).click();
    await expect(page.getByText('Order updated to Packed.')).toBeVisible();
    expect(updatePayload).toMatchObject({ status: 'processing', notes: 'Packed and quality checked' });
    await expect(page.getByText('Packed', { exact: true }).first()).toBeVisible();
  });

  test('checkout kill switch gives an authenticated customer a safe paused state', async ({ page }) => {
    await mockAdminSession(page, 'customer');
    await page.route('**/api/v1/commerce/status', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":{"checkout_enabled":false,"cod_enabled":false}}' }));
    await page.route('**/api/v1/users/me/addresses', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":[]}' }));

    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: 'Checkout is temporarily paused' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pay securely/i })).toHaveCount(0);
  });
});
