-- Create Booths Table
CREATE TABLE booths (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL
);

-- Create Services Table
CREATE TABLE services (
    id VARCHAR(50) PRIMARY KEY,
    monthly_limit DECIMAL(10, 2) NOT NULL,
    revenue_rate DECIMAL(5, 4) NOT NULL,
    tax_rate DECIMAL(5, 4) NOT NULL
);

-- Create Transactions Table
CREATE TABLE transactions (
    id VARCHAR(20) PRIMARY KEY,
    booth_id VARCHAR(10) NOT NULL,
    service_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    revenue DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    amount_after_tax DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booth_id) REFERENCES booths(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);