# Cohorts Feature

The Cohorts feature provides a comprehensive view of user distribution by churn risk levels through an interactive bar chart and detailed analytics.

## Overview

The `/cohorts` page displays user cohorts based on churn risk levels (Low, Medium, High) with:
- Interactive bar chart showing user distribution
- Real-time data fetching from `/api/cohorts` endpoint
- Responsive design with mobile support
- Comprehensive error handling and loading states

## Files Structure

```
frontend/
├── app/
│   ├── api/cohorts/
│   │   └── route.ts                 # API endpoint for cohort data
│   └── cohorts/
│       └── page.tsx                 # Main cohorts page
├── components/ui/
│   └── CohortBarChart.tsx           # Bar chart component
├── hooks/
│   └── useCohorts.ts                # Custom hook for data fetching
└── COHORTS_README.md                # This documentation
```

## Features

### 🎯 Core Functionality

1. **Bar Chart Visualization**
   - Horizontal bar chart showing user counts by risk level
   - Color-coded bars (Green: Low, Yellow: Medium, Red: High)
   - Percentage labels and user counts on each bar
   - Responsive design that adapts to different screen sizes

2. **Real-time Data**
   - Fetches data from `/api/cohorts` endpoint
   - Refresh functionality to get latest data
   - Loading states and error handling
   - Automatic data refresh on page load

3. **Interactive Elements**
   - Refresh button to reload data
   - Hover effects on chart elements
   - Smooth animations and transitions
   - Responsive sidebar with additional information

### 📊 Data Structure

#### API Response Format
```typescript
interface CohortsResponse {
  cohorts: CohortData[];
  total_users: number;
  last_updated: string;
  summary: {
    low_risk_users: number;
    medium_risk_users: number;
    high_risk_users: number;
    average_churn_risk: number;
  };
}

interface CohortData {
  risk_level: string;
  count: number;
  percentage: number;
}
```

#### Sample Data
```json
{
  "cohorts": [
    { "risk_level": "Low", "count": 1250, "percentage": 45.2 },
    { "risk_level": "Medium", "count": 890, "percentage": 32.1 },
    { "risk_level": "High", "count": 625, "percentage": 22.7 }
  ],
  "total_users": 2765,
  "last_updated": "2024-01-15T10:30:00Z",
  "summary": {
    "low_risk_users": 1250,
    "medium_risk_users": 890,
    "high_risk_users": 625,
    "average_churn_risk": 0.35
  }
}
```

## Components

### 1. CohortsPage (`/app/cohorts/page.tsx`)

Main page component that orchestrates the entire cohorts view:

**Features:**
- Page header with title and refresh button
- Error state handling with retry functionality
- Responsive grid layout (2/3 chart, 1/3 sidebar)
- Loading states and user feedback

**Key Elements:**
- Header with page title and description
- Refresh button with loading state
- Error display with retry option
- Main content grid with chart and sidebar

### 2. CohortBarChart (`/components/ui/CohortBarChart.tsx`)

Interactive bar chart component for displaying cohort data:

**Features:**
- Horizontal bar chart with color-coded risk levels
- User count and percentage labels
- Responsive design
- Loading and empty states
- Legend and summary statistics

**Visual Elements:**
- Color scheme: Green (Low), Yellow (Medium), Red (High)
- Animated bars with hover effects
- Percentage labels positioned on bars
- Summary cards below the chart

### 3. useCohorts Hook (`/hooks/useCohorts.ts`)

Custom React hook for managing cohort data:

**Features:**
- Data fetching with error handling
- Loading state management
- Refresh functionality
- TypeScript interfaces for type safety

**Methods:**
- `fetchCohorts()` - Initial data fetch
- `refreshCohorts()` - Refresh data via POST request
- Automatic fetch on component mount

### 4. API Endpoint (`/app/api/cohorts/route.ts`)

Next.js API route for serving cohort data:

**Endpoints:**
- `GET /api/cohorts` - Fetch current cohort data
- `POST /api/cohorts` - Refresh/regenerate cohort data

**Features:**
- Mock data generation (replace with real database queries)
- Error handling and proper HTTP status codes
- TypeScript interfaces for request/response

## Usage

### Accessing the Cohorts Page

1. **From Dashboard**: Click "View Cohorts" button
2. **Direct URL**: Navigate to `/cohorts`
3. **Navigation**: Add to main navigation menu

### Interacting with the Chart

1. **View Data**: Chart automatically loads on page visit
2. **Refresh**: Click "Refresh Data" button to get latest data
3. **Responsive**: Chart adapts to different screen sizes
4. **Hover**: Hover over bars to see detailed information

### Understanding the Data

- **Low Risk**: Users with churn score 0.0 - 0.3 (Green)
- **Medium Risk**: Users with churn score 0.3 - 0.7 (Yellow)
- **High Risk**: Users with churn score 0.7 - 1.0 (Red)

## Styling and Design

### Color Scheme
- **Low Risk**: Green (`bg-green-500`, `text-green-700`)
- **Medium Risk**: Yellow (`bg-yellow-500`, `text-yellow-700`)
- **High Risk**: Red (`bg-red-500`, `text-red-700`)
- **Neutral**: Gray (`bg-gray-500`, `text-gray-700`)

### Responsive Design
- **Mobile**: Single column layout, stacked elements
- **Tablet**: Adjusted spacing and font sizes
- **Desktop**: Two-column layout with sidebar

### Animations
- Smooth bar animations on data load
- Hover effects on interactive elements
- Loading spinners and transitions
- Framer Motion for page transitions

## Error Handling

### API Errors
- Network failures with retry options
- HTTP error status codes
- Invalid response data handling
- Timeout handling

### UI Errors
- Loading state management
- Empty data states
- Error boundary implementation
- User-friendly error messages

### Fallback States
- Loading spinners during data fetch
- Error messages with retry buttons
- Empty state when no data available
- Graceful degradation on API failures

## Performance Considerations

### Data Fetching
- Efficient API calls with proper caching
- Loading states to prevent multiple requests
- Error boundaries to prevent crashes
- Optimized re-renders with React hooks

### Rendering
- Memoized components to prevent unnecessary re-renders
- Efficient chart rendering with CSS
- Responsive images and assets
- Lazy loading for large datasets

### Bundle Size
- Tree-shaking for unused code
- Dynamic imports for heavy components
- Optimized dependencies
- Code splitting for better performance

## Testing

### Unit Tests
```bash
# Test the useCohorts hook
npm test useCohorts.test.ts

# Test the CohortBarChart component
npm test CohortBarChart.test.tsx

# Test the API endpoint
npm test api/cohorts.test.ts
```

### Integration Tests
```bash
# Test the full cohorts page
npm test cohorts.test.tsx

# Test API integration
npm test cohorts-integration.test.ts
```

### Manual Testing
1. **Data Loading**: Verify data loads on page visit
2. **Refresh**: Test refresh button functionality
3. **Error Handling**: Test with network failures
4. **Responsive**: Test on different screen sizes
5. **Accessibility**: Test with screen readers

## Customization

### Adding New Risk Levels
1. Update the `CohortData` interface
2. Add new colors in `CohortBarChart.tsx`
3. Update the API mock data
4. Add new risk level definitions

### Modifying Chart Appearance
1. Update color scheme in `getRiskColor()` function
2. Modify bar height calculations
3. Adjust spacing and typography
4. Add new visual elements

### Extending API Functionality
1. Add new endpoints in `route.ts`
2. Implement real database queries
3. Add data validation
4. Implement caching strategies

## Integration with Existing System

### Dashboard Integration
- Link from dashboard to cohorts page
- Share data between components
- Consistent styling and theming
- Unified error handling

### API Integration
- Connect to real churn prediction data
- Integrate with existing user management
- Use existing authentication
- Follow established API patterns

### Database Integration
- Query user churn scores from database
- Calculate cohort distributions
- Store historical cohort data
- Implement data aggregation

## Future Enhancements

### Planned Features
1. **Historical Data**: Show cohort trends over time
2. **Drill-down**: Click on bars to see individual users
3. **Export**: Download cohort data as CSV/PDF
4. **Filters**: Filter by date range, user segments
5. **Real-time Updates**: WebSocket integration for live data

### Performance Improvements
1. **Caching**: Implement Redis caching for API responses
2. **Pagination**: Handle large datasets efficiently
3. **Virtualization**: Virtual scrolling for large lists
4. **CDN**: Serve static assets from CDN

### Analytics Enhancements
1. **Predictions**: Show predicted cohort changes
2. **Comparisons**: Compare cohorts across time periods
3. **Segments**: Add user segmentation capabilities
4. **Alerts**: Notify on significant cohort changes

## Troubleshooting

### Common Issues

1. **Data Not Loading**
   - Check API endpoint availability
   - Verify network connectivity
   - Check browser console for errors
   - Ensure proper authentication

2. **Chart Not Displaying**
   - Verify data format matches expected structure
   - Check for JavaScript errors
   - Ensure CSS is loading properly
   - Test with different browsers

3. **Performance Issues**
   - Check for memory leaks in React components
   - Optimize API response size
   - Implement proper caching
   - Use React DevTools for profiling

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

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Test with different data sets
4. Verify API endpoint functionality
5. Check network connectivity and authentication
