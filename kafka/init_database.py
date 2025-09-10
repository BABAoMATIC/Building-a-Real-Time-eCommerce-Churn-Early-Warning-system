#!/usr/bin/env python3
"""
Database Initialization Script

This script creates the MySQL database and tables for storing churn predictions.
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

def init_database():
    """Initialize the MySQL database and create tables"""
    
    # Get database configuration
    db_url = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/churn_db')
    
    try:
        # Parse database URL to get connection details
        if 'mysql+pymysql://' in db_url:
            # Extract connection details
            connection_string = db_url.replace('mysql+pymysql://', '')
            if '@' in connection_string:
                auth_part, host_part = connection_string.split('@')
                if ':' in auth_part:
                    username, password = auth_part.split(':')
                else:
                    username, password = auth_part, ''
                
                if ':' in host_part:
                    host_port, database = host_part.split('/')
                    if ':' in host_port:
                        host, port = host_port.split(':')
                    else:
                        host, port = host_port, '3306'
                else:
                    host, port, database = host_part, '3306', 'churn_db'
            else:
                logger.error("Invalid database URL format")
                return False
        else:
            logger.error("Only MySQL database is supported")
            return False
        
        # Connect to MySQL server (without database)
        server_url = f"mysql+pymysql://{username}:{password}@{host}:{port}"
        engine = create_engine(server_url)
        
        # Create database if it doesn't exist
        with engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {database}"))
            conn.commit()
            logger.info(f"Database '{database}' created or already exists")
        
        # Connect to the specific database
        db_engine = create_engine(db_url)
        
        # Create tables
        create_tables_sql = """
        CREATE TABLE IF NOT EXISTS churn_predictions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            churn_score FLOAT NOT NULL,
            event_type VARCHAR(50) NOT NULL,
            timestamp DATETIME NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_timestamp (timestamp),
            INDEX idx_event_type (event_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        with db_engine.connect() as conn:
            conn.execute(text(create_tables_sql))
            conn.commit()
            logger.info("Table 'churn_predictions' created or already exists")
        
        # Test the connection
        with db_engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM churn_predictions"))
            count = result.scalar()
            logger.info(f"Database initialized successfully. Current records: {count}")
        
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

def main():
    """Main function"""
    logger.info("Initializing database...")
    
    if init_database():
        logger.info("✅ Database initialization completed successfully")
    else:
        logger.error("❌ Database initialization failed")
        exit(1)

if __name__ == "__main__":
    main()
