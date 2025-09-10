#!/usr/bin/env python3
"""
Database Initialization Script

This script creates the MySQL database and tables required for the
Kafka consumer to store user events and churn scores.

Usage:
    python init_database.py
"""

import os
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Database configuration
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = int(os.getenv('DB_PORT', '3306'))
        db_name = os.getenv('DB_NAME', 'churn_db')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', 'password')
        
        # Connect to MySQL server (without specifying database)
        server_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}"
        
        logger.info(f"Connecting to MySQL server at {db_host}:{db_port}")
        engine = create_engine(server_url)
        
        # Create database if it doesn't exist
        with engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            conn.commit()
        
        logger.info(f"Database '{db_name}' created successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to create database: {e}")
        return False

def create_tables():
    """Create tables in the database"""
    try:
        # Database configuration
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = int(os.getenv('DB_PORT', '3306'))
        db_name = os.getenv('DB_NAME', 'churn_db')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', 'password')
        
        # Connect to the specific database
        db_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        
        logger.info(f"Connecting to database '{db_name}'")
        engine = create_engine(db_url)
        
        # Create tables
        from kafka_consumer import Base
        Base.metadata.create_all(engine)
        
        logger.info("Tables created successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        return False

def create_indexes():
    """Create additional indexes for better performance"""
    try:
        # Database configuration
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = int(os.getenv('DB_PORT', '3306'))
        db_name = os.getenv('DB_NAME', 'churn_db')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', 'password')
        
        # Connect to the database
        db_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        engine = create_engine(db_url)
        
        # Create additional indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_user_events_user_id_event_type ON user_events(user_id, event_type)",
            "CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_user_events_churn_score ON user_events(churn_score)",
            "CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at)"
        ]
        
        with engine.connect() as conn:
            for index_sql in indexes:
                try:
                    conn.execute(text(index_sql))
                    logger.info(f"Created index: {index_sql}")
                except Exception as e:
                    logger.warning(f"Index creation failed (may already exist): {e}")
            conn.commit()
        
        logger.info("Indexes created successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")
        return False

def main():
    """Main function to initialize the database"""
    logger.info("=" * 60)
    logger.info("Database Initialization")
    logger.info("=" * 60)
    
    # Create database
    if not create_database():
        logger.error("Failed to create database")
        return False
    
    # Create tables
    if not create_tables():
        logger.error("Failed to create tables")
        return False
    
    # Create indexes
    if not create_indexes():
        logger.error("Failed to create indexes")
        return False
    
    logger.info("=" * 60)
    logger.info("Database initialization completed successfully!")
    logger.info("=" * 60)
    return True

if __name__ == "__main__":
    main()
