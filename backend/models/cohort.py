"""
Database model for user cohorts
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class Cohort(Base):
    __tablename__ = 'cohorts'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Cohort criteria
    engagement_level = Column(String(50), nullable=True)  # 'high', 'medium', 'low'
    churn_risk_level = Column(String(50), nullable=True)  # 'high', 'medium', 'low'
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    min_total_purchases = Column(Integer, nullable=True)
    max_total_purchases = Column(Integer, nullable=True)
    min_avg_order_value = Column(Float, nullable=True)
    max_avg_order_value = Column(Float, nullable=True)
    min_days_since_last_purchase = Column(Integer, nullable=True)
    max_days_since_last_purchase = Column(Integer, nullable=True)
    min_email_opens = Column(Integer, nullable=True)
    max_email_opens = Column(Integer, nullable=True)
    min_website_visits = Column(Integer, nullable=True)
    max_website_visits = Column(Integer, nullable=True)
    
    # Cohort statistics (calculated)
    total_customers = Column(Integer, default=0)
    avg_churn_score = Column(Float, default=0.0)
    high_risk_count = Column(Integer, default=0)
    medium_risk_count = Column(Integer, default=0)
    low_risk_count = Column(Integer, default=0)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    last_calculated = Column(DateTime, nullable=True)

    # Relationship to user
    user = relationship("User", back_populates="cohorts")

    def to_dict(self):
        """Convert cohort to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "criteria": {
                "engagement_level": self.engagement_level,
                "churn_risk_level": self.churn_risk_level,
                "age_range": {
                    "min": self.min_age,
                    "max": self.max_age
                },
                "total_purchases_range": {
                    "min": self.min_total_purchases,
                    "max": self.max_total_purchases
                },
                "avg_order_value_range": {
                    "min": self.min_avg_order_value,
                    "max": self.max_avg_order_value
                },
                "days_since_last_purchase_range": {
                    "min": self.min_days_since_last_purchase,
                    "max": self.max_days_since_last_purchase
                },
                "email_opens_range": {
                    "min": self.min_email_opens,
                    "max": self.max_email_opens
                },
                "website_visits_range": {
                    "min": self.min_website_visits,
                    "max": self.max_website_visits
                }
            },
            "statistics": {
                "total_customers": self.total_customers,
                "avg_churn_score": self.avg_churn_score,
                "high_risk_count": self.high_risk_count,
                "medium_risk_count": self.medium_risk_count,
                "low_risk_count": self.low_risk_count
            },
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_calculated": self.last_calculated.isoformat() if self.last_calculated else None
        }

    def update_statistics(self, predictions):
        """Update cohort statistics based on matching predictions"""
        matching_predictions = self.filter_predictions(predictions)
        
        if matching_predictions:
            self.total_customers = len(matching_predictions)
            self.avg_churn_score = sum(p['churn_score'] for p in matching_predictions) / len(matching_predictions)
            self.high_risk_count = len([p for p in matching_predictions if p['risk_level'] == 'high'])
            self.medium_risk_count = len([p for p in matching_predictions if p['risk_level'] == 'medium'])
            self.low_risk_count = len([p for p in matching_predictions if p['risk_level'] == 'low'])
        else:
            self.total_customers = 0
            self.avg_churn_score = 0.0
            self.high_risk_count = 0
            self.medium_risk_count = 0
            self.low_risk_count = 0
        
        self.last_calculated = func.now()

    def filter_predictions(self, predictions):
        """Filter predictions based on cohort criteria"""
        filtered = []
        
        for prediction in predictions:
            row_data = prediction.get('row_data', {})
            
            # Check engagement level
            if self.engagement_level:
                engagement_score = self.calculate_engagement_score(row_data)
                if not self.matches_engagement_level(engagement_score):
                    continue
            
            # Check churn risk level
            if self.churn_risk_level and prediction.get('risk_level') != self.churn_risk_level:
                continue
            
            # Check age range
            age = row_data.get('age', 0)
            if self.min_age is not None and age < self.min_age:
                continue
            if self.max_age is not None and age > self.max_age:
                continue
            
            # Check total purchases range
            total_purchases = row_data.get('total_purchases', 0)
            if self.min_total_purchases is not None and total_purchases < self.min_total_purchases:
                continue
            if self.max_total_purchases is not None and total_purchases > self.max_total_purchases:
                continue
            
            # Check average order value range
            avg_order_value = row_data.get('avg_order_value', 0)
            if self.min_avg_order_value is not None and avg_order_value < self.min_avg_order_value:
                continue
            if self.max_avg_order_value is not None and avg_order_value > self.max_avg_order_value:
                continue
            
            # Check days since last purchase range
            days_since_last = row_data.get('days_since_last_purchase', 0)
            if self.min_days_since_last_purchase is not None and days_since_last < self.min_days_since_last_purchase:
                continue
            if self.max_days_since_last_purchase is not None and days_since_last > self.max_days_since_last_purchase:
                continue
            
            # Check email opens range
            email_opens = row_data.get('email_opens', 0)
            if self.min_email_opens is not None and email_opens < self.min_email_opens:
                continue
            if self.max_email_opens is not None and email_opens > self.max_email_opens:
                continue
            
            # Check website visits range
            website_visits = row_data.get('website_visits', 0)
            if self.min_website_visits is not None and website_visits < self.min_website_visits:
                continue
            if self.max_website_visits is not None and website_visits > self.max_website_visits:
                continue
            
            filtered.append(prediction)
        
        return filtered

    def calculate_engagement_score(self, row_data):
        """Calculate engagement score based on customer data"""
        email_opens = row_data.get('email_opens', 0)
        website_visits = row_data.get('website_visits', 0)
        total_purchases = row_data.get('total_purchases', 0)
        
        # Simple engagement score calculation
        engagement_score = (email_opens * 0.3 + website_visits * 0.4 + total_purchases * 0.3)
        return engagement_score

    def matches_engagement_level(self, engagement_score):
        """Check if engagement score matches the required level"""
        if self.engagement_level == 'high':
            return engagement_score >= 20
        elif self.engagement_level == 'medium':
            return 10 <= engagement_score < 20
        elif self.engagement_level == 'low':
            return engagement_score < 10
        return True

    @classmethod
    def create_from_data(cls, data, user_id):
        """Create a new cohort from form data"""
        return cls(
            user_id=user_id,
            name=data['name'],
            description=data.get('description'),
            engagement_level=data.get('engagement_level'),
            churn_risk_level=data.get('churn_risk_level'),
            min_age=data.get('min_age'),
            max_age=data.get('max_age'),
            min_total_purchases=data.get('min_total_purchases'),
            max_total_purchases=data.get('max_total_purchases'),
            min_avg_order_value=data.get('min_avg_order_value'),
            max_avg_order_value=data.get('max_avg_order_value'),
            min_days_since_last_purchase=data.get('min_days_since_last_purchase'),
            max_days_since_last_purchase=data.get('max_days_since_last_purchase'),
            min_email_opens=data.get('min_email_opens'),
            max_email_opens=data.get('max_email_opens'),
            min_website_visits=data.get('min_website_visits'),
            max_website_visits=data.get('max_website_visits')
        )
