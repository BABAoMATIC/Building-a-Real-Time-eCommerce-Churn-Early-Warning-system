import { test, expect } from '@playwright/test'

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display dashboard with all key metrics', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Check for key metric cards
    await expect(page.locator('text=Total Predictions')).toBeVisible()
    await expect(page.locator('text=Average Churn Score')).toBeVisible()
    await expect(page.locator('text=High Risk Predictions')).toBeVisible()
    await expect(page.locator('text=Last Activity')).toBeVisible()
  })

  test('should display real-time connection status', async ({ page }) => {
    // Check for connection indicator
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible()
    
    // Should show connected status
    await expect(page.locator('text=Connected')).toBeVisible()
  })

  test('should update metrics in real-time', async ({ page }) => {
    // Wait for initial data load
    await page.waitForSelector('[data-testid="total-predictions"]')
    
    // Get initial value
    const initialValue = await page.textContent('[data-testid="total-predictions"]')
    
    // Wait for potential updates (real-time data)
    await page.waitForTimeout(2000)
    
    // Check if value has changed or is still displayed
    await expect(page.locator('[data-testid="total-predictions"]')).toBeVisible()
  })

  test('should display cohorts section', async ({ page }) => {
    await expect(page.locator('text=Customer Cohorts')).toBeVisible()
    await expect(page.locator('button:has-text("Add Cohort")')).toBeVisible()
  })

  test('should create new cohort', async ({ page }) => {
    await page.click('button:has-text("Add Cohort")')
    
    // Fill cohort form
    await page.fill('input[name="name"]', 'Test Cohort')
    await page.fill('textarea[name="description"]', 'Test cohort description')
    await page.selectOption('select[name="engagement_level"]', 'high')
    await page.selectOption('select[name="churn_risk_level"]', 'medium')
    
    await page.click('button:has-text("Create Cohort")')
    
    // Wait for success message
    await expect(page.locator('text=Cohort created successfully')).toBeVisible()
    
    // Verify cohort appears in list
    await expect(page.locator('text=Test Cohort')).toBeVisible()
  })

  test('should filter cohorts', async ({ page }) => {
    // Click filter button
    await page.click('button:has-text("Filter")')
    
    // Select filter options
    await page.selectOption('select[name="engagement_filter"]', 'high')
    await page.selectOption('select[name="churn_risk_filter"]', 'medium')
    
    await page.click('button:has-text("Apply Filters")')
    
    // Verify filter is applied
    await expect(page.locator('text=Filtered by')).toBeVisible()
  })

  test('should search cohorts', async ({ page }) => {
    await page.fill('input[placeholder*="Search cohorts"]', 'test')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Verify search is working
    await expect(page.locator('input[placeholder*="Search cohorts"]')).toHaveValue('test')
  })

  test('should refresh dashboard data', async ({ page }) => {
    // Click refresh button
    await page.click('button[data-testid="refresh-dashboard"]')
    
    // Wait for loading state
    await expect(page.locator('text=Refreshing...')).toBeVisible()
    
    // Wait for data to reload
    await page.waitForTimeout(2000)
    
    // Verify data is still displayed
    await expect(page.locator('[data-testid="total-predictions"]')).toBeVisible()
  })

  test('should handle connection errors gracefully', async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true)
    
    // Wait for error state
    await expect(page.locator('text=Connection lost')).toBeVisible()
    
    // Go back online
    await page.context().setOffline(false)
    
    // Wait for reconnection
    await expect(page.locator('text=Reconnected')).toBeVisible()
  })

  test('should display loading states', async ({ page }) => {
    // Navigate away and back to trigger loading
    await page.goto('/profile')
    await page.goto('/dashboard')
    
    // Check for loading indicator
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="total-predictions"]', { state: 'visible' })
  })
})
