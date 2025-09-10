-- Migration script for the simplified churn prediction schema
-- Run this script to create the tables in your MySQL database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    churnRisk FLOAT NULL,
    cohort VARCHAR(100) NULL,
    INDEX idx_email (email),
    INDEX idx_cohort (cohort),
    INDEX idx_churn_risk (churnRisk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    metadata JSON NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_user_id (userId),
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create offer_rules table
CREATE TABLE IF NOT EXISTS offer_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    condition TEXT NOT NULL,
    action TEXT NOT NULL,
    INDEX idx_condition (condition(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO users (email, churnRisk, cohort) VALUES
('user1@example.com', 0.2, 'Q1-2024'),
('user2@example.com', 0.8, 'Q1-2024'),
('user3@example.com', 0.5, 'Q2-2024'),
('user4@example.com', 0.1, 'Q2-2024'),
('user5@example.com', 0.9, 'Q1-2024')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO events (userId, type, metadata, timestamp) VALUES
(1, 'page_view', '{"page": "/products", "session_length": 5.2}', NOW() - INTERVAL 1 HOUR),
(1, 'add_to_cart', '{"product_id": "PROD-001", "price": 29.99}', NOW() - INTERVAL 45 MINUTE),
(2, 'bounce', '{"page": "/checkout", "session_length": 0.5}', NOW() - INTERVAL 2 HOUR),
(2, 'login', '{"device": "mobile", "location": "US"}', NOW() - INTERVAL 3 HOUR),
(3, 'purchase', '{"order_id": "ORD-001", "amount": 99.99}', NOW() - INTERVAL 30 MINUTE),
(4, 'product_view', '{"product_id": "PROD-002", "category": "electronics"}', NOW() - INTERVAL 15 MINUTE),
(5, 'bounce', '{"page": "/pricing", "session_length": 1.2}', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE userId=userId;

INSERT INTO offer_rules (condition, action) VALUES
('churnRisk > 0.7', 'Send 20% discount offer'),
('churnRisk > 0.5 AND cohort = "Q1-2024"', 'Send loyalty program invitation'),
('type = "bounce" AND metadata->>"$.session_length" < 2', 'Send re-engagement email'),
('churnRisk > 0.8', 'Assign dedicated customer success manager'),
('type = "purchase" AND metadata->>"$.amount" > 100', 'Send thank you message with referral code')
ON DUPLICATE KEY UPDATE condition=condition;
