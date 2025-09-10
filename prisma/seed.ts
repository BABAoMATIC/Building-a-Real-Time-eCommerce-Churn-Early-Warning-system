import { PrismaClient, RiskLevel, OrderStatus, EventType, AlertType, Priority, AlertStatus, TicketCategory, TicketStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create model version
  const modelVersion = await prisma.modelVersion.create({
    data: {
      version: '1.0.0',
      modelPath: './models/churn_model.pkl',
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.89,
      f1Score: 0.87,
      features: [
        'total_orders', 'total_spent', 'avg_order_value', 'days_since_last_order',
        'support_tickets', 'product_returns', 'email_engagement', 'login_frequency',
        'payment_failures', 'discount_usage', 'loyalty_points', 'account_age_days'
      ],
      trainingDataSize: 10000,
      isActive: true
    }
  })

  console.log(`✅ Created model version: ${modelVersion.version}`)

  // Create customers with varying churn risk
  const customers = []
  for (let i = 0; i < 100; i++) {
    const isHighRisk = Math.random() < 0.2 // 20% high risk customers
    const churnProbability = isHighRisk ? 
      faker.number.float({ min: 0.6, max: 0.95 }) : 
      faker.number.float({ min: 0.1, max: 0.5 })

    const riskLevel = churnProbability > 0.8 ? RiskLevel.CRITICAL :
                     churnProbability > 0.6 ? RiskLevel.HIGH :
                     churnProbability > 0.4 ? RiskLevel.MEDIUM : RiskLevel.LOW

    const customer = await prisma.customer.create({
      data: {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        },
        totalOrders: faker.number.int({ min: 0, max: 50 }),
        totalSpent: faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }),
        avgOrderValue: faker.number.float({ min: 20, max: 200, fractionDigits: 2 }),
        daysSinceLastOrder: faker.number.int({ min: 0, max: 90 }),
        supportTickets: faker.number.int({ min: 0, max: 10 }),
        productReturns: faker.number.int({ min: 0, max: 5 }),
        emailEngagement: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        loginFrequency: faker.number.int({ min: 0, max: 30 }),
        paymentFailures: faker.number.int({ min: 0, max: 3 }),
        discountUsage: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
        accountAgeDays: faker.number.int({ min: 30, max: 1000 }),
        churnProbability,
        riskLevel,
        lastPredictionAt: faker.date.recent({ days: 7 }),
        isActive: Math.random() > 0.1 // 90% active customers
      }
    })
    customers.push(customer)
  }

  console.log(`✅ Created ${customers.length} customers`)

  // Create orders for customers
  let orderCount = 0
  for (const customer of customers) {
    const numOrders = Math.min(customer.totalOrders, 10) // Limit orders per customer
    
    for (let i = 0; i < numOrders; i++) {
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderNumber: `ORD-${String(orderCount + 1).padStart(6, '0')}`,
          status: faker.helpers.arrayElement(Object.values(OrderStatus)),
          totalAmount: faker.number.float({ min: 20, max: 500, fractionDigits: 2 }),
          currency: 'USD',
          paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'apple_pay', 'google_pay']),
          shippingAddress: customer.address,
          billingAddress: customer.address,
          items: [
            {
              productId: faker.string.uuid(),
              productName: faker.commerce.productName(),
              quantity: faker.number.int({ min: 1, max: 5 }),
              price: faker.number.float({ min: 10, max: 100, fractionDigits: 2 })
            }
          ],
          notes: faker.lorem.sentence(),
          createdAt: faker.date.between({ 
            from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 
            to: new Date() 
          }),
          shippedAt: Math.random() > 0.3 ? faker.date.recent({ days: 30 }) : null,
          deliveredAt: Math.random() > 0.5 ? faker.date.recent({ days: 15 }) : null
        }
      })
      orderCount++
    }
  }

  console.log(`✅ Created ${orderCount} orders`)

  // Create customer events
  let eventCount = 0
  for (const customer of customers) {
    const numEvents = faker.number.int({ min: 5, max: 50 })
    
    for (let i = 0; i < numEvents; i++) {
      const eventType = faker.helpers.arrayElement(Object.values(EventType))
      const eventData = generateEventData(eventType)
      
      await prisma.customerEvent.create({
        data: {
          customerId: customer.id,
          eventType,
          eventData,
          sessionId: faker.string.uuid(),
          userAgent: faker.internet.userAgent(),
          ipAddress: faker.internet.ip(),
          timestamp: faker.date.between({ 
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
            to: new Date() 
          })
        }
      })
      eventCount++
    }
  }

  console.log(`✅ Created ${eventCount} customer events`)

  // Create churn predictions
  for (const customer of customers) {
    if (customer.churnProbability) {
      await prisma.churnPrediction.create({
        data: {
          customerId: customer.id,
          churnProbability: customer.churnProbability,
          riskLevel: customer.riskLevel!,
          features: {
            total_orders: customer.totalOrders,
            total_spent: customer.totalSpent,
            avg_order_value: customer.avgOrderValue,
            days_since_last_order: customer.daysSinceLastOrder,
            support_tickets: customer.supportTickets,
            product_returns: customer.productReturns,
            email_engagement: customer.emailEngagement,
            login_frequency: customer.loginFrequency,
            payment_failures: customer.paymentFailures,
            discount_usage: customer.discountUsage,
            loyalty_points: customer.loyaltyPoints,
            account_age_days: customer.accountAgeDays
          },
          recommendations: generateRecommendations(customer.churnProbability),
          modelVersion: modelVersion.version,
          confidence: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 })
        }
      })
    }
  }

  console.log(`✅ Created churn predictions for ${customers.length} customers`)

  // Create alerts for high-risk customers
  const highRiskCustomers = customers.filter(c => c.riskLevel === RiskLevel.HIGH || c.riskLevel === RiskLevel.CRITICAL)
  let alertCount = 0

  for (const customer of highRiskCustomers) {
    const numAlerts = faker.number.int({ min: 1, max: 3 })
    
    for (let i = 0; i < numAlerts; i++) {
      const alertType = faker.helpers.arrayElement(Object.values(AlertType))
      const priority = customer.riskLevel === RiskLevel.CRITICAL ? Priority.URGENT : Priority.HIGH
      
      await prisma.alert.create({
        data: {
          customerId: customer.id,
          alertType,
          priority,
          title: generateAlertTitle(alertType),
          message: generateAlertMessage(alertType, customer),
          eventData: generateAlertEventData(alertType),
          status: faker.helpers.arrayElement(Object.values(AlertStatus)),
          acknowledgedAt: Math.random() > 0.3 ? faker.date.recent({ days: 5 }) : null,
          resolvedAt: Math.random() > 0.6 ? faker.date.recent({ days: 2 }) : null
        }
      })
      alertCount++
    }
  }

  console.log(`✅ Created ${alertCount} alerts`)

  // Create support tickets
  let ticketCount = 0
  for (const customer of customers) {
    const numTickets = Math.min(customer.supportTickets, 5)
    
    for (let i = 0; i < numTickets; i++) {
      await prisma.supportTicket.create({
        data: {
          customerId: customer.id,
          ticketNumber: `TKT-${String(ticketCount + 1).padStart(6, '0')}`,
          subject: faker.lorem.sentence({ min: 5, max: 10 }),
          description: faker.lorem.paragraphs(2),
          category: faker.helpers.arrayElement(Object.values(TicketCategory)),
          priority: faker.helpers.arrayElement(Object.values(Priority)),
          status: faker.helpers.arrayElement(Object.values(TicketStatus)),
          assignedTo: faker.person.fullName(),
          resolution: Math.random() > 0.4 ? faker.lorem.paragraph() : null,
          createdAt: faker.date.between({ 
            from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), 
            to: new Date() 
          }),
          resolvedAt: Math.random() > 0.5 ? faker.date.recent({ days: 10 }) : null
        }
      })
      ticketCount++
    }
  }

  console.log(`✅ Created ${ticketCount} support tickets`)

  // Create system metrics
  const metrics = [
    { name: 'total_customers', value: customers.length, unit: 'count' },
    { name: 'churn_rate', value: 12.5, unit: 'percentage' },
    { name: 'high_risk_customers', value: highRiskCustomers.length, unit: 'count' },
    { name: 'revenue_at_risk', value: 234500, unit: 'USD' },
    { name: 'model_accuracy', value: 87.2, unit: 'percentage' },
    { name: 'prediction_confidence', value: 84.5, unit: 'percentage' }
  ]

  for (const metric of metrics) {
    await prisma.systemMetrics.create({
      data: {
        metricName: metric.name,
        metricValue: metric.value,
        metricUnit: metric.unit,
        tags: { source: 'seeding' }
      }
    })
  }

  console.log(`✅ Created ${metrics.length} system metrics`)

  console.log('🎉 Database seeding completed successfully!')
}

function generateEventData(eventType: EventType) {
  switch (eventType) {
    case EventType.ORDER_PLACED:
      return {
        orderId: faker.string.uuid(),
        orderValue: faker.number.float({ min: 20, max: 500, fractionDigits: 2 }),
        itemsCount: faker.number.int({ min: 1, max: 10 }),
        paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'apple_pay'])
      }
    case EventType.PAYMENT_FAILED:
      return {
        orderId: faker.string.uuid(),
        failureReason: faker.helpers.arrayElement(['insufficient_funds', 'expired_card', 'declined']),
        retryCount: faker.number.int({ min: 1, max: 3 })
      }
    case EventType.SUPPORT_TICKET_CREATED:
      return {
        ticketId: faker.string.uuid(),
        category: faker.helpers.arrayElement(['billing', 'shipping', 'product', 'technical']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent'])
      }
    case EventType.EMAIL_OPENED:
    case EventType.EMAIL_CLICKED:
      return {
        emailId: faker.string.uuid(),
        campaignId: faker.string.uuid(),
        subject: faker.lorem.sentence({ min: 3, max: 8 }),
        template: faker.helpers.arrayElement(['welcome', 'promotional', 'transactional'])
      }
    case EventType.LOGIN:
      return {
        loginMethod: faker.helpers.arrayElement(['email', 'social_google', 'social_facebook']),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        success: faker.datatype.boolean({ probability: 0.9 })
      }
    case EventType.PRODUCT_VIEWED:
      return {
        productId: faker.string.uuid(),
        category: faker.helpers.arrayElement(['electronics', 'clothing', 'books', 'home']),
        price: faker.number.float({ min: 10, max: 200, fractionDigits: 2 }),
        viewDuration: faker.number.int({ min: 5, max: 300 })
      }
    default:
      return {}
  }
}

function generateRecommendations(churnProbability: number): string[] {
  const recommendations = []
  
  if (churnProbability > 0.8) {
    recommendations.push('Offer exclusive discount or loyalty program')
    recommendations.push('Assign dedicated customer success manager')
  }
  
  if (churnProbability > 0.6) {
    recommendations.push('Send re-engagement email campaign')
    recommendations.push('Improve email marketing personalization')
  }
  
  if (churnProbability > 0.4) {
    recommendations.push('Update payment method and offer assistance')
    recommendations.push('Provide product recommendations')
  }
  
  return recommendations
}

function generateAlertTitle(alertType: AlertType): string {
  switch (alertType) {
    case AlertType.CHURN_RISK:
      return 'High Churn Risk Detected'
    case AlertType.PAYMENT_FAILURE:
      return 'Payment Processing Failed'
    case AlertType.SUPPORT_ESCALATION:
      return 'Support Ticket Escalation'
    case AlertType.UNUSUAL_ACTIVITY:
      return 'Unusual Customer Activity'
    case AlertType.SYSTEM_ERROR:
      return 'System Error Detected'
    case AlertType.MAINTENANCE:
      return 'Scheduled Maintenance'
    default:
      return 'System Alert'
  }
}

function generateAlertMessage(alertType: AlertType, customer: any): string {
  switch (alertType) {
    case AlertType.CHURN_RISK:
      return `Customer ${customer.firstName} ${customer.lastName} shows high churn risk (${(customer.churnProbability * 100).toFixed(1)}%). Immediate action recommended.`
    case AlertType.PAYMENT_FAILURE:
      return `Payment failure detected for customer ${customer.firstName} ${customer.lastName}. Please follow up to resolve payment issues.`
    case AlertType.SUPPORT_ESCALATION:
      return `Support ticket for customer ${customer.firstName} ${customer.lastName} requires escalation.`
    case AlertType.UNUSUAL_ACTIVITY:
      return `Unusual activity pattern detected for customer ${customer.firstName} ${customer.lastName}.`
    default:
      return `Alert for customer ${customer.firstName} ${customer.lastName}.`
  }
}

function generateAlertEventData(alertType: AlertType) {
  return {
    alertType,
    timestamp: new Date().toISOString(),
    source: 'churn_prediction_system'
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
