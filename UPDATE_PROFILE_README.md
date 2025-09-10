# Update Profile Feature Documentation

## Overview

This document describes the update profile functionality that allows users to modify their personal information including name, email, company, and password through a secure, validated form interface.

## Features

- **Comprehensive Form**: Update name, email, company, and password
- **Real-time Validation**: Frontend and backend validation with error messages
- **Password Security**: Optional password updates with strength requirements
- **Success Feedback**: Clear success messages and automatic data refresh
- **Protected Access**: JWT authentication required for all updates
- **Data Integrity**: MySQL database updates with proper validation

## Backend Implementation

### API Endpoint: `PUT /api/user/update-profile`

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "company": "Acme Corp",
  "password": "NewPassword123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Profile updated successfully. Updated fields: name, email, company",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "company": "Acme Corp",
    "role": "user",
    "is_active": true,
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  },
  "updated_fields": ["name", "email", "company"]
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

### Validation Rules

#### Name Validation
- Required field
- Minimum 2 characters
- Trimmed whitespace

#### Email Validation
- Required field
- Valid email format (regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
- Must be unique (not taken by another user)
- Converted to lowercase

#### Password Validation (Optional)
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Only validated if provided (optional field)

#### Company Validation
- Optional field
- Trimmed whitespace
- Can be empty/null

### Backend Code Structure

```python
@user_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_user_profile():
    """Update user profile information"""
    try:
        user = request.current_user
        data = request.get_json()
        
        # Validation and update logic
        # ...
        
        return jsonify({
            'success': True,
            'message': f'Profile updated successfully. Updated fields: {", ".join(updated_fields)}',
            'user': db_user.to_dict(),
            'updated_fields': updated_fields
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to update profile: {str(e)}'
        }), 500
```

## Frontend Implementation

### Form State Management

```typescript
const [editForm, setEditForm] = useState({
  name: user?.name || '',
  email: user?.email || '',
  company: user?.company || '',
  password: '',
  confirmPassword: ''
})

const [formErrors, setFormErrors] = useState<Record<string, string>>({})
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
```

### Form Validation

```typescript
const validateForm = () => {
  const errors: Record<string, string> = {}

  // Validate name
  if (!editForm.name.trim()) {
    errors.name = 'Name is required'
  } else if (editForm.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  }

  // Validate email
  if (!editForm.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Validate password if provided
  if (editForm.password) {
    if (editForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(editForm.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and numbers'
    }

    if (editForm.password !== editForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
  }

  setFormErrors(errors)
  return Object.keys(errors).length === 0
}
```

### Form Submission

```typescript
const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  setLoading(true)
  setMessage(null)
  setFormErrors({})

  try {
    // Prepare update data (only include changed fields)
    const updateData: any = {}
    
    if (editForm.name !== user?.name) {
      updateData.name = editForm.name
    }
    
    if (editForm.email !== user?.email) {
      updateData.email = editForm.email
    }
    
    if (editForm.company !== (user?.company || '')) {
      updateData.company = editForm.company
    }
    
    if (editForm.password) {
      updateData.password = editForm.password
    }

    const result = await authApi.updateUserProfile(updateData)
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setIsEditing(false)
      
      // Refresh profile data
      const profileResponse = await authApi.getUserProfile()
      if (profileResponse.success) {
        setProfileData(profileResponse.data)
      }
      
      // Update auth context
      await updateProfile({ name: editForm.name, company: editForm.company })
      
      // Clear password fields
      setEditForm(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }))
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'Failed to update profile' })
  } finally {
    setLoading(false)
  }
}
```

### UI Components

#### Form Fields

```tsx
{/* Name Field */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Full Name
  </label>
  {isEditing ? (
    <div>
      <Input
        value={editForm.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="Enter your full name"
        error={formErrors.name}
      />
      {formErrors.name && (
        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
      )}
    </div>
  ) : (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
      <User className="h-5 w-5 text-gray-400" />
      <span className="text-gray-900">{user.name}</span>
    </div>
  )}
</div>

{/* Password Field with Toggle */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    New Password (optional)
  </label>
  <div className="relative">
    <Input
      type={showPassword ? 'text' : 'password'}
      value={editForm.password}
      onChange={(e) => handleInputChange('password', e.target.value)}
      placeholder="Enter new password"
      error={formErrors.password}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  </div>
  {formErrors.password && (
    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
  )}
  <p className="mt-1 text-xs text-gray-500">
    Leave blank to keep current password. Must contain uppercase, lowercase, and numbers.
  </p>
</div>
```

#### Success/Error Messages

```tsx
{message && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg flex items-center space-x-3 ${
      message.type === 'success' 
        ? 'bg-green-50 border border-green-200 text-green-800' 
        : 'bg-red-50 border border-red-200 text-red-800'
    }`}
  >
    {message.type === 'success' ? (
      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
    )}
    <span className="font-medium">{message.text}</span>
  </motion.div>
)}
```

## User Experience Flow

### 1. Access Profile Page
- User navigates to `/profile`
- Protected route ensures authentication
- Profile data loads automatically

### 2. Edit Mode
- User clicks "Edit Profile" button
- Form fields become editable
- Password fields appear (optional)
- Validation errors clear

### 3. Form Interaction
- Real-time validation on field changes
- Password visibility toggle
- Confirm password field appears when password is entered
- Error messages display below invalid fields

### 4. Form Submission
- Client-side validation runs
- If valid, data sent to backend
- Loading state shows during request
- Success/error message displays

### 5. Success Handling
- Success message with checkmark icon
- Profile data refreshes automatically
- Form exits edit mode
- Password fields clear
- Auth context updates

### 6. Error Handling
- Error message with warning icon
- Form remains in edit mode
- Specific field errors highlighted
- User can correct and retry

## Security Features

### Authentication
- JWT token required for all updates
- Token validation on backend
- Automatic token refresh on expiration

### Data Validation
- Server-side validation for all fields
- SQL injection prevention
- XSS protection through input sanitization

### Password Security
- Passwords hashed with bcrypt
- Strong password requirements
- Optional password updates
- No password storage in frontend state

### Data Integrity
- Database transactions
- Rollback on errors
- Updated timestamp tracking
- Audit trail through updated_at field

## Error Handling

### Common Error Scenarios

#### Validation Errors
```json
{
  "success": false,
  "error": "Name must be at least 2 characters long"
}
```

#### Authentication Errors
```json
{
  "error": "Token is missing or invalid"
}
```

#### Database Errors
```json
{
  "success": false,
  "error": "Failed to update profile: Database connection error"
}
```

#### Email Conflict
```json
{
  "success": false,
  "error": "Email is already taken by another user"
}
```

### Frontend Error Display

```typescript
// Field-specific errors
{formErrors.name && (
  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
)}

// General error messages
{message && message.type === 'error' && (
  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
    <AlertTriangle className="h-5 w-5 text-red-600" />
    <span className="font-medium">{message.text}</span>
  </div>
)}
```

## Testing

### Backend Testing

Run the update profile tests:

```bash
cd backend
python test_update_profile.py
```

### Manual Testing Checklist

1. **Basic Update**
   - [ ] Update name successfully
   - [ ] Update email successfully
   - [ ] Update company successfully
   - [ ] Update password successfully

2. **Validation Testing**
   - [ ] Invalid email format rejected
   - [ ] Short name rejected
   - [ ] Weak password rejected
   - [ ] Password confirmation mismatch rejected

3. **Security Testing**
   - [ ] Unauthorized access blocked
   - [ ] Email uniqueness enforced
   - [ ] Password properly hashed

4. **UI Testing**
   - [ ] Form validation messages display
   - [ ] Success messages show
   - [ ] Password visibility toggle works
   - [ ] Form resets on cancel

## Performance Considerations

### Frontend Optimization
- Only send changed fields to backend
- Debounced validation (if needed)
- Efficient re-renders with React state
- Minimal API calls

### Backend Optimization
- Database indexing on email field
- Efficient SQL queries
- Connection pooling
- Response compression

## Future Enhancements

1. **Profile Picture Upload**
   - Image upload functionality
   - Avatar display and management

2. **Two-Factor Authentication**
   - 2FA setup in profile
   - Backup codes management

3. **Account Settings**
   - Notification preferences
   - Privacy settings
   - Data export options

4. **Audit Logging**
   - Track profile changes
   - Security event logging
   - Change history display

5. **Advanced Validation**
   - Real-time email availability check
   - Password strength meter
   - Custom validation rules

## Troubleshooting

### Common Issues

1. **Form Not Submitting**
   - Check validation errors
   - Verify network connection
   - Check browser console for errors

2. **Validation Not Working**
   - Ensure JavaScript is enabled
   - Check form field names match state
   - Verify validation regex patterns

3. **Backend Errors**
   - Check server logs
   - Verify database connection
   - Check JWT token validity

4. **UI Not Updating**
   - Check React state updates
   - Verify API response handling
   - Check component re-rendering

### Debug Mode

Enable debug logging:

```typescript
// Frontend
console.log('Form data:', editForm)
console.log('Validation errors:', formErrors)

// Backend
import logging
logging.basicConfig(level=logging.DEBUG)
```
