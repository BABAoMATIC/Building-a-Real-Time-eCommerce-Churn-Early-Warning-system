# Authentication System Documentation

## Overview

This document describes the JWT-based authentication system implemented for the eCommerce Churn Early-Warning System. The system provides secure user registration, login, and session management with protected routes.

## Features

- **JWT Authentication**: Secure token-based authentication
- **User Registration**: New user signup with validation
- **User Login**: Secure login with password hashing
- **Protected Routes**: Middleware to protect sensitive pages
- **Profile Management**: User profile updates and management
- **Session Management**: Automatic token refresh and logout
- **MySQL Integration**: User data stored in MySQL database

## Backend Components

### 1. User Model (`backend/models/user.py`)
- User database model with SQLAlchemy
- Password hashing using bcrypt
- User profile fields (name, email, company, role)
- Account status management (active, verified)

### 2. JWT Utilities (`backend/auth/jwt_utils.py`)
- JWT token creation and verification
- Access token (30 minutes) and refresh token (7 days)
- Authentication middleware decorators
- Token validation and user extraction

### 3. Authentication Service (`backend/auth/auth_service.py`)
- User registration with validation
- Login authentication
- Password change functionality
- Profile update operations
- Token refresh handling

### 4. Authentication Routes (`backend/auth/routes.py`)
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/refresh` - Token refresh
- `/api/auth/profile` - Get/update user profile
- `/api/auth/change-password` - Change password
- `/api/auth/verify` - Verify token
- `/api/auth/users` - Get all users (admin only)

## Frontend Components

### 1. Authentication Context (`frontend/contexts/AuthContext.tsx`)
- Global authentication state management
- User session handling
- Login/logout functionality
- Profile update operations

### 2. Authentication API (`frontend/lib/authApi.ts`)
- API client for authentication endpoints
- Automatic token refresh
- Request/response interceptors
- Error handling

### 3. Protected Route Component (`frontend/components/auth/ProtectedRoute.tsx`)
- Route protection middleware
- Authentication state checking
- Automatic redirects
- Loading states

### 4. Login Page (`frontend/app/login/page.tsx`)
- User login and registration forms
- Form validation
- Error handling
- Responsive design

### 5. Profile Page (`frontend/app/profile/page.tsx`)
- User profile display and editing
- Real-time updates
- Logout functionality
- Protected route implementation

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(100) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    preferences TEXT
);
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "company": "Acme Corp",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Corp",
    "role": "user",
    "is_active": true,
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/auth/login`
Authenticate user login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Corp",
    "role": "user"
  }
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Corp",
    "role": "user",
    "is_active": true,
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/auth/profile`
Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "company": "New Company"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Smith",
    "company": "New Company",
    "role": "user"
  }
}
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt
- Minimum 8 characters required
- Must contain uppercase, lowercase, and numbers
- Passwords are never stored in plain text

### JWT Security
- Access tokens expire in 30 minutes
- Refresh tokens expire in 7 days
- Tokens are signed with a secret key
- Automatic token refresh on expiration

### Route Protection
- Protected routes require valid JWT token
- Automatic redirect to login for unauthenticated users
- Admin-only routes for administrative functions
- Session validation on each request

### Input Validation
- Email format validation
- Password strength requirements
- SQL injection prevention
- XSS protection

## Usage Examples

### Frontend Authentication Flow

```typescript
import { useAuth } from '@/contexts/AuthContext'

function LoginComponent() {
  const { login, isAuthenticated, user } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password)
    if (result.success) {
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // Show error message
      setError(result.message)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  )
}
```

### Protected Route Usage

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Profile content */}
      </div>
    </ProtectedRoute>
  )
}
```

### Backend Route Protection

```python
from auth.jwt_utils import token_required

@app.route('/api/protected-endpoint', methods=['GET'])
@token_required
def protected_endpoint():
    user = request.current_user
    return jsonify({'message': f'Hello {user.name}'})
```

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=churn_db
DB_USER=root
DB_PASSWORD=your-password
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Installation and Setup

### Backend Setup
1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. Initialize database:
   ```bash
   python init_database.py
   ```

4. Start the server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **Token Expired**: The system automatically refreshes tokens, but if refresh fails, users are redirected to login.

2. **Database Connection**: Ensure MySQL is running and credentials are correct.

3. **CORS Issues**: Make sure the frontend URL is allowed in CORS configuration.

4. **Password Validation**: Ensure passwords meet the strength requirements.

### Debug Mode
Enable debug mode in the backend for detailed error messages:
```python
app.config['DEBUG'] = True
```

## Security Considerations

1. **Secret Key**: Use a strong, random secret key for JWT signing.
2. **HTTPS**: Use HTTPS in production for secure token transmission.
3. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for enhanced security).
4. **Rate Limiting**: Implement rate limiting for login attempts.
5. **Password Policy**: Enforce strong password policies.
6. **Session Management**: Implement proper session timeout and cleanup.

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA support
2. **OAuth Integration**: Support for Google, GitHub, etc.
3. **Role-Based Access Control**: Enhanced permission system
4. **Audit Logging**: Track user actions and security events
5. **Password Reset**: Email-based password reset functionality
6. **Account Lockout**: Lock accounts after failed login attempts
