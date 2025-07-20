const { test, expect } = require('@playwright/test');
const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

test.describe('Smoke Tests', () => {
  test('Ana sayfa erişilebilir olmalı', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Lise Defteri/);
  });

  test('Giriş sayfası erişilebilir olmalı', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await expect(page.locator('h1')).toContainText('Giriş');
  });

  test('Kayıt sayfası erişilebilir olmalı', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    await expect(page.locator('h1')).toContainText('Kayıt');
  });

  test('Forum sayfası erişilebilir olmalı', async ({ page }) => {
    await page.goto(`${BASE_URL}/forum`);
    await expect(page.locator('h1')).toContainText('Forum');
  });

  test('API sağlık kontrolü başarılı olmalı', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('ok');
  });

  test('Supabase bağlantısı çalışmalı', async () => {
    const response = await axios.get(`${BASE_URL}/api/supabase-health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('connected');
  });
});