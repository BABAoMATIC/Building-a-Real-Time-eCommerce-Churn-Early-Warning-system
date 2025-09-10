# Prisma Database Schema

Database schema and management for the eCommerce Churn Early-Warning System using Prisma ORM with MySQL.

## Features

- **Customer Management**: Comprehensive customer profiles with behavior metrics
- **Order Tracking**: Complete order lifecycle management
- **Event Logging**: Detailed customer behavior event tracking
- **Churn Predictions**: ML model predictions and recommendations
- **Alert System**: Real-time alerts and notifications
- **Support Tickets**: Customer support ticket management
- **Model Versioning**: ML model version tracking and metrics

## Database Schema

### Core Models

#### Customer
- Personal information and contact details
- Behavioral metrics (orders, engagement, support tickets)
- Churn prediction data (probability, risk level)
- Activity tracking and account status

#### Order
- Order details and status tracking
- Payment and shipping information
- Order items and pricing
- Delivery tracking

#### CustomerEvent
- Real-time customer behavior events
- Event types: orders, payments, support, engagement
- Session and device tracking
- Flexible event data storage

#### ChurnPrediction
- ML model predictions
- Risk level classification
- Feature importance tracking
- Model version and confidence scores

#### Alert
- System and customer alerts
- Priority and status management
- Alert acknowledgment and resolution
- Event data correlation

#### SupportTicket
- Customer support management
- Ticket categorization and prioritization
- Assignment and resolution tracking
- Customer communication history

### Supporting Models

#### ModelVersion
- ML model versioning
- Performance metrics (accuracy, precision, recall)
- Feature definitions
- Training data information

#### SystemMetrics
- System performance monitoring
- Business metrics tracking
- Time-series data storage
- Tagged metric organization

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

3. Generate Prisma client:
   ```bash
   npm run generate
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Seed the database (optional):
   ```bash
   npm run db:seed
   ```

### Environment Variables

```env
DATABASE_URL="mysql://username:password@localhost:3306/churn_db"
```

## Available Scripts

- `npm run generate` - Generate Prisma client
- `npm run migrate` - Run database migrations
- `npm run migrate:deploy` - Deploy migrations to production
- `npm run migrate:reset` - Reset database and run migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull database schema
- `npm run format` - Format Prisma schema

## Database Operations

### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Apply migrations to production
npx prisma migrate deploy
```

### Seeding Database

The seed script creates:
- 100 sample customers with varying churn risk
- Orders and customer events
- Churn predictions and alerts
- Support tickets and system metrics

```bash
npm run db:seed
```

### Database Studio

Open Prisma Studio to view and edit data:

```bash
npm run db:studio
```

## Schema Design

### Customer Behavior Metrics

The schema tracks comprehensive customer behavior:

- **Order Metrics**: Total orders, spending, average order value
- **Engagement**: Email engagement, login frequency
- **Support**: Support tickets, product returns
- **Financial**: Payment failures, discount usage
- **Loyalty**: Loyalty points, account age

### Event Types

Customer events are categorized into:

- **Order Events**: Order placement, cancellation, refunds
- **Engagement Events**: Email interactions, logins, product views
- **Support Events**: Ticket creation, escalations
- **Payment Events**: Payment failures, method updates
- **Account Events**: Profile updates, password changes

### Risk Levels

Churn risk is classified as:

- **LOW**: 0-40% churn probability
- **MEDIUM**: 40-60% churn probability  
- **HIGH**: 60-80% churn probability
- **CRITICAL**: 80-100% churn probability

## Data Relationships

### Customer Relationships
- One-to-many with Orders
- One-to-many with CustomerEvents
- One-to-many with ChurnPredictions
- One-to-many with Alerts
- One-to-many with SupportTickets

### Event Relationships
- CustomerEvents can reference Orders
- Events trigger ChurnPredictions
- Events generate Alerts

## Performance Considerations

### Indexing
- Primary keys on all tables
- Unique constraints on email, order numbers
- Composite indexes on frequently queried fields

### Data Retention
- Customer events: 90 days (configurable)
- Old predictions: 30 days
- Resolved alerts: 7 days
- System metrics: 1 year

### Query Optimization
- Use Prisma's `select` to limit fields
- Implement pagination for large datasets
- Use database views for complex queries
- Cache frequently accessed data

## Security

### Data Protection
- Sensitive data encryption
- PII data masking in logs
- Access control and permissions
- Audit trail for data changes

### Database Security
- Connection encryption (SSL)
- Parameterized queries (Prisma handles this)
- Input validation and sanitization
- Regular security updates

## Monitoring

### Database Health
- Connection pool monitoring
- Query performance tracking
- Slow query identification
- Resource usage monitoring

### Business Metrics
- Customer churn rates
- Prediction accuracy
- Alert response times
- Support ticket resolution

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Cross-region backup replication
- Backup verification and testing

### Disaster Recovery
- RTO: 4 hours
- RPO: 1 hour
- Automated failover procedures
- Data integrity verification

## Contributing

### Schema Changes
1. Update `schema.prisma`
2. Create migration: `npx prisma migrate dev`
3. Update seed data if needed
4. Test with sample data
5. Update documentation

### Best Practices
- Use descriptive field names
- Add comments to complex fields
- Maintain backward compatibility
- Test migrations thoroughly
- Document breaking changes

## Troubleshooting

### Common Issues

1. **Migration Failures**
   - Check database connection
   - Verify schema syntax
   - Review migration files

2. **Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Confirm database permissions

3. **Performance Issues**
   - Analyze slow queries
   - Add appropriate indexes
   - Optimize data access patterns

### Debug Mode
```bash
DEBUG=prisma:* npm run migrate
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Database Design Best Practices](https://www.prisma.io/dataguide/mysql/intro)
- [Prisma Studio](https://www.prisma.io/studio)
