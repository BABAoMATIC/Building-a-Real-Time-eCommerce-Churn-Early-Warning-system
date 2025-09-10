-- Initialize the churn database
CREATE DATABASE IF NOT EXISTS churn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for the application
CREATE USER IF NOT EXISTS 'churn_user'@'%' IDENTIFIED BY 'churn_password';
GRANT ALL PRIVILEGES ON churn_db.* TO 'churn_user'@'%';

-- Create user for monitoring
CREATE USER IF NOT EXISTS 'monitor'@'%' IDENTIFIED BY 'monitor_password';
GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'monitor'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE churn_db;

-- Create initial tables (these will be managed by Prisma migrations)
-- This is just for reference - Prisma will handle the actual schema
