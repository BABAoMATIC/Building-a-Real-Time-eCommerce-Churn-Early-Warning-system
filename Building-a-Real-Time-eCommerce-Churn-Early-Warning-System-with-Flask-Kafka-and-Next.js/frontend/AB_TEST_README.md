# A/B Test Feature

The A/B Test feature provides a comprehensive interface for managing and monitoring churn prevention A/B tests with animated transitions and real-time condition switching.

## Overview

The `/ab-test` page allows users to:
- Toggle between control and treatment conditions
- View detailed offer rules for each condition
- Monitor test metadata and success metrics
- Experience smooth Framer Motion animations during transitions

## Files Structure

```
frontend/
├── app/
│   ├── api/ab-test/
│   │   └── route.ts                 # API endpoint for A/B test management
│   └── ab-test/
│       └── page.tsx                 # Main A/B test page
├── components/ui/
│   ├── ABTestToggle.tsx             # Animated toggle component
│   └── OfferRuleCard.tsx            # Offer rule display component
├── hooks/
│   └── useABTest.ts                 # Custom hook for A/B test data
└── AB_TEST_README.md                # This documentation
```

## Features

### 🎯 Core Functionality

1. **Condition Toggle**
   - Animated toggle switch between control and treatment
   - Real-time API calls to update conditions
   - Loading states and error handling
   - Visual feedback for active condition

2. **Offer Rule Display**
   - Detailed cards showing condition and action rules
   - Color-coded active/inactive states
   - Smooth transitions between conditions
   - Responsive design for all screen sizes

3. **Test Management**
   - View test metadata and success metrics
   - Reset test functionality
   - Real-time condition updates
   - Comprehensive error handling

### 🎨 Animations & Transitions

1. **Framer Motion Integration**
   - Smooth page load animations
   - Toggle switch animations with spring physics
   - Card transitions with scale and opacity effects
   - Loading state animations

2. **Visual Feedback**
   - Pulsing indicators for active conditions
   - Hover effects on interactive elements
   - Smooth color transitions
   - Scale animations on user interactions

## Data Structure

### API Response Format
```typescript
interface ABTestData {
  current_condition: 'control' | 'treatment';
  conditions: {
    control: ABTestCondition;
    treatment: ABTestCondition;
  };
  test_metadata: {
    test_name: string;
    start_date: string;
    expected_duration: string;
    success_metrics: string[];
  };
}

interface ABTestCondition {
  id: string;
  name: string;
  type: 'control' | 'treatment';
  offer_rule: {
    condition: string;
    action: string;
    description: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Sample Data
```json
{
  "current_condition": "control",
  "conditions": {
    "control": {
      "id": "control-001",
      "name": "Control Group",
      "type": "control",
      "offer_rule": {
        "condition": "churn_score >= 0.7",
        "action": "send_email_reminder",
        "description": "Send standard email reminder to high-risk users"
      },
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2025-09-08T18:06:19.011Z"
    },
    "treatment": {
      "id": "treatment-001",
      "name": "Treatment Group",
      "type": "treatment",
      "offer_rule": {
        "condition": "churn_score >= 0.7",
        "action": "send_personalized_offer",
        "description": "Send personalized discount offer to high-risk users"
      },
      "is_active": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2025-09-08T18:06:19.011Z"
    }
  },
  "test_metadata": {
    "test_name": "Churn Prevention Offer Test",
    "start_date": "2024-01-01T00:00:00Z",
    "expected_duration": "30 days",
    "success_metrics": ["churn_rate", "engagement_rate", "conversion_rate"]
  }
}
```

## Components

### 1. ABTestPage (`/app/ab-test/page.tsx`)

Main page component that orchestrates the entire A/B test interface:

**Features:**
- Page header with test information and actions
- Responsive grid layout with toggle and offer rules
- Error state handling with retry functionality
- Loading states and transition management

**Key Elements:**
- Test metadata display
- Animated toggle component
- Offer rule cards with transitions
- Success metrics visualization

### 2. ABTestToggle (`/components/ui/ABTestToggle.tsx`)

Interactive toggle component for switching between conditions:

**Features:**
- Animated toggle switch with spring physics
- Loading spinner during transitions
- Visual status indicators
- Hover and tap animations

**Visual Elements:**
- Color-coded toggle (Blue: Control, Green: Treatment)
- Smooth sliding animation
- Pulsing active indicator
- Loading state overlay

### 3. OfferRuleCard (`/components/ui/OfferRuleCard.tsx`)

Card component displaying offer rule details:

**Features:**
- Active/inactive state styling
- Smooth scale and opacity transitions
- Color-coded borders and backgrounds
- Loading state overlay

**Visual Elements:**
- Active indicator bar at top
- Color-coded styling (Blue: Control, Green: Treatment)
- Hover effects and animations
- Responsive design

### 4. useABTest Hook (`/hooks/useABTest.ts`)

Custom React hook for managing A/B test data:

**Features:**
- Data fetching with error handling
- Condition update functionality
- Reset test capability
- Loading state management

**Methods:**
- `fetchABTestData()` - Initial data fetch
- `updateABTestCondition()` - Switch conditions
- `resetABTest()` - Reset to default state

### 5. API Endpoint (`/app/api/ab-test/route.ts`)

Next.js API route for A/B test management:

**Endpoints:**
- `GET /api/ab-test` - Fetch current test data
- `POST /api/ab-test` - Update test condition
- `PUT /api/ab-test` - Reset test to default

**Features:**
- Mock data generation (replace with real database)
- Proper HTTP status codes and error handling
- TypeScript interfaces for type safety

## Usage

### Accessing the A/B Test Page

1. **From Dashboard**: Click "A/B Test" button
2. **Direct URL**: Navigate to `/ab-test`
3. **Navigation**: Add to main navigation menu

### Managing the Test

1. **View Current Condition**: Toggle shows active condition
2. **Switch Conditions**: Click toggle to switch between control/treatment
3. **View Offer Rules**: Cards display detailed rules for each condition
4. **Reset Test**: Use reset button to return to default state

### Understanding the Interface

- **Control Group**: Standard email reminder (Blue theme)
- **Treatment Group**: Personalized discount offer (Green theme)
- **Active State**: Pulsing indicator and highlighted styling
- **Transitions**: Smooth animations during condition changes

## Styling and Design

### Color Scheme
- **Control**: Blue (`bg-blue-600`, `text-blue-900`, `border-blue-500`)
- **Treatment**: Green (`bg-green-600`, `text-green-900`, `border-green-500`)
- **Neutral**: Gray (`bg-gray-100`, `text-gray-600`)
- **Active States**: Enhanced opacity and shadows

### Responsive Design
- **Mobile**: Single column layout, stacked elements
- **Tablet**: Adjusted spacing and font sizes
- **Desktop**: Three-column layout with sidebar

### Animations
- **Spring Physics**: Natural toggle movement
- **Scale Effects**: Card hover and active states
- **Opacity Transitions**: Smooth state changes
- **Loading States**: Spinning indicators and overlays

## API Integration

### Endpoints

#### GET /api/ab-test
Fetch current A/B test data:
```bash
curl -X GET http://localhost:3000/api/ab-test
```

#### POST /api/ab-test
Update test condition:
```bash
curl -X POST http://localhost:3000/api/ab-test \
  -H "Content-Type: application/json" \
  -d '{"condition": "treatment"}'
```

#### PUT /api/ab-test
Reset test to default:
```bash
curl -X PUT http://localhost:3000/api/ab-test
```

### Error Handling
- Network failures with retry options
- Invalid condition values
- Server errors with user-friendly messages
- Loading states during API calls

## Performance Considerations

### Animation Performance
- Hardware-accelerated transforms
- Efficient re-renders with React.memo
- Optimized Framer Motion configurations
- Reduced motion for accessibility

### Data Management
- Efficient API calls with proper caching
- Loading states to prevent multiple requests
- Error boundaries to prevent crashes
- Optimized re-renders with React hooks

### Bundle Size
- Tree-shaking for unused Framer Motion features
- Dynamic imports for heavy components
- Optimized dependencies
- Code splitting for better performance

## Testing

### Unit Tests
```bash
# Test the useABTest hook
npm test useABTest.test.ts

# Test the ABTestToggle component
npm test ABTestToggle.test.tsx

# Test the OfferRuleCard component
npm test OfferRuleCard.test.tsx

# Test the API endpoint
npm test api/ab-test.test.ts
```

### Integration Tests
```bash
# Test the full A/B test page
npm test ab-test.test.tsx

# Test API integration
npm test ab-test-integration.test.ts
```

### Manual Testing
1. **Toggle Functionality**: Test condition switching
2. **Animations**: Verify smooth transitions
3. **Error Handling**: Test with network failures
4. **Responsive Design**: Test on different screen sizes
5. **Accessibility**: Test with screen readers

## Customization

### Adding New Conditions
1. Update the `ABTestCondition` interface
2. Add new condition types in the API
3. Update the toggle component
4. Add new styling and animations

### Modifying Animations
1. Adjust Framer Motion configurations
2. Change spring physics parameters
3. Modify transition durations
4. Add new animation effects

### Extending API Functionality
1. Add new endpoints in `route.ts`
2. Implement real database integration
3. Add data validation
4. Implement caching strategies

## Integration with Existing System

### Dashboard Integration
- Link from dashboard to A/B test page
- Share data between components
- Consistent styling and theming
- Unified error handling

### Database Integration
- Connect to real A/B test data
- Store test configurations
- Track condition changes
- Implement data persistence

### Analytics Integration
- Track test performance
- Monitor condition effectiveness
- Generate test reports
- Implement success metrics

## Future Enhancements

### Planned Features
1. **Historical Data**: Show test results over time
2. **Multiple Tests**: Manage multiple A/B tests
3. **Advanced Metrics**: Detailed performance analytics
4. **Automated Testing**: Scheduled condition changes
5. **User Segmentation**: Test different user groups

### Performance Improvements
1. **Caching**: Implement Redis caching for API responses
2. **Real-time Updates**: WebSocket integration for live data
3. **Optimistic Updates**: Immediate UI updates with rollback
4. **Background Sync**: Sync data in background

### Analytics Enhancements
1. **Statistical Significance**: Calculate test confidence
2. **Conversion Tracking**: Monitor user actions
3. **Cohort Analysis**: Analyze user behavior patterns
4. **Predictive Analytics**: Forecast test outcomes

## Troubleshooting

### Common Issues

1. **Toggle Not Working**
   - Check API endpoint availability
   - Verify network connectivity
   - Check browser console for errors
   - Ensure proper authentication

2. **Animations Not Smooth**
   - Check for CSS conflicts
   - Verify Framer Motion installation
   - Test on different browsers
   - Check for performance issues

3. **Data Not Updating**
   - Verify API response format
   - Check for JavaScript errors
   - Ensure proper state management
   - Test with different data sets

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
```

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

### Features
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

### Implementation
- Proper ARIA labels
- Focus management
- Color contrast compliance
- Semantic HTML structure

## Security Considerations

### API Security
- Input validation for condition values
- Rate limiting for API calls
- Authentication and authorization
- CORS configuration

### Data Protection
- Secure data transmission
- Input sanitization
- Error message security
- Audit logging

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Test with different data sets
4. Verify API endpoint functionality
5. Check network connectivity and authentication
