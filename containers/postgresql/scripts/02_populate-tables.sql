-- Example records for students and customers.
-- Adjust column names to match the actual table schema before executing.

INSERT INTO customers (id, name, login, password, email, company, created_at)
VALUES
	(1, 'David Smith', 'dsmith', 'password123', 'david.smith@example.com', 'Acme Corp', '2024-01-08'),
	(2, 'Emma Brown', 'ebrown', 'password456', 'emma.brown@example.com', 'Globex Inc', '2024-02-14'),
	(3, 'Fatima Ali', 'fali', 'password789', 'fatima.ali@example.com', 'Initech Ltd', '2024-03-22');
