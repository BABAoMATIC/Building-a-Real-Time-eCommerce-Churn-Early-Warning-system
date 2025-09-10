"""
Authentication service for user management
"""

import re
from datetime import datetime
from database import SessionLocal
from models.user import User
from auth.jwt_utils import jwt_manager

class AuthService:
    """Authentication service"""
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password):
        """Validate password strength"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        return True, "Password is valid"
    
    @staticmethod
    def register_user(email, password, name, company=None, role='user'):
        """Register a new user"""
        db = SessionLocal()
        try:
            # Validate email format
            if not AuthService.validate_email(email):
                return False, "Invalid email format"
            
            # Validate password
            is_valid, message = AuthService.validate_password(password)
            if not is_valid:
                return False, message
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == email.lower().strip()).first()
            if existing_user:
                return False, "User with this email already exists"
            
            # Create new user
            user = User(
                email=email,
                password=password,
                name=name,
                company=company,
                role=role
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            return True, "User registered successfully", user
            
        except Exception as e:
            db.rollback()
            return False, f"Registration failed: {str(e)}"
        finally:
            db.close()
    
    @staticmethod
    def login_user(email, password):
        """Authenticate user login"""
        db = SessionLocal()
        try:
            # Find user by email
            user = db.query(User).filter(User.email == email.lower().strip()).first()
            
            if not user:
                return False, "Invalid email or password"
            
            if not user.is_active:
                return False, "Account is deactivated"
            
            # Check password
            if not user.check_password(password):
                return False, "Invalid email or password"
            
            # Update last login
            user.update_last_login()
            db.commit()
            
            # Generate tokens
            access_token = jwt_manager.create_access_token(
                user_id=user.id,
                email=user.email,
                role=user.role
            )
            refresh_token = jwt_manager.create_refresh_token(user.id)
            
            return True, "Login successful", {
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
            
        except Exception as e:
            return False, f"Login failed: {str(e)}"
        finally:
            db.close()
    
    @staticmethod
    def refresh_token(refresh_token):
        """Refresh access token using refresh token"""
        payload = jwt_manager.verify_token(refresh_token)
        
        if not payload or payload.get('type') != 'refresh':
            return False, "Invalid refresh token"
        
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == payload['user_id']).first()
            
            if not user or not user.is_active:
                return False, "User not found or inactive"
            
            # Generate new access token
            access_token = jwt_manager.create_access_token(
                user_id=user.id,
                email=user.email,
                role=user.role
            )
            
            return True, "Token refreshed successfully", {
                'access_token': access_token,
                'user': user.to_dict()
            }
            
        except Exception as e:
            return False, f"Token refresh failed: {str(e)}"
        finally:
            db.close()
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            return user
        finally:
            db.close()
    
    @staticmethod
    def update_user_profile(user_id, name=None, company=None, preferences=None):
        """Update user profile"""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return False, "User not found"
            
            if name is not None:
                user.name = name
            if company is not None:
                user.company = company
            if preferences is not None:
                user.preferences = preferences
            
            user.updated_at = datetime.utcnow()
            db.commit()
            
            return True, "Profile updated successfully", user
            
        except Exception as e:
            db.rollback()
            return False, f"Profile update failed: {str(e)}"
        finally:
            db.close()
    
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """Change user password"""
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return False, "User not found"
            
            # Verify current password
            if not user.check_password(current_password):
                return False, "Current password is incorrect"
            
            # Validate new password
            is_valid, message = AuthService.validate_password(new_password)
            if not is_valid:
                return False, message
            
            # Update password
            user.password_hash = user.hash_password(new_password)
            user.updated_at = datetime.utcnow()
            db.commit()
            
            return True, "Password changed successfully"
            
        except Exception as e:
            db.rollback()
            return False, f"Password change failed: {str(e)}"
        finally:
            db.close()
