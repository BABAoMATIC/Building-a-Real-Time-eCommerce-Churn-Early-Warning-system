import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto('/')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Wait for successful login
  await page.waitForURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
  
  // End of authentication steps
  await page.context().storageState({ path: authFile })
})
