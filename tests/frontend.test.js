// Test script for frontend components
const { test, expect } = require('@playwright/test');

// Test homepage
test('Homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Check title
  await expect(page).toHaveTitle(/Online Kladionica/);
  
  // Check navigation
  await expect(page.locator('nav')).toBeVisible();
  
  // Check sports list
  await expect(page.locator('.sports-list')).toBeVisible();
  
  // Check events display
  await expect(page.locator('.events-container')).toBeVisible();
  
  // Check language switcher
  await expect(page.locator('.language-switcher')).toBeVisible();
});

// Test authentication
test('User can login', async ({ page }) => {
  await page.goto('http://localhost:3000/auth');
  
  // Fill login form
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Check if redirected to user account
  await expect(page).toHaveURL(/account/);
  
  // Check if user info is displayed
  await expect(page.locator('.user-info')).toBeVisible();
});

// Test betting slip
test('Betting slip works correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Login first
  // ... login code ...
  
  // Click on an event to add to betting slip
  await page.click('.event-card:first-child .odds-button:first-child');
  
  // Check if betting slip is updated
  await expect(page.locator('.betting-slip')).toBeVisible();
  await expect(page.locator('.betting-slip-item')).toBeVisible();
  
  // Enter bet amount
  await page.fill('.betting-slip input[name="amount"]', '100');
  
  // Check if potential win is calculated
  await expect(page.locator('.potential-win')).toContainText(/\d+\.\d+/);
  
  // Check if fee is displayed
  await expect(page.locator('.fee')).toContainText('2%');
});

// Test wallet integration
test('Wallet integration works', async ({ page }) => {
  await page.goto('http://localhost:3000/account');
  
  // Login first
  // ... login code ...
  
  // Check wallet section
  await expect(page.locator('.wallet-section')).toBeVisible();
  
  // Check connect wallet button
  await expect(page.locator('.connect-wallet-button')).toBeVisible();
  
  // Mock wallet connection (since we can't interact with MetaMask in tests)
  await page.evaluate(() => {
    window.mockWalletConnected = true;
    window.mockWalletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    window.mockWalletBalance = 1000;
    window.dispatchEvent(new CustomEvent('walletConnected'));
  });
  
  // Check if wallet info is displayed
  await expect(page.locator('.wallet-address')).toContainText('0x1234');
  await expect(page.locator('.wallet-balance')).toContainText('1000');
});

// Test multilanguage support
test('Language switching works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Default language should be English
  await expect(page.locator('h1')).toContainText('Sports Betting');
  
  // Switch to French
  await page.click('.language-switcher');
  await page.click('text=Français');
  
  // Check if content is in French
  await expect(page.locator('h1')).toContainText('Paris Sportifs');
  
  // Switch to Spanish
  await page.click('.language-switcher');
  await page.click('text=Español');
  
  // Check if content is in Spanish
  await expect(page.locator('h1')).toContainText('Apuestas Deportivas');
});

// Test responsive design
test('Responsive design works on mobile', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('http://localhost:3000');
  
  // Check if mobile menu is visible
  await expect(page.locator('.mobile-menu-button')).toBeVisible();
  
  // Open mobile menu
  await page.click('.mobile-menu-button');
  
  // Check if navigation is visible
  await expect(page.locator('nav.mobile-nav')).toBeVisible();
});
