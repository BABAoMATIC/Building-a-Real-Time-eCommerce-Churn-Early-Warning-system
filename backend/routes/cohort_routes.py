"""
Cohorts API routes
"""

from flask import Blueprint, request, jsonify, g
from auth.jwt_utils import token_required
from models.cohort import Cohort
from models.prediction import ChurnPrediction
from database import SessionLocal
from datetime import datetime

cohort_bp = Blueprint('cohort', __name__, url_prefix='/api/cohorts')

@cohort_bp.route('', methods=['GET'])
@token_required
def get_cohorts():
    """Get all cohorts for the authenticated user"""
    try:
        user_id = g.user_id
        db = SessionLocal()
        
        try:
            # Get cohorts for the user
            cohorts = db.query(Cohort).filter(
                Cohort.user_id == user_id,
                Cohort.is_active == True
            ).order_by(Cohort.created_at.desc()).all()
            
            # Get user's predictions for statistics calculation
            predictions = db.query(ChurnPrediction).filter(
                ChurnPrediction.user_id == user_id
            ).all()
            
            # Convert predictions to dict format
            predictions_data = [pred.to_dict() for pred in predictions]
            
            # Update statistics for each cohort
            for cohort in cohorts:
                cohort.update_statistics(predictions_data)
            
            db.commit()
            
            # Convert cohorts to dict format
            cohorts_data = [cohort.to_dict() for cohort in cohorts]
            
            return jsonify({
                "success": True,
                "data": cohorts_data,
                "total": len(cohorts_data)
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch cohorts: {str(e)}"
        }), 500

@cohort_bp.route('', methods=['POST'])
@token_required
def create_cohort():
    """Create a new cohort"""
    try:
        user_id = g.user_id
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({
                "success": False,
                "error": "Cohort name is required"
            }), 400
        
        db = SessionLocal()
        
        try:
            # Check if cohort name already exists for this user
            existing_cohort = db.query(Cohort).filter(
                Cohort.user_id == user_id,
                Cohort.name == data['name'],
                Cohort.is_active == True
            ).first()
            
            if existing_cohort:
                return jsonify({
                    "success": False,
                    "error": "A cohort with this name already exists"
                }), 400
            
            # Create new cohort
            cohort = Cohort.create_from_data(data, user_id)
            db.add(cohort)
            db.commit()
            db.refresh(cohort)
            
            # Calculate initial statistics
            predictions = db.query(ChurnPrediction).filter(
                ChurnPrediction.user_id == user_id
            ).all()
            predictions_data = [pred.to_dict() for pred in predictions]
            cohort.update_statistics(predictions_data)
            db.commit()
            
            return jsonify({
                "success": True,
                "message": "Cohort created successfully",
                "data": cohort.to_dict()
            }), 201
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to create cohort: {str(e)}"
        }), 500

@cohort_bp.route('/<int:cohort_id>', methods=['GET'])
@token_required
def get_cohort(cohort_id):
    """Get a specific cohort by ID"""
    try:
        user_id = g.user_id
        db = SessionLocal()
        
        try:
            cohort = db.query(Cohort).filter(
                Cohort.id == cohort_id,
                Cohort.user_id == user_id,
                Cohort.is_active == True
            ).first()
            
            if not cohort:
                return jsonify({
                    "success": False,
                    "error": "Cohort not found"
                }), 404
            
            # Update statistics
            predictions = db.query(ChurnPrediction).filter(
                ChurnPrediction.user_id == user_id
            ).all()
            predictions_data = [pred.to_dict() for pred in predictions]
            cohort.update_statistics(predictions_data)
            db.commit()
            
            return jsonify({
                "success": True,
                "data": cohort.to_dict()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch cohort: {str(e)}"
        }), 500

@cohort_bp.route('/<int:cohort_id>', methods=['PUT'])
@token_required
def update_cohort(cohort_id):
    """Update a cohort"""
    try:
        user_id = g.user_id
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        db = SessionLocal()
        
        try:
            cohort = db.query(Cohort).filter(
                Cohort.id == cohort_id,
                Cohort.user_id == user_id,
                Cohort.is_active == True
            ).first()
            
            if not cohort:
                return jsonify({
                    "success": False,
                    "error": "Cohort not found"
                }), 404
            
            # Check if new name conflicts with existing cohort
            if data.get('name') and data['name'] != cohort.name:
                existing_cohort = db.query(Cohort).filter(
                    Cohort.user_id == user_id,
                    Cohort.name == data['name'],
                    Cohort.is_active == True,
                    Cohort.id != cohort_id
                ).first()
                
                if existing_cohort:
                    return jsonify({
                        "success": False,
                        "error": "A cohort with this name already exists"
                    }), 400
            
            # Update cohort fields
            for field in ['name', 'description', 'engagement_level', 'churn_risk_level',
                         'min_age', 'max_age', 'min_total_purchases', 'max_total_purchases',
                         'min_avg_order_value', 'max_avg_order_value', 'min_days_since_last_purchase',
                         'max_days_since_last_purchase', 'min_email_opens', 'max_email_opens',
                         'min_website_visits', 'max_website_visits']:
                if field in data:
                    setattr(cohort, field, data[field])
            
            cohort.updated_at = datetime.utcnow()
            
            # Recalculate statistics
            predictions = db.query(ChurnPrediction).filter(
                ChurnPrediction.user_id == user_id
            ).all()
            predictions_data = [pred.to_dict() for pred in predictions]
            cohort.update_statistics(predictions_data)
            
            db.commit()
            
            return jsonify({
                "success": True,
                "message": "Cohort updated successfully",
                "data": cohort.to_dict()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to update cohort: {str(e)}"
        }), 500

@cohort_bp.route('/<int:cohort_id>', methods=['DELETE'])
@token_required
def delete_cohort(cohort_id):
    """Delete a cohort (soft delete)"""
    try:
        user_id = g.user_id
        db = SessionLocal()
        
        try:
            cohort = db.query(Cohort).filter(
                Cohort.id == cohort_id,
                Cohort.user_id == user_id,
                Cohort.is_active == True
            ).first()
            
            if not cohort:
                return jsonify({
                    "success": False,
                    "error": "Cohort not found"
                }), 404
            
            # Soft delete
            cohort.is_active = False
            cohort.updated_at = datetime.utcnow()
            db.commit()
            
            return jsonify({
                "success": True,
                "message": "Cohort deleted successfully"
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to delete cohort: {str(e)}"
        }), 500

@cohort_bp.route('/<int:cohort_id>/recalculate', methods=['POST'])
@token_required
def recalculate_cohort(cohort_id):
    """Recalculate cohort statistics"""
    try:
        user_id = g.user_id
        db = SessionLocal()
        
        try:
            cohort = db.query(Cohort).filter(
                Cohort.id == cohort_id,
                Cohort.user_id == user_id,
                Cohort.is_active == True
            ).first()
            
            if not cohort:
                return jsonify({
                    "success": False,
                    "error": "Cohort not found"
                }), 404
            
            # Get all predictions for the user
            predictions = db.query(ChurnPrediction).filter(
                ChurnPrediction.user_id == user_id
            ).all()
            predictions_data = [pred.to_dict() for pred in predictions]
            
            # Recalculate statistics
            cohort.update_statistics(predictions_data)
            db.commit()
            
            return jsonify({
                "success": True,
                "message": "Cohort statistics recalculated",
                "data": cohort.to_dict()
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to recalculate cohort: {str(e)}"
        }), 500

@cohort_bp.route('/filter', methods=['POST'])
@token_required
def filter_cohorts():
    """Filter cohorts by engagement or churn risk"""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        
        engagement_filter = data.get('engagement_level')
        churn_risk_filter = data.get('churn_risk_level')
        
        db = SessionLocal()
        
        try:
            query = db.query(Cohort).filter(
                Cohort.user_id == user_id,
                Cohort.is_active == True
            )
            
            # Apply filters
            if engagement_filter:
                query = query.filter(Cohort.engagement_level == engagement_filter)
            
            if churn_risk_filter:
                query = query.filter(Cohort.churn_risk_level == churn_risk_filter)
            
            cohorts = query.order_by(Cohort.created_at.desc()).all()
            
            # Update statistics for filtered cohorts
            predictions = db.query(ChurnPrediction).filter(
                ChurnPrediction.user_id == user_id
            ).all()
            predictions_data = [pred.to_dict() for pred in predictions]
            
            for cohort in cohorts:
                cohort.update_statistics(predictions_data)
            
            db.commit()
            
            cohorts_data = [cohort.to_dict() for cohort in cohorts]
            
            return jsonify({
                "success": True,
                "data": cohorts_data,
                "total": len(cohorts_data),
                "filters_applied": {
                    "engagement_level": engagement_filter,
                    "churn_risk_level": churn_risk_filter
                }
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to filter cohorts: {str(e)}"
        }), 500
