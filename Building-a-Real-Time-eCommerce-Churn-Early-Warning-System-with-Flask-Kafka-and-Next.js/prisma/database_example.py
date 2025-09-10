#!/usr/bin/env python3
"""
Database Example Script

This script demonstrates how to use the Prisma schema with SQLAlchemy
for the churn prediction system.
"""

import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SQLAlchemy setup
Base = declarative_base()

class User(Base):
    """User model matching Prisma schema"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    createdAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    churnRisk = Column(Float, nullable=True)
    cohort = Column(String(100), nullable=True)
    
    # Relationship
    events = relationship("Event", back_populates="user")

class Event(Base):
    """Event model matching Prisma schema"""
    __tablename__ = 'events'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey('users.id'), nullable=False)
    type = Column(String(100), nullable=False)
    metadata = Column(Text, nullable=True)  # JSON as text
    timestamp = Column(DateTime, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="events")

class OfferRule(Base):
    """OfferRule model matching Prisma schema"""
    __tablename__ = 'offer_rules'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    condition = Column(Text, nullable=False)
    action = Column(Text, nullable=False)

class DatabaseManager:
    """Database manager for churn prediction system"""
    
    def __init__(self, database_url=None):
        self.database_url = database_url or os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/churn_db')
        self.engine = create_engine(self.database_url, echo=False)
        self.Session = sessionmaker(bind=self.engine)
        
        # Create tables
        Base.metadata.create_all(self.engine)
    
    def create_user(self, email, churn_risk=None, cohort=None):
        """Create a new user"""
        session = self.Session()
        try:
            user = User(
                email=email,
                churnRisk=churn_risk,
                cohort=cohort
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def create_event(self, user_id, event_type, metadata=None, timestamp=None):
        """Create a new event"""
        session = self.Session()
        try:
            event = Event(
                userId=user_id,
                type=event_type,
                metadata=json.dumps(metadata) if metadata else None,
                timestamp=timestamp or datetime.utcnow()
            )
            session.add(event)
            session.commit()
            session.refresh(event)
            return event
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def create_offer_rule(self, condition, action):
        """Create a new offer rule"""
        session = self.Session()
        try:
            rule = OfferRule(
                condition=condition,
                action=action
            )
            session.add(rule)
            session.commit()
            session.refresh(rule)
            return rule
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_user_by_email(self, email):
        """Get user by email"""
        session = self.Session()
        try:
            return session.query(User).filter(User.email == email).first()
        finally:
            session.close()
    
    def get_high_risk_users(self, threshold=0.7):
        """Get users with churn risk above threshold"""
        session = self.Session()
        try:
            return session.query(User).filter(User.churnRisk > threshold).all()
        finally:
            session.close()
    
    def get_user_events(self, user_id, limit=10):
        """Get recent events for a user"""
        session = self.Session()
        try:
            return session.query(Event).filter(
                Event.userId == user_id
            ).order_by(Event.timestamp.desc()).limit(limit).all()
        finally:
            session.close()
    
    def update_user_churn_risk(self, user_id, churn_risk):
        """Update user's churn risk"""
        session = self.Session()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if user:
                user.churnRisk = churn_risk
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_offer_rules(self):
        """Get all offer rules"""
        session = self.Session()
        try:
            return session.query(OfferRule).all()
        finally:
            session.close()

def main():
    """Demonstrate database operations"""
    print("Churn Prediction Database Example")
    print("=" * 40)
    
    # Initialize database manager
    db = DatabaseManager()
    
    try:
        # Create a user
        print("Creating user...")
        user = db.create_user(
            email="test@example.com",
            churn_risk=0.3,
            cohort="Q1-2024"
        )
        print(f"✅ Created user: {user.email} (ID: {user.id})")
        
        # Create events
        print("\nCreating events...")
        events_data = [
            ("page_view", {"page": "/products", "session_length": 5.2}),
            ("add_to_cart", {"product_id": "PROD-001", "price": 29.99}),
            ("bounce", {"page": "/checkout", "session_length": 0.5})
        ]
        
        for event_type, metadata in events_data:
            event = db.create_event(user.id, event_type, metadata)
            print(f"✅ Created event: {event.type} at {event.timestamp}")
        
        # Update churn risk
        print(f"\nUpdating churn risk...")
        db.update_user_churn_risk(user.id, 0.8)
        print(f"✅ Updated churn risk to 0.8")
        
        # Create offer rule
        print(f"\nCreating offer rule...")
        rule = db.create_offer_rule(
            condition="churnRisk > 0.7",
            action="Send 20% discount offer"
        )
        print(f"✅ Created rule: {rule.condition} -> {rule.action}")
        
        # Query high-risk users
        print(f"\nQuerying high-risk users...")
        high_risk_users = db.get_high_risk_users(0.7)
        print(f"✅ Found {len(high_risk_users)} high-risk users")
        
        # Get user events
        print(f"\nGetting user events...")
        user_events = db.get_user_events(user.id)
        print(f"✅ Found {len(user_events)} events for user {user.id}")
        
        # Get offer rules
        print(f"\nGetting offer rules...")
        rules = db.get_offer_rules()
        print(f"✅ Found {len(rules)} offer rules")
        
        print(f"\n✅ Database operations completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
