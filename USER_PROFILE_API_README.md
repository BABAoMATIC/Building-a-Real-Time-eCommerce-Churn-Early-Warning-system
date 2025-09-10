# User Profile API Documentation

## Overview

This document describes the user profile API endpoints that provide comprehensive user data and churn predictions. These endpoints are protected by JWT authentication and return user-specific information.

## API Endpoints

### 1. GET `/api/user/profile`

**Description**: Get comprehensive user profile with churn predictions and insights.

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
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
    },
    "activity_summary": {
      "total_predictions": 25,
      "avg_churn_score": 0.456,
      "high_risk_predictions": 3,
      "last_activity": "2024-01-01T00:00:00Z",
      "account_age_days": 30
    },
    "recent_predictions": [
      {
        "id": "pred_1_20240101_120000",
        "user_id": "user_1",
        "churn_score": 0.789,
        "risk_level": "high",
        "timestamp": "2024-01-01T12:00:00Z",
        "file_name": "customer_data.csv",
        "status": "completed"
      }
    ],
    "churn_insights": {
      "risk_level": "medium",
      "trend": "stable",
      "recommendations": [
        "Medium churn risk. Monitor customer engagement closely.",
        "Consider proactive outreach to at-risk customers.",
        "Analyze patterns in customer behavior data."
      ]
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. GET `/api/user/predictions`

**Description**: Get user's churn predictions with pagination.

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example**: `/api/user/predictions?page=1&limit=10`

**Response**:
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "id": "pred_1_20240101_120000",
        "user_id": "user_1",
        "churn_score": 0.789,
        "risk_level": "high",
        "timestamp": "2024-01-01T12:00:00Z",
        "file_name": "customer_data.csv",
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 3. GET `/api/user/stats`

**Description**: Get user statistics and trend analysis.

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_predictions": 25,
    "avg_churn_score": 0.456,
    "max_churn_score": 0.892,
    "min_churn_score": 0.123,
    "risk_distribution": {
      "low": 15,
      "medium": 7,
      "high": 3
    },
    "trend_analysis": {
      "trend": "stable",
      "change_percentage": 2.5
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Frontend Integration

### React Hook for User Profile Data

```typescript
import { useState, useEffect } from 'react'
import authApi from '@/lib/authApi'

interface UserProfileData {
  user: {
    id: number
    email: string
    name: string
    company?: string
    role: string
    is_active: boolean
    is_verified: boolean
    created_at: string
    updated_at: string
    last_login?: string
  }
  activity_summary: {
    total_predictions: number
    avg_churn_score: number
    high_risk_predictions: number
    last_activity?: string
    account_age_days: number
  }
  recent_predictions: Array<{
    id: string
    user_id: string
    churn_score: number
    risk_level: string
    timestamp: string
    file_name?: string
    status: string
  }>
  churn_insights: {
    risk_level: string
    trend: string
    recommendations: string[]
  }
}

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await authApi.getUserProfile()
        if (response.success) {
          setProfileData(response.data)
        } else {
          setError(response.error || 'Failed to fetch profile')
        }
      } catch (err) {
        setError('Failed to fetch profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profileData, loading, error }
}
```

### Profile Page Component Example

```typescript
import { useUserProfile } from '@/hooks/useUserProfile'

export default function ProfilePage() {
  const { profileData, loading, error } = useUserProfile()

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h1>Welcome, {profileData?.user.name}</h1>
      
      {/* Activity Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <h3>Total Predictions</h3>
          <p>{profileData?.activity_summary.total_predictions}</p>
        </div>
        <div className="card">
          <h3>Avg Churn Score</h3>
          <p>{profileData?.activity_summary.avg_churn_score.toFixed(3)}</p>
        </div>
        <div className="card">
          <h3>High Risk</h3>
          <p>{profileData?.activity_summary.high_risk_predictions}</p>
        </div>
        <div className="card">
          <h3>Account Age</h3>
          <p>{profileData?.activity_summary.account_age_days} days</p>
        </div>
      </div>

      {/* Churn Insights */}
      <div className="card">
        <h3>Churn Insights</h3>
        <p>Risk Level: {profileData?.churn_insights.risk_level}</p>
        <p>Trend: {profileData?.churn_insights.trend}</p>
        <ul>
          {profileData?.churn_insights.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Recent Predictions */}
      <div className="card">
        <h3>Recent Predictions</h3>
        {profileData?.recent_predictions.map((prediction) => (
          <div key={prediction.id} className="prediction-item">
            <p>Score: {prediction.churn_score.toFixed(3)}</p>
            <p>Risk: {prediction.risk_level}</p>
            <p>Date: {new Date(prediction.timestamp).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Authentication Flow

### JWT Token Handling

The frontend automatically includes JWT tokens in all API requests:

```typescript
// In authApi.ts
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  timeout: 10000,
})

// Request interceptor adds token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor handles token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          })
          const { access_token } = response.data
          localStorage.setItem('authToken', access_token)
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`
          return authApi(error.config)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
```

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "error": "Token is missing or invalid"
}
```

**403 Forbidden**:
```json
{
  "error": "Access denied"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Failed to fetch user profile: Database connection error"
}
```

### Frontend Error Handling

```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login')
  } else if (error.response?.status === 403) {
    // Show access denied message
    setError('Access denied')
  } else {
    // Show generic error
    setError('An error occurred')
  }
}
```

## Testing

### Backend Testing

Run the user profile API tests:

```bash
cd backend
python test_user_profile.py
```

### Frontend Testing

Test the profile page functionality:

```bash
cd frontend
npm test
```

### Manual Testing

1. **Login**: Use the login page to authenticate
2. **Profile Access**: Navigate to `/profile` - should show user data
3. **Data Loading**: Verify that user-specific data loads correctly
4. **Churn Insights**: Check that churn predictions and insights display
5. **Authentication**: Try accessing profile without login - should redirect

## Security Considerations

1. **JWT Validation**: All endpoints validate JWT tokens
2. **User Isolation**: Users can only access their own data
3. **Token Expiration**: Tokens expire and are automatically refreshed
4. **Input Validation**: All inputs are validated and sanitized
5. **SQL Injection**: Using parameterized queries prevents SQL injection

## Performance Optimization

1. **Pagination**: Predictions endpoint supports pagination
2. **Caching**: Consider implementing Redis caching for frequently accessed data
3. **Database Indexing**: Ensure proper indexes on user_id and timestamp fields
4. **Response Compression**: Enable gzip compression for API responses

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data updates
2. **Data Export**: Allow users to export their prediction data
3. **Advanced Analytics**: More sophisticated trend analysis
4. **Notification System**: Alerts for high-risk predictions
5. **Data Visualization**: Charts and graphs for better insights
