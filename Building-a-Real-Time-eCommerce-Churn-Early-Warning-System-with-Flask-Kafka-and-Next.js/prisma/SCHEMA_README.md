# Prisma Schema for Churn Prediction System

This directory contains Prisma schemas for the churn prediction system with simplified models.

## Files

- **`schema.prisma`** - Complete schema with all models (existing + new)
- **`schema_new.prisma`** - Simplified schema with only the requested models
- **`migrate.sql`** - SQL migration script for manual database setup
- **`SCHEMA_README.md`** - This documentation

## Models

### User Model
```prisma
model User {
  id         Int      @id @default(autoincrement())
  email      String   @unique
  createdAt  DateTime @default(now())
  churnRisk  Float?
  cohort     String?
  events     Event[]

  @@map("users")
}
```

**Fields:**
- `id`: Auto-incrementing primary key
- `email`: Unique email address
- `createdAt`: User creation timestamp
- `churnRisk`: Churn probability score (0-1)
- `cohort`: User cohort identifier (e.g., "Q1-2024")
- `events`: One-to-many relationship with Event model

### Event Model
```prisma
model Event {
  id        Int      @id @default(autoincrement())
  userId    Int
  type      String
  metadata  Json?
  timestamp DateTime
  User      User     @relation(fields: [userId], references: [id])

  @@map("events")
}
```

**Fields:**
- `id`: Auto-incrementing primary key
- `userId`: Foreign key to User model
- `type`: Event type (e.g., "page_view", "bounce", "purchase")
- `metadata`: JSON data with event details
- `timestamp`: When the event occurred
- `User`: Many-to-one relationship with User model

### OfferRule Model
```prisma
model OfferRule {
  id        Int      @id @default(autoincrement())
  condition String
  action    String

  @@map("offer_rules")
}
```

**Fields:**
- `id`: Auto-incrementing primary key
- `condition`: Rule condition (e.g., "churnRisk > 0.7")
- `action`: Action to take (e.g., "Send 20% discount offer")

## Database Setup

### Option 1: Using Prisma CLI

1. **Install Prisma CLI:**
   ```bash
   npm install -g prisma
   ```

2. **Set up environment:**
   ```bash
   # Create .env file
   echo "DATABASE_URL=mysql://root:password@localhost:3306/churn_db" > .env
   ```

3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Run migrations:**
   ```bash
   npx prisma db push
   ```

### Option 2: Manual SQL Setup

1. **Create database:**
   ```sql
   CREATE DATABASE churn_db;
   USE churn_db;
   ```

2. **Run migration script:**
   ```bash
   mysql -u root -p churn_db < migrate.sql
   ```

## Usage Examples

### Using Prisma Client (Node.js/TypeScript)

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    churnRisk: 0.3,
    cohort: 'Q1-2024'
  }
})

// Create an event
const event = await prisma.event.create({
  data: {
    userId: user.id,
    type: 'page_view',
    metadata: {
      page: '/products',
      session_length: 5.2
    },
    timestamp: new Date()
  }
})

// Query users with high churn risk
const highRiskUsers = await prisma.user.findMany({
  where: {
    churnRisk: {
      gt: 0.7
    }
  },
  include: {
    events: true
  }
})

// Create an offer rule
const rule = await prisma.offerRule.create({
  data: {
    condition: 'churnRisk > 0.7',
    action: 'Send 20% discount offer'
  }
})
```

### Using Raw SQL

```sql
-- Insert a user
INSERT INTO users (email, churnRisk, cohort) 
VALUES ('user@example.com', 0.3, 'Q1-2024');

-- Insert an event
INSERT INTO events (userId, type, metadata, timestamp) 
VALUES (1, 'page_view', '{"page": "/products", "session_length": 5.2}', NOW());

-- Query high-risk users
SELECT u.*, COUNT(e.id) as event_count
FROM users u
LEFT JOIN events e ON u.id = e.userId
WHERE u.churnRisk > 0.7
GROUP BY u.id;

-- Get events for a specific user
SELECT * FROM events 
WHERE userId = 1 
ORDER BY timestamp DESC;
```

## Integration with Kafka Consumer

The schema is designed to work with the Kafka consumer:

```python
# Example: Save churn prediction from Kafka consumer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Update user's churn risk
def update_user_churn_risk(user_id, churn_score):
    engine = create_engine('mysql+pymysql://root:password@localhost:3306/churn_db')
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Update user's churn risk
    session.execute(
        "UPDATE users SET churnRisk = :churn_score WHERE id = :user_id",
        {"churn_score": churn_score, "user_id": user_id}
    )
    
    # Insert event
    session.execute(
        "INSERT INTO events (userId, type, metadata, timestamp) VALUES (:user_id, :event_type, :metadata, :timestamp)",
        {
            "user_id": user_id,
            "event_type": "churn_prediction",
            "metadata": json.dumps({"churn_score": churn_score}),
            "timestamp": datetime.now()
        }
    )
    
    session.commit()
    session.close()
```

## Sample Data

The migration script includes sample data:

- **5 users** with different churn risk levels
- **7 events** of various types
- **5 offer rules** for different conditions

## Indexes

The schema includes optimized indexes:

- `users.email` - Unique index for email lookups
- `users.cohort` - Index for cohort-based queries
- `users.churnRisk` - Index for risk-based filtering
- `events.userId` - Index for user event queries
- `events.type` - Index for event type filtering
- `events.timestamp` - Index for time-based queries

## Relationships

- **User → Events**: One-to-many (one user can have many events)
- **Event → User**: Many-to-one (many events belong to one user)
- **OfferRule**: Standalone model (no relationships)

## JSON Metadata

The `metadata` field in the Event model can store flexible data:

```json
{
  "page": "/products",
  "session_length": 5.2,
  "product_id": "PROD-001",
  "price": 29.99,
  "device": "mobile",
  "location": "US"
}
```

## Best Practices

1. **Use transactions** for related operations
2. **Index frequently queried fields**
3. **Use JSON fields** for flexible metadata
4. **Set appropriate foreign key constraints**
5. **Use prepared statements** to prevent SQL injection
6. **Monitor query performance** with slow query logs

## Troubleshooting

### Common Issues

1. **Connection refused**: Check MySQL is running and credentials are correct
2. **Table doesn't exist**: Run the migration script
3. **Foreign key constraint**: Ensure referenced records exist
4. **JSON parsing error**: Validate JSON format in metadata field

### Performance Tips

1. **Use indexes** for frequently queried columns
2. **Limit result sets** with LIMIT clauses
3. **Use prepared statements** for repeated queries
4. **Monitor slow queries** and optimize as needed
