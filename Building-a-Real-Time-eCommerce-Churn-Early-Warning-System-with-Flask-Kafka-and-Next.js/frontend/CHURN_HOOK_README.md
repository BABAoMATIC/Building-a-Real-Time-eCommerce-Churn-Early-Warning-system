# useChurn Hook Documentation

The `useChurn` hook provides a simple interface for making churn prediction requests to the Flask API and managing the response state.

## Features

- ✅ **API Integration** - Connects to Flask `/predict-churn` endpoint
- ✅ **Loading States** - Shows loading indicators during requests
- ✅ **Error Handling** - Displays error messages for failed requests
- ✅ **TypeScript Support** - Fully typed for better development experience
- ✅ **React Hooks** - Uses modern React patterns with useCallback
- ✅ **Churn Score Display** - Shows risk levels and visual indicators

## Usage

### Basic Usage

```tsx
import { useChurn } from '@/hooks/useChurn';

function MyComponent() {
  const { churnScore, isLoading, error, predictChurn } = useChurn();

  const handlePredict = () => {
    predictChurn(123, 'bounce', { page: '/checkout' });
  };

  return (
    <div>
      <button onClick={handlePredict} disabled={isLoading}>
        {isLoading ? 'Predicting...' : 'Predict Churn'}
      </button>
      
      {error && <p className="error">{error}</p>}
      {churnScore !== null && (
        <p>Churn Score: {(churnScore * 100).toFixed(1)}%</p>
      )}
    </div>
  );
}
```

### Using the ChurnPredictionCard Component

```tsx
import { ChurnPredictionCard } from '@/components/ui/ChurnPredictionCard';

function Dashboard() {
  return (
    <ChurnPredictionCard
      userId={123}
      eventType="bounce"
      metadata={{ page: "/checkout", session_length: 0.5 }}
    />
  );
}
```

## API Reference

### useChurn Hook

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `churnScore` | `number \| null` | The churn prediction score (0-1) |
| `isLoading` | `boolean` | Whether a request is in progress |
| `error` | `string \| null` | Error message if request failed |
| `predictChurn` | `function` | Function to trigger churn prediction |
| `clearError` | `function` | Function to clear error state |

#### predictChurn Function

```tsx
predictChurn(
  userId: number,
  eventType: string,
  metadata?: Record<string, any>
): Promise<void>
```

**Parameters:**
- `userId` - The user ID to predict churn for
- `eventType` - The type of event (e.g., 'bounce', 'purchase', 'add_to_cart')
- `metadata` - Optional metadata object with additional event data

### ChurnPredictionCard Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `number` | `1` | User ID for prediction |
| `eventType` | `string` | `'page_view'` | Event type to analyze |
| `metadata` | `object` | `{}` | Additional event metadata |
| `className` | `string` | `''` | Additional CSS classes |

## API Endpoints

### POST /api/predict-churn

**Request Body:**
```json
{
  "user_id": 123,
  "event_type": "bounce",
  "timestamp": "2025-09-08T10:00:00Z",
  "metadata": {
    "page": "/checkout",
    "session_length": 0.5
  }
}
```

**Response:**
```json
{
  "churn_score": 0.9
}
```

## Event Types

The system supports various event types with different churn risk levels:

### High Risk Events
- `bounce` - User left page quickly (churn_score: 0.9)

### Low Risk Events
- `purchase` - User completed purchase (churn_score: 0.2)
- `add_to_cart` - User added items to cart (churn_score: 0.2)
- `product_view` - User viewed product (churn_score: 0.2)
- `page_view` - User viewed page (churn_score: 0.2)

## Risk Levels

The system categorizes churn scores into risk levels:

| Score Range | Risk Level | Color | Description |
|-------------|------------|-------|-------------|
| 0.8 - 1.0 | Critical | Red | Immediate intervention needed |
| 0.6 - 0.8 | High | Orange | Proactive engagement required |
| 0.4 - 0.6 | Medium | Yellow | Monitor closely |
| 0.0 - 0.4 | Low | Green | User appears engaged |

## Error Handling

The hook handles various error scenarios:

### Network Errors
- Connection timeouts
- Server unavailable
- Network connectivity issues

### API Errors
- Invalid request data
- Server-side processing errors
- Authentication failures

### Example Error Handling

```tsx
const { error, clearError } = useChurn();

if (error) {
  return (
    <div className="error-container">
      <p>Error: {error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

## Demo Page

Visit `/demo` to see the hook in action with different scenarios:

1. **High-Risk User (Bounce)** - Shows 90% churn risk
2. **Low-Risk User (Purchase)** - Shows 20% churn risk
3. **Medium-Risk User (Cart Abandonment)** - Shows 20% churn risk
4. **Engaged User (Product View)** - Shows 20% churn risk

## Integration with Flask API

The hook communicates with the Flask API through a Next.js API route:

```
Frontend → Next.js API Route → Flask API → Response
```

### Environment Configuration

Set the Flask API URL in your environment:

```bash
# .env.local
FLASK_API_URL=http://localhost:5000
```

## Best Practices

### 1. Error Handling
Always handle loading and error states in your UI:

```tsx
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (churnScore === null) return <NoDataMessage />;
```

### 2. User Experience
- Show loading indicators during requests
- Provide clear error messages
- Allow users to retry failed requests
- Display churn scores with visual indicators

### 3. Performance
- Use the hook at the component level where needed
- Avoid unnecessary re-renders with proper dependency arrays
- Consider caching predictions for the same user/event combinations

### 4. Accessibility
- Provide alt text for visual indicators
- Use semantic HTML elements
- Ensure color contrast meets WCAG guidelines
- Support keyboard navigation

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if Flask API is running on port 5000
   - Verify environment variables are set correctly
   - Check network connectivity

2. **CORS Errors**
   - Ensure Flask API has CORS enabled
   - Check if requests are going through Next.js API route

3. **TypeScript Errors**
   - Ensure all types are properly imported
   - Check if API response matches expected interface

### Debug Mode

Enable debug logging by adding console.log statements:

```tsx
const predictChurn = useCallback(async (userId, eventType, metadata) => {
  console.log('Predicting churn for:', { userId, eventType, metadata });
  // ... rest of the function
}, []);
```

## Future Enhancements

- [ ] Caching mechanism for repeated predictions
- [ ] Batch prediction support
- [ ] Real-time updates via WebSocket
- [ ] Historical prediction tracking
- [ ] A/B testing integration
- [ ] Advanced analytics and insights
