# API Documentation

## Overview

The Churn Early-Warning System provides a RESTful API for customer churn prediction and management. The API is built with Flask and provides endpoints for customer data, churn predictions, alerts, and real-time updates.

## Base URL

```
Development: http://localhost:5000
Production: https://api.churn-system.com
```

## Authentication

Currently, the API does not require authentication for development purposes. In production, implement JWT-based authentication.

## Response Format

All API responses are in JSON format with the following structure:

```json
{
  "data": {},
  "message": "Success",
  "status": "success"
}
```

Error responses:

```json
{
  "error": "Error message",
  "status": "error",
  "code": 400
}
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the API service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "model_loaded": true
}
```

---

### Customer Management

#### GET /api/customers

Get a list of customers with their churn predictions.

**Query Parameters:**
- `limit` (optional): Number of customers to return (default: 100)
- `offset` (optional): Number of customers to skip (default: 0)
- `risk_level` (optional): Filter by risk level (low, medium, high, critical)

**Response:**
```json
{
  "customers": [
    {
      "customer_id": "CUST-001",
      "name": "John Doe",
      "email": "john@example.com",
      "total_orders": 15,
      "total_spent": 1250.50,
      "avg_order_value": 83.37,
      "days_since_last_order": 5,
      "support_tickets": 2,
      "product_returns": 1,
      "email_engagement": 0.75,
      "login_frequency": 12,
      "payment_failures": 0,
      "discount_usage": 0.3,
      "loyalty_points": 250,
      "account_age_days": 365,
      "churn_probability": 0.25,
      "risk_level": "low",
      "recommendations": [
        "Continue current engagement strategy"
      ]
    }
  ],
  "total": 100,
  "limit": 100,
  "offset": 0
}
```

#### GET /api/customers/{customer_id}

Get detailed information about a specific customer.

**Response:**
```json
{
  "customer_id": "CUST-001",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "total_orders": 15,
  "total_spent": 1250.50,
  "avg_order_value": 83.37,
  "days_since_last_order": 5,
  "support_tickets": 2,
  "product_returns": 1,
  "email_engagement": 0.75,
  "login_frequency": 12,
  "payment_failures": 0,
  "discount_usage": 0.3,
  "loyalty_points": 250,
  "account_age_days": 365,
  "churn_probability": 0.25,
  "risk_level": "low",
  "last_prediction_at": "2024-01-15T10:30:00Z",
  "is_active": true,
  "created_at": "2023-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Churn Prediction

#### POST /api/churn/predict

Predict churn probability for a customer.

**Request Body:**
```json
{
  "total_orders": 15,
  "total_spent": 1250.50,
  "avg_order_value": 83.37,
  "days_since_last_order": 5,
  "support_tickets": 2,
  "product_returns": 1,
  "email_engagement": 0.75,
  "login_frequency": 12,
  "payment_failures": 0,
  "discount_usage": 0.3,
  "loyalty_points": 250,
  "account_age_days": 365
}
```

**Response:**
```json
{
  "churn_probability": 0.25,
  "risk_level": "low",
  "recommendations": [
    "Continue current engagement strategy",
    "Monitor for any changes in behavior"
  ],
  "confidence": 0.87,
  "model_version": "1.0.0"
}
```

#### GET /api/churn/predictions

Get recent churn predictions.

**Query Parameters:**
- `limit` (optional): Number of predictions to return (default: 50)
- `risk_level` (optional): Filter by risk level
- `date_from` (optional): Start date (ISO format)
- `date_to` (optional): End date (ISO format)

**Response:**
```json
{
  "predictions": [
    {
      "id": "pred-001",
      "customer_id": "CUST-001",
      "churn_probability": 0.25,
      "risk_level": "low",
      "confidence": 0.87,
      "model_version": "1.0.0",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50
}
```

---

### Alerts

#### GET /api/alerts

Get recent churn alerts.

**Query Parameters:**
- `limit` (optional): Number of alerts to return (default: 20)
- `status` (optional): Filter by status (new, acknowledged, resolved)
- `priority` (optional): Filter by priority (low, medium, high, urgent)

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-001",
      "customer_id": "CUST-001",
      "alert_type": "churn_risk",
      "priority": "high",
      "title": "High Churn Risk Detected",
      "message": "Customer shows high churn risk (85%). Immediate action recommended.",
      "status": "new",
      "created_at": "2024-01-15T10:30:00Z",
      "acknowledged_at": null,
      "resolved_at": null
    }
  ],
  "total": 20
}
```

#### POST /api/alerts/{alert_id}/acknowledge

Acknowledge an alert.

**Response:**
```json
{
  "message": "Alert acknowledged successfully",
  "acknowledged_at": "2024-01-15T10:35:00Z"
}
```

#### POST /api/alerts/{alert_id}/resolve

Resolve an alert.

**Request Body:**
```json
{
  "resolution_notes": "Customer contacted and issue resolved"
}
```

**Response:**
```json
{
  "message": "Alert resolved successfully",
  "resolved_at": "2024-01-15T10:40:00Z"
}
```

---

### Dashboard Statistics

#### GET /api/dashboard/stats

Get dashboard statistics.

**Response:**
```json
{
  "total_customers": 12543,
  "churn_rate": 12.5,
  "high_risk_customers": 1567,
  "revenue_at_risk": 234500,
  "alerts_today": 23,
  "resolved_alerts": 18,
  "model_accuracy": 87.2,
  "last_model_update": "2024-01-15T08:00:00Z"
}
```

#### GET /api/dashboard/trends

Get churn trends over time.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `granularity` (optional): Data granularity (hour, day, week, month)

**Response:**
```json
{
  "trends": [
    {
      "date": "2024-01-15",
      "churn_rate": 12.5,
      "high_risk_customers": 1567,
      "new_customers": 234,
      "churned_customers": 45
    }
  ],
  "period": "30d",
  "granularity": "day"
}
```

---

### Customer Events

#### GET /api/customers/{customer_id}/events

Get customer behavior events.

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 50)
- `event_type` (optional): Filter by event type
- `date_from` (optional): Start date (ISO format)
- `date_to` (optional): End date (ISO format)

**Response:**
```json
{
  "events": [
    {
      "id": "event-001",
      "event_type": "order_placed",
      "event_data": {
        "order_id": "ORD-12345",
        "order_value": 99.99,
        "items_count": 3,
        "payment_method": "credit_card"
      },
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50
}
```

---

## WebSocket API

### Connection

Connect to WebSocket endpoint:

```javascript
const socket = io('ws://localhost:5000/ws');
```

### Events

#### Connection Events

**connect**
```javascript
socket.on('connect', () => {
  console.log('Connected to churn prediction service');
});
```

**disconnect**
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from service');
});
```

#### Subscription Events

**subscribe_alerts**
```javascript
socket.emit('subscribe_alerts');
```

**subscribed**
```javascript
socket.on('subscribed', (data) => {
  console.log('Subscribed to churn alerts');
});
```

#### Real-time Updates

**churn_alert**
```javascript
socket.on('churn_alert', (alert) => {
  console.log('New churn alert:', alert);
});
```

**prediction_update**
```javascript
socket.on('prediction_update', (prediction) => {
  console.log('Updated prediction:', prediction);
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General API**: 100 requests per minute per IP
- **Prediction API**: 10 requests per minute per IP
- **WebSocket**: 5 connections per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000
});

// Get customers
const customers = await api.get('/api/customers');

// Predict churn
const prediction = await api.post('/api/churn/predict', {
  total_orders: 15,
  total_spent: 1250.50,
  // ... other features
});

// Get alerts
const alerts = await api.get('/api/alerts');
```

### Python

```python
import requests

base_url = 'http://localhost:5000'

# Get customers
response = requests.get(f'{base_url}/api/customers')
customers = response.json()

# Predict churn
prediction_data = {
    'total_orders': 15,
    'total_spent': 1250.50,
    # ... other features
}
response = requests.post(f'{base_url}/api/churn/predict', json=prediction_data)
prediction = response.json()
```

## Testing

### Postman Collection

Import the Postman collection for easy API testing:

```json
{
  "info": {
    "name": "Churn API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    }
  ]
}
```

### cURL Examples

```bash
# Health check
curl -X GET http://localhost:5000/health

# Get customers
curl -X GET http://localhost:5000/api/customers

# Predict churn
curl -X POST http://localhost:5000/api/churn/predict \
  -H "Content-Type: application/json" \
  -d '{
    "total_orders": 15,
    "total_spent": 1250.50,
    "avg_order_value": 83.37,
    "days_since_last_order": 5,
    "support_tickets": 2,
    "product_returns": 1,
    "email_engagement": 0.75,
    "login_frequency": 12,
    "payment_failures": 0,
    "discount_usage": 0.3,
    "loyalty_points": 250,
    "account_age_days": 365
  }'
```
