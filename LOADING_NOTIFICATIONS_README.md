# Loading Indicators and Notifications System Documentation

## Overview

This document describes the comprehensive loading indicators, error handling, and success notification system implemented throughout the application. The system provides consistent user feedback for all async operations including file uploads, data processing, predictions, and API calls.

## Features

- **Loading Indicators**: Spinners, progress bars, and loading states
- **Error Handling**: Comprehensive error messages with retry options
- **Success Notifications**: Toast notifications for successful operations
- **Progress Tracking**: Real-time progress updates for long-running operations
- **Consistent UX**: Unified design language across all components

## Architecture

### Core Components

#### 1. LoadingSpinner Component (`frontend/components/ui/LoadingSpinner.tsx`)

**Features**:
- Multiple sizes (sm, md, lg, xl)
- Color variants (blue, green, red, gray, white)
- Optional text display
- Smooth animations with Framer Motion

**Usage**:
```tsx
<LoadingSpinner 
  size="lg" 
  color="blue" 
  text="Loading data..." 
  className="py-8" 
/>
```

**Props Interface**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'gray' | 'white'
  text?: string
  className?: string
}
```

#### 2. ProgressBar Component (`frontend/components/ui/ProgressBar.tsx`)

**Features**:
- Animated progress updates
- Multiple sizes and colors
- Percentage display
- Custom text labels
- Smooth transitions

**Usage**:
```tsx
<ProgressBar
  progress={uploadProgress}
  text="Uploading file..."
  color="blue"
  size="md"
  showPercentage={true}
/>
```

**Props Interface**:
```typescript
interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
  text?: string
  className?: string
}
```

#### 3. ErrorMessage Component (`frontend/components/ui/ErrorMessage.tsx`)

**Features**:
- Multiple error types (error, warning, info)
- Retry and dismiss actions
- Animated appearance
- Consistent styling

**Usage**:
```tsx
<ErrorMessage
  title="Upload Failed"
  message="File format not supported"
  type="error"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

**Props Interface**:
```typescript
interface ErrorMessageProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  onDismiss?: () => void
  showDismiss?: boolean
  className?: string
}
```

#### 4. SuccessMessage Component (`frontend/components/ui/SuccessMessage.tsx`)

**Features**:
- Success confirmation display
- Dismiss action
- Animated appearance
- Consistent styling

**Usage**:
```tsx
<SuccessMessage
  title="Upload Successful"
  message="File processed successfully!"
  onDismiss={handleDismiss}
/>
```

#### 5. useNotifications Hook (`frontend/hooks/useNotifications.ts`)

**Features**:
- Toast notification management
- Multiple notification types
- Customizable options
- Global notification control

**Usage**:
```tsx
const { showSuccess, showError, showWarning, showInfo } = useNotifications()

// Show success notification
showSuccess('Profile updated successfully!')

// Show error notification
showError('Failed to save changes')

// Show warning notification
showWarning('File size is large')

// Show info notification
showInfo('Processing your request...')
```

**API**:
```typescript
interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  autoClose?: boolean
  hideProgressBar?: boolean
  closeOnClick?: boolean
  pauseOnHover?: boolean
  draggable?: boolean
}
```

#### 6. NotificationProvider Component (`frontend/components/ui/NotificationProvider.tsx`)

**Features**:
- Global toast container
- Consistent styling
- Theme configuration
- Responsive design

## Implementation Examples

### File Upload with Progress Tracking

```tsx
const [uploading, setUploading] = useState(false)
const [uploadProgress, setUploadProgress] = useState(0)
const [processingStage, setProcessingStage] = useState('')
const { showSuccess, showError } = useNotifications()

const uploadFile = async () => {
  setUploading(true)
  setUploadProgress(0)
  setProcessingStage('Preparing upload...')

  try {
    // Simulate progress updates with realistic stages
    const progressStages = [
      { progress: 10, stage: 'Uploading file...' },
      { progress: 30, stage: 'Validating file format...' },
      { progress: 50, stage: 'Processing data...' },
      { progress: 70, stage: 'Running predictions...' },
      { progress: 90, stage: 'Saving results...' }
    ]

    let currentStageIndex = 0
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (currentStageIndex < progressStages.length && prev >= progressStages[currentStageIndex].progress) {
          setProcessingStage(progressStages[currentStageIndex].stage)
          currentStageIndex++
        }
        
        if (prev >= 95) {
          clearInterval(progressInterval)
          setProcessingStage('Finalizing...')
          return prev
        }
        return prev + Math.random() * 5 + 2
      })
    }, 300)

    const response = await authApi.uploadData(formData)
    
    clearInterval(progressInterval)
    setUploadProgress(100)
    setProcessingStage('Complete!')

    if (response.success) {
      showSuccess(response.message || 'File uploaded successfully!')
    } else {
      showError(response.error || 'Upload failed')
    }
  } catch (error) {
    showError(`Upload failed: ${error.message}`)
  } finally {
    setUploading(false)
    setUploadProgress(0)
    setProcessingStage('')
  }
}

// In JSX
{uploading && (
  <ProgressBar
    progress={uploadProgress}
    text={processingStage}
    color="blue"
    size="md"
    showPercentage={true}
  />
)}
```

### Profile Update with Loading States

```tsx
const [loading, setLoading] = useState(false)
const { showSuccess, showError } = useNotifications()

const handleSave = async () => {
  setLoading(true)
  
  try {
    const result = await authApi.updateUserProfile(updateData)
    
    if (result.success) {
      showSuccess('Profile updated successfully!')
      setIsEditing(false)
    } else {
      showError(result.error || 'Failed to update profile')
    }
  } catch (error) {
    showError('Failed to update profile. Please try again.')
  } finally {
    setLoading(false)
  }
}

// In JSX
<Button
  onClick={handleSave}
  disabled={loading}
  className="bg-blue-600 hover:bg-blue-700"
>
  {loading ? (
    <>
      <LoadingSpinner size="sm" color="white" />
      <span className="ml-2">Saving...</span>
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      Save Changes
    </>
  )}
</Button>
```

### Cohorts Management with Error Handling

```tsx
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const { showSuccess, showError } = useNotifications()

const loadCohorts = async () => {
  try {
    setLoading(true)
    setError(null)
    const response = await authApi.getCohorts()
    
    if (response.success) {
      setCohorts(response.data)
    } else {
      const errorMsg = 'Failed to load cohorts'
      setError(errorMsg)
      showError(errorMsg)
    }
  } catch (error) {
    const errorMsg = 'Failed to load cohorts. Please try again.'
    setError(errorMsg)
    showError(errorMsg)
  } finally {
    setLoading(false)
  }
}

// In JSX
{loading ? (
  <LoadingSpinner 
    size="lg" 
    text="Loading cohorts..." 
    className="py-12" 
  />
) : error ? (
  <ErrorMessage
    title="Error Loading Cohorts"
    message={error}
    onRetry={loadCohorts}
    onDismiss={() => setError(null)}
  />
) : (
  // Cohorts content
)}
```

## Loading States by Component

### 1. File Upload Component

**Loading Indicators**:
- Progress bar with percentage
- Processing stage text
- File validation feedback
- Upload progress simulation

**Error Handling**:
- File type validation
- File size validation
- Network error handling
- Server error responses

**Success Notifications**:
- Upload completion
- Processing results
- Statistics summary

### 2. Profile Page

**Loading Indicators**:
- Save button spinner
- Form submission state
- Profile data loading

**Error Handling**:
- Validation errors
- Network failures
- Server errors

**Success Notifications**:
- Profile update success
- Data refresh confirmation

### 3. Cohorts Section

**Loading Indicators**:
- Initial data loading
- Form submission
- Statistics recalculation

**Error Handling**:
- Data loading failures
- Form validation errors
- API errors

**Success Notifications**:
- Cohort creation
- Cohort updates
- Cohort deletion

### 4. Dashboard

**Loading Indicators**:
- Initial dashboard loading
- Real-time data connection
- Data refresh states

**Error Handling**:
- Connection failures
- Data loading errors
- Socket.IO errors

**Success Notifications**:
- Connection established
- Data updates received

## Notification Types and Usage

### Success Notifications

**When to Use**:
- Successful file uploads
- Profile updates
- Cohort operations
- Data processing completion

**Examples**:
```tsx
showSuccess('File uploaded successfully!')
showSuccess('Profile updated successfully!')
showSuccess('Cohort created successfully!')
```

### Error Notifications

**When to Use**:
- API failures
- Validation errors
- Network issues
- Server errors

**Examples**:
```tsx
showError('Failed to upload file')
showError('Invalid file format')
showError('Network connection lost')
```

### Warning Notifications

**When to Use**:
- File size warnings
- Data quality issues
- Performance warnings

**Examples**:
```tsx
showWarning('File size is large, upload may take longer')
showWarning('Some data may be missing')
```

### Info Notifications

**When to Use**:
- Process updates
- System information
- Helpful tips

**Examples**:
```tsx
showInfo('Processing your request...')
showInfo('Data will be available shortly')
```

## Progress Tracking Implementation

### File Upload Progress

```tsx
const progressStages = [
  { progress: 10, stage: 'Uploading file...' },
  { progress: 30, stage: 'Validating file format...' },
  { progress: 50, stage: 'Processing data...' },
  { progress: 70, stage: 'Running predictions...' },
  { progress: 90, stage: 'Saving results...' }
]

// Update progress with realistic stages
let currentStageIndex = 0
const progressInterval = setInterval(() => {
  setUploadProgress(prev => {
    if (currentStageIndex < progressStages.length && prev >= progressStages[currentStageIndex].progress) {
      setProcessingStage(progressStages[currentStageIndex].stage)
      currentStageIndex++
    }
    
    if (prev >= 95) {
      clearInterval(progressInterval)
      setProcessingStage('Finalizing...')
      return prev
    }
    return prev + Math.random() * 5 + 2
  })
}, 300)
```

### Data Processing Progress

```tsx
const [processingProgress, setProcessingProgress] = useState(0)
const [currentStep, setCurrentStep] = useState('')

const processData = async () => {
  const steps = [
    'Loading data...',
    'Validating records...',
    'Calculating metrics...',
    'Generating predictions...',
    'Saving results...'
  ]
  
  for (let i = 0; i < steps.length; i++) {
    setCurrentStep(steps[i])
    setProcessingProgress((i + 1) * 20)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
```

## Error Handling Patterns

### API Error Handling

```tsx
const handleApiCall = async () => {
  try {
    setLoading(true)
    const response = await api.call()
    
    if (response.success) {
      showSuccess(response.message)
      // Handle success
    } else {
      showError(response.error || 'Operation failed')
      // Handle API error
    }
  } catch (error) {
    if (error.response?.status === 401) {
      showError('Session expired. Please login again.')
      // Handle authentication error
    } else if (error.response?.status >= 500) {
      showError('Server error. Please try again later.')
    } else {
      showError('Network error. Please check your connection.')
    }
  } finally {
    setLoading(false)
  }
}
```

### Validation Error Handling

```tsx
const validateForm = () => {
  const errors: Record<string, string> = {}
  
  if (!formData.name.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  setFormErrors(errors)
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Please fix the validation errors')
    return
  }
  
  // Proceed with submission
}
```

## Accessibility Features

### Loading Indicators

- **Screen Reader Support**: Loading spinners include `aria-label` attributes
- **Focus Management**: Loading states don't interfere with keyboard navigation
- **Color Contrast**: All loading indicators meet WCAG contrast requirements

### Error Messages

- **Clear Messaging**: Error messages are descriptive and actionable
- **Retry Options**: Users can easily retry failed operations
- **Dismissal**: Users can dismiss non-critical errors

### Notifications

- **Non-intrusive**: Toast notifications don't block user interaction
- **Dismissible**: Users can close notifications manually
- **Auto-dismiss**: Notifications automatically disappear after a timeout

## Performance Considerations

### Loading State Management

- **Minimal Re-renders**: Loading states are optimized to prevent unnecessary re-renders
- **Debounced Updates**: Progress updates are debounced to prevent excessive state changes
- **Memory Cleanup**: Intervals and timeouts are properly cleaned up

### Notification Management

- **Queue Management**: Toast notifications are queued to prevent overflow
- **Memory Efficient**: Old notifications are automatically removed
- **Batch Updates**: Multiple notifications can be batched together

## Testing

### Loading State Testing

```tsx
// Test loading spinner
test('shows loading spinner when loading', () => {
  render(<Component loading={true} />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})

// Test progress bar
test('shows progress bar with correct percentage', () => {
  render(<ProgressBar progress={50} />)
  expect(screen.getByText('50%')).toBeInTheDocument()
})
```

### Error Handling Testing

```tsx
// Test error message display
test('shows error message when error occurs', () => {
  render(<Component error="Test error" />)
  expect(screen.getByText('Test error')).toBeInTheDocument()
})

// Test retry functionality
test('calls retry function when retry button clicked', () => {
  const mockRetry = jest.fn()
  render(<ErrorMessage onRetry={mockRetry} />)
  fireEvent.click(screen.getByText('Try Again'))
  expect(mockRetry).toHaveBeenCalled()
})
```

### Notification Testing

```tsx
// Test success notification
test('shows success notification', () => {
  const { showSuccess } = useNotifications()
  showSuccess('Test success')
  expect(screen.getByText('Test success')).toBeInTheDocument()
})

// Test error notification
test('shows error notification', () => {
  const { showError } = useNotifications()
  showError('Test error')
  expect(screen.getByText('Test error')).toBeInTheDocument()
})
```

## Best Practices

### Loading Indicators

1. **Show Progress**: Always show progress for operations longer than 1 second
2. **Be Descriptive**: Use descriptive text for loading states
3. **Provide Context**: Explain what's happening during loading
4. **Allow Cancellation**: Provide cancel options for long-running operations

### Error Handling

1. **Be Specific**: Provide specific error messages
2. **Offer Solutions**: Suggest actions users can take
3. **Provide Retry Options**: Allow users to retry failed operations
4. **Log Errors**: Log errors for debugging purposes

### Notifications

1. **Use Appropriate Types**: Choose the right notification type for the message
2. **Keep Messages Concise**: Use clear, concise language
3. **Provide Context**: Include relevant context in notifications
4. **Don't Overwhelm**: Avoid showing too many notifications at once

### Progress Tracking

1. **Be Realistic**: Use realistic progress increments
2. **Provide Stages**: Break down complex operations into stages
3. **Update Regularly**: Update progress frequently enough to feel responsive
4. **Handle Edge Cases**: Handle cases where progress can't be determined

## Conclusion

The loading indicators and notifications system provides a comprehensive solution for user feedback throughout the application. It ensures users are always informed about the status of their operations, can easily recover from errors, and receive confirmation of successful actions.

The system is designed to be:
- **Consistent**: Unified design language across all components
- **Accessible**: Meets accessibility standards and guidelines
- **Performant**: Optimized for minimal impact on application performance
- **Extensible**: Easy to add new notification types and loading states
- **User-friendly**: Provides clear, actionable feedback to users
