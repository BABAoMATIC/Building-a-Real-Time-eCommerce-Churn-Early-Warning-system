"""
Database model for storing churn predictions
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class ChurnPrediction(Base):
    __tablename__ = 'churn_predictions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    prediction_id = Column(String(255), unique=True, index=True, nullable=False)
    customer_id = Column(String(255), nullable=True)
    churn_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # 'high', 'medium', 'low'
    file_name = Column(String(255), nullable=True)
    status = Column(String(50), default='completed', nullable=False)
    
    # Customer data used for prediction
    age = Column(Integer, nullable=True)
    total_purchases = Column(Integer, nullable=True)
    avg_order_value = Column(Float, nullable=True)
    days_since_last_purchase = Column(Integer, nullable=True)
    email_opens = Column(Integer, nullable=True)
    website_visits = Column(Integer, nullable=True)
    
    # Additional metadata
    raw_data = Column(Text, nullable=True)  # JSON string of original row data
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationship to user
    user = relationship("User", back_populates="predictions")

    def to_dict(self):
        """Convert prediction to dictionary"""
        return {
            "id": self.prediction_id,
            "user_id": str(self.user_id),
            "customer_id": self.customer_id,
            "churn_score": self.churn_score,
            "risk_level": self.risk_level,
            "file_name": self.file_name,
            "status": self.status,
            "row_data": {
                "customer_id": self.customer_id,
                "age": self.age,
                "total_purchases": self.total_purchases,
                "avg_order_value": self.avg_order_value,
                "days_since_last_purchase": self.days_since_last_purchase,
                "email_opens": self.email_opens,
                "website_visits": self.website_visits
            },
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def create_from_prediction_data(cls, prediction_data, user_id):
        """Create a new prediction record from prediction data"""
        return cls(
            user_id=user_id,
            prediction_id=prediction_data['id'],
            customer_id=prediction_data.get('row_data', {}).get('customer_id'),
            churn_score=prediction_data['churn_score'],
            risk_level=prediction_data['risk_level'],
            file_name=prediction_data.get('file_name'),
            status=prediction_data.get('status', 'completed'),
            age=prediction_data.get('row_data', {}).get('age'),
            total_purchases=prediction_data.get('row_data', {}).get('total_purchases'),
            avg_order_value=prediction_data.get('row_data', {}).get('avg_order_value'),
            days_since_last_purchase=prediction_data.get('row_data', {}).get('days_since_last_purchase'),
            email_opens=prediction_data.get('row_data', {}).get('email_opens'),
            website_visits=prediction_data.get('row_data', {}).get('website_visits'),
            raw_data=str(prediction_data.get('row_data', {}))
        )
