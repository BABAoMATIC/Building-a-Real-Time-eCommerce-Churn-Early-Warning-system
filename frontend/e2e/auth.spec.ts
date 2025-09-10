import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form on homepage', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ChurnGuard')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Wait for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Sign up')
    await page.waitForURL('/register')
    await expect(page.locator('h1')).toContainText('Create Account')
  })

  test('should register new user successfully', async ({ page }) => {
    await page.click('text=Sign up')
    await page.waitForURL('/register')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.fill('input[name="company"]', 'Test Company')
    
    await page.click('button[type="submit"]')
    
    // Wait for success message or redirect
    await expect(page.locator('text=Account created successfully')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Then logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('/')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})
