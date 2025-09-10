import { test, expect } from '@playwright/test'

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to profile
    await page.click('a[href="/profile"]')
    await page.waitForURL('/profile')
  })

  test('should display user profile information', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Profile')
    await expect(page.locator('text=test@example.com')).toBeVisible()
    await expect(page.locator('text=Test User')).toBeVisible()
  })

  test('should edit profile successfully', async ({ page }) => {
    // Click edit button
    await page.click('button:has-text("Edit Profile")')
    
    // Update name
    await page.fill('input[name="name"]', 'Updated Name')
    await page.fill('input[name="company"]', 'Updated Company')
    
    // Save changes
    await page.click('button:has-text("Save Changes")')
    
    // Wait for success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible()
    
    // Verify changes
    await expect(page.locator('text=Updated Name')).toBeVisible()
    await expect(page.locator('text=Updated Company')).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")')
    
    await page.fill('input[name="email"]', 'invalid-email')
    await page.click('button:has-text("Save Changes")')
    
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
  })

  test('should update password successfully', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")')
    
    await page.fill('input[name="password"]', 'newpassword123')
    await page.fill('input[name="confirmPassword"]', 'newpassword123')
    
    await page.click('button:has-text("Save Changes")')
    
    await expect(page.locator('text=Profile updated successfully')).toBeVisible()
  })

  test('should show error for password mismatch', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")')
    
    await page.fill('input[name="password"]', 'newpassword123')
    await page.fill('input[name="confirmPassword"]', 'differentpassword')
    
    await page.click('button:has-text("Save Changes")')
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should cancel edit mode', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")')
    
    await page.fill('input[name="name"]', 'Temporary Name')
    
    await page.click('button:has-text("Cancel")')
    
    // Verify original name is still displayed
    await expect(page.locator('text=Test User')).toBeVisible()
  })

  test('should display activity summary', async ({ page }) => {
    await expect(page.locator('text=Activity Summary')).toBeVisible()
    await expect(page.locator('text=Total Predictions')).toBeVisible()
    await expect(page.locator('text=Average Churn Score')).toBeVisible()
  })

  test('should display recent predictions', async ({ page }) => {
    await expect(page.locator('text=Recent Predictions')).toBeVisible()
    // Check if predictions table or cards are visible
    await expect(page.locator('[data-testid="predictions-list"]')).toBeVisible()
  })
})
