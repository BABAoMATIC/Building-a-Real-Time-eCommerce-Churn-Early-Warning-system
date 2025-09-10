# Frontend - Churn Early-Warning System

Next.js frontend application for the eCommerce Churn Early-Warning System with App Router, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Real-time Dashboard**: Live churn analytics and customer insights
- **Customer Management**: View and manage customer data with animations
- **Alert System**: Real-time notifications for high-risk customers
- **Interactive Charts**: Data visualization with Chart.js and React Chart.js 2
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced UX
- **Toast Notifications**: React Toastify for user feedback

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom color scheme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Chart.js with React Chart.js 2
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── customers/         # Customer management
│   ├── alerts/           # Alert management
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── charts/           # Chart components
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Form validations
├── types/                 # TypeScript definitions
│   ├── api.ts            # API types
│   ├── customer.ts       # Customer types
│   └── churn.ts          # Churn prediction types
├── styles/               # Additional styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── Dockerfile
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

### Dashboard
- Real-time churn metrics
- Customer risk indicators
- Alert notifications
- Trend visualizations

### Customer Management
- Customer list with filtering
- Individual customer profiles
- Churn prediction details
- Action recommendations

### Alert System
- Real-time alert notifications
- Alert management interface
- Priority-based filtering
- Resolution tracking

## API Integration

The frontend communicates with the Flask backend API:

- **Base URL**: `NEXT_PUBLIC_API_URL`
- **WebSocket**: `NEXT_PUBLIC_WS_URL`

### Key Endpoints

- `GET /api/customers` - Get customer list
- `GET /api/churn/predictions` - Get churn predictions
- `GET /api/alerts` - Get recent alerts
- `WebSocket /ws` - Real-time updates

## Styling and Animations

### Tailwind CSS
- Custom color palette for churn risk levels
- Responsive design utilities
- Component-based styling
- Custom animations and keyframes

### Framer Motion
- Page transitions
- Component animations
- Hover effects
- Loading states

### Custom Components
- Animated cards
- Interactive charts
- Form validations
- Toast notifications

## Dependencies

### Core Dependencies
- `next`: 15.5.2 - React framework
- `react`: 19.1.0 - UI library
- `react-dom`: 19.1.0 - React DOM
- `typescript`: ^5 - Type safety

### UI and Styling
- `tailwindcss`: ^4 - Utility-first CSS
- `framer-motion`: ^12.23.12 - Animation library
- `lucide-react`: Icons (via Next.js)
- `react-icons`: ^5.5.0 - Icon library

### Data and Charts
- `chart.js`: ^4.5.0 - Chart library
- `react-chartjs-2`: ^5.3.0 - React wrapper for Chart.js
- `axios`: ^1.11.0 - HTTP client

### Notifications
- `react-toastify`: ^11.0.5 - Toast notifications

## Docker

Build and run with Docker:

```bash
docker build -t churn-frontend .
docker run -p 3000:3000 churn-frontend
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Next.js best practices
- Implement responsive design
- Use semantic HTML

### Component Structure
```tsx
interface ComponentProps {
  // Define props with TypeScript
}

export default function Component({ prop }: ComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="tailwind-classes"
    >
      {/* Component content */}
    </motion.div>
  )
}
```

### State Management
- Use React hooks for local state
- Context API for global state
- React Query for server state
- Zustand for complex state management

## Performance Optimization

### Next.js Optimizations
- Image optimization
- Code splitting
- Static generation where possible
- Bundle analysis

### Animation Performance
- Use `transform` and `opacity` for animations
- Implement `will-change` for complex animations
- Debounce scroll events
- Lazy load heavy components

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Visual Regression Tests
```bash
npm run test:visual
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write responsive components with Tailwind CSS
4. Add animations with Framer Motion
5. Test components before submitting PRs
6. Update documentation

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript types
   - Verify import paths
   - Clear Next.js cache

2. **Animation Issues**
   - Check Framer Motion syntax
   - Verify CSS classes
   - Test on different devices

3. **API Connection Issues**
   - Verify environment variables
   - Check CORS settings
   - Test API endpoints

### Debug Mode
```bash
DEBUG=* npm run dev
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Chart.js](https://www.chartjs.org/docs/)
- [React Chart.js 2](https://react-chartjs-2.js.org/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)