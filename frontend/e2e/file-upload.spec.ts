import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('File Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to settings
    await page.click('a[href="/settings"]')
    await page.waitForURL('/settings')
    
    // Click on data upload tab
    await page.click('button:has-text("Data Upload")')
  })

  test('should display file upload interface', async ({ page }) => {
    await expect(page.locator('text=Upload Data Files')).toBeVisible()
    await expect(page.locator('text=Drag and drop files here')).toBeVisible()
    await expect(page.locator('input[type="file"]')).toBeVisible()
  })

  test('should show supported file formats', async ({ page }) => {
    await expect(page.locator('text=Supported formats: CSV, Excel')).toBeVisible()
    await expect(page.locator('text=Maximum file size: 10MB')).toBeVisible()
  })

  test('should provide sample file download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download Sample")')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toMatch(/sample.*\.csv/)
  })

  test('should upload valid CSV file successfully', async ({ page }) => {
    // Create a test CSV file
    const csvContent = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No
2,30,Male,24,45.50,1092,Two year,Credit card,No
3,35,Female,36,67.25,2421,One year,Bank transfer,Yes`
    
    // Create file input and upload
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Wait for file selection
    await expect(page.locator('text=test-data.csv')).toBeVisible()
    
    // Click upload button
    await page.click('button:has-text("Upload File")')
    
    // Wait for progress bar
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible()
    
    // Wait for processing stages
    await expect(page.locator('text=Uploading file...')).toBeVisible()
    await expect(page.locator('text=Validating file format...')).toBeVisible()
    await expect(page.locator('text=Processing data...')).toBeVisible()
    await expect(page.locator('text=Running predictions...')).toBeVisible()
    await expect(page.locator('text=Saving results...')).toBeVisible()
    
    // Wait for success message
    await expect(page.locator('text=File uploaded and processed successfully')).toBeVisible()
    
    // Verify processing results
    await expect(page.locator('text=Total Records:')).toBeVisible()
    await expect(page.locator('text=Predictions Made:')).toBeVisible()
    await expect(page.locator('text=High Risk:')).toBeVisible()
    await expect(page.locator('text=Avg Churn Score:')).toBeVisible()
  })

  test('should show error for invalid file type', async ({ page }) => {
    // Create invalid file
    const invalidContent = 'This is not a CSV file'
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(invalidContent)
    })
    
    // Should show error immediately
    await expect(page.locator('text=Please select a valid CSV or Excel file')).toBeVisible()
  })

  test('should show error for file too large', async ({ page }) => {
    // Create large file content (simulate > 10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'large-file.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(largeContent)
    })
    
    // Should show error
    await expect(page.locator('text=File size must be less than 10MB')).toBeVisible()
  })

  test('should handle drag and drop upload', async ({ page }) => {
    const csvContent = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No`
    
    // Create file for drag and drop
    const file = {
      name: 'drag-drop-test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    }
    
    // Simulate drag and drop
    const dropZone = page.locator('[data-testid="drop-zone"]')
    await dropZone.dispatchEvent('drop', {
      dataTransfer: {
        files: [file]
      }
    })
    
    // Wait for file to be selected
    await expect(page.locator('text=drag-drop-test.csv')).toBeVisible()
  })

  test('should show progress bar during upload', async ({ page }) => {
    const csvContent = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No`
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'progress-test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    await page.click('button:has-text("Upload File")')
    
    // Check progress bar appears
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible()
    
    // Check percentage updates
    await expect(page.locator('text=%')).toBeVisible()
    
    // Wait for completion
    await expect(page.locator('text=Complete!')).toBeVisible()
  })

  test('should allow retry on upload failure', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/upload-data', route => route.abort())
    
    const csvContent = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No`
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'retry-test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    await page.click('button:has-text("Upload File")')
    
    // Wait for error
    await expect(page.locator('text=Upload failed')).toBeVisible()
    
    // Check retry button
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible()
    
    // Click retry
    await page.click('button:has-text("Try Again")')
    
    // Should attempt upload again
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible()
  })

  test('should clear file selection', async ({ page }) => {
    const csvContent = `customer_id,age,gender,tenure,monthly_charges,total_charges,contract_type,payment_method,churn
1,25,Female,12,29.85,358.2,Month-to-month,Electronic check,No`
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'clear-test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // File should be selected
    await expect(page.locator('text=clear-test.csv')).toBeVisible()
    
    // Click clear button
    await page.click('button:has-text("Clear")')
    
    // File should be cleared
    await expect(page.locator('text=clear-test.csv')).not.toBeVisible()
    await expect(page.locator('text=No file selected')).toBeVisible()
  })
})
