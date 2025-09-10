import { test, expect, devices } from '@playwright/test'

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test.describe('Mobile Viewport (375x667)', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should display mobile navigation', async ({ page }) => {
      // Check for mobile menu button
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
      
      // Check sidebar is hidden by default
      await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible()
    })

    test('should open mobile menu', async ({ page }) => {
      await page.click('[data-testid="mobile-menu-button"]')
      
      // Check sidebar is now visible
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
      
      // Check navigation links are visible
      await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
      await expect(page.locator('a[href="/profile"]')).toBeVisible()
      await expect(page.locator('a[href="/settings"]')).toBeVisible()
    })

    test('should close mobile menu when clicking outside', async ({ page }) => {
      await page.click('[data-testid="mobile-menu-button"]')
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
      
      // Click outside the sidebar
      await page.click('main')
      
      // Sidebar should be hidden
      await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible()
    })

    test('should display dashboard cards in single column', async ({ page }) => {
      // Check dashboard cards are stacked vertically
      const cards = page.locator('[data-testid="metric-card"]')
      await expect(cards).toHaveCount(4)
      
      // Check cards are full width
      const firstCard = cards.first()
      const box = await firstCard.boundingBox()
      expect(box?.width).toBeGreaterThan(300) // Should be nearly full width
    })

    test('should display cohorts in single column', async ({ page }) => {
      // Check cohorts section
      await expect(page.locator('text=Customer Cohorts')).toBeVisible()
      
      // Check cohort cards are stacked
      const cohortCards = page.locator('[data-testid="cohort-card"]')
      if (await cohortCards.count() > 0) {
        const firstCard = cohortCards.first()
        const box = await firstCard.boundingBox()
        expect(box?.width).toBeGreaterThan(300)
      }
    })

    test('should handle profile page on mobile', async ({ page }) => {
      await page.click('a[href="/profile"]')
      await page.waitForURL('/profile')
      
      // Check profile form is responsive
      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('input[name="email"]')).toBeVisible()
      
      // Check form elements are full width
      const nameInput = page.locator('input[name="name"]')
      const box = await nameInput.boundingBox()
      expect(box?.width).toBeGreaterThan(300)
    })

    test('should handle settings page on mobile', async ({ page }) => {
      await page.click('a[href="/settings"]')
      await page.waitForURL('/settings')
      
      // Check tabs are responsive
      await expect(page.locator('[data-testid="settings-tabs"]')).toBeVisible()
      
      // Check tab buttons are touch-friendly
      const tabButtons = page.locator('[data-testid="tab-button"]')
      const firstTab = tabButtons.first()
      const box = await firstTab.boundingBox()
      expect(box?.height).toBeGreaterThan(40) // Touch-friendly height
    })
  })

  test.describe('Tablet Viewport (768x1024)', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('should display dashboard cards in two columns', async ({ page }) => {
      const cards = page.locator('[data-testid="metric-card"]')
      await expect(cards).toHaveCount(4)
      
      // Check cards are in grid layout
      const firstCard = cards.first()
      const secondCard = cards.nth(1)
      
      const firstBox = await firstCard.boundingBox()
      const secondBox = await secondCard.boundingBox()
      
      // Cards should be side by side
      expect(firstBox?.width).toBeLessThan(400)
      expect(secondBox?.width).toBeLessThan(400)
    })

    test('should display cohorts in two columns', async ({ page }) => {
      await expect(page.locator('text=Customer Cohorts')).toBeVisible()
      
      const cohortCards = page.locator('[data-testid="cohort-card"]')
      if (await cohortCards.count() > 1) {
        const firstCard = cohortCards.first()
        const secondCard = cohortCards.nth(1)
        
        const firstBox = await firstCard.boundingBox()
        const secondBox = await secondCard.boundingBox()
        
        // Cards should be in grid
        expect(firstBox?.width).toBeLessThan(400)
        expect(secondBox?.width).toBeLessThan(400)
      }
    })

    test('should show sidebar on tablet', async ({ page }) => {
      // Sidebar should be visible on tablet
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
      
      // Main content should be offset
      const main = page.locator('main')
      const box = await main.boundingBox()
      expect(box?.x).toBeGreaterThan(200) // Offset for sidebar
    })
  })

  test.describe('Desktop Viewport (1920x1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } })

    test('should display dashboard cards in four columns', async ({ page }) => {
      const cards = page.locator('[data-testid="metric-card"]')
      await expect(cards).toHaveCount(4)
      
      // Check cards are in grid layout
      const firstCard = cards.first()
      const box = await firstCard.boundingBox()
      expect(box?.width).toBeLessThan(500) // Should be in grid
    })

    test('should display cohorts in three columns', async ({ page }) => {
      await expect(page.locator('text=Customer Cohorts')).toBeVisible()
      
      const cohortCards = page.locator('[data-testid="cohort-card"]')
      if (await cohortCards.count() > 2) {
        const firstCard = cohortCards.first()
        const box = await firstCard.boundingBox()
        expect(box?.width).toBeLessThan(600) // Should be in grid
      }
    })

    test('should show full sidebar on desktop', async ({ page }) => {
      // Sidebar should be fully visible
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
      
      // Check sidebar width
      const sidebar = page.locator('[data-testid="sidebar"]')
      const box = await sidebar.boundingBox()
      expect(box?.width).toBe(256) // Full sidebar width
    })

    test('should handle large forms properly', async ({ page }) => {
      await page.click('a[href="/settings"]')
      await page.waitForURL('/settings')
      
      // Check form elements are properly sized
      const inputs = page.locator('input, textarea, select')
      const firstInput = inputs.first()
      const box = await firstInput.boundingBox()
      expect(box?.width).toBeGreaterThan(200) // Adequate width
    })
  })

  test.describe('Cross-device Navigation', () => {
    test('should maintain navigation state across viewports', async ({ page }) => {
      // Start on mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.click('[data-testid="mobile-menu-button"]')
      await page.click('a[href="/profile"]')
      await page.waitForURL('/profile')
      
      // Switch to desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // Should still be on profile page
      await expect(page.locator('h1')).toContainText('Profile')
      
      // Sidebar should be visible
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    })

    test('should handle orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 })
      
      // Layout should adapt
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
      
      // Switch back to portrait
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Should still work
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
    })
  })

  test.describe('Touch Interactions', () => {
    test.use({ ...devices['iPhone 12'] })

    test('should handle touch interactions', async ({ page }) => {
      // Test touch on buttons
      await page.tap('button:has-text("Add Cohort")')
      
      // Should open cohort form
      await expect(page.locator('[data-testid="cohort-form"]')).toBeVisible()
    })

    test('should handle swipe gestures', async ({ page }) => {
      // Test swipe to close mobile menu
      await page.click('[data-testid="mobile-menu-button"]')
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
      
      // Simulate swipe gesture
      await page.touchscreen.tap(50, 100)
      
      // Menu should close
      await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible()
    })

    test('should handle long press', async ({ page }) => {
      // Test long press on cohort card
      const cohortCard = page.locator('[data-testid="cohort-card"]').first()
      if (await cohortCard.count() > 0) {
        await cohortCard.tap()
        
        // Should show context menu or options
        await expect(page.locator('[data-testid="context-menu"]')).toBeVisible()
      }
    })
  })
})
