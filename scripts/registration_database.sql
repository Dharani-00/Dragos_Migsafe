-- Registration Database Schema
-- This file contains tables for registration details, person details, pending counts, and biometric data

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    site VARCHAR(100),
    registration_type VARCHAR(50), -- new, renewal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create persons table
CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    occupation VARCHAR(100),
    employer VARCHAR(255),
    work_permit_number VARCHAR(100),
    work_permit_expiry DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(20),
    site VARCHAR(100),
    biometric_id INTEGER REFERENCES biometrics(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pending_counts table
CREATE TABLE IF NOT EXISTS pending_counts (
    id SERIAL PRIMARY KEY,
    site VARCHAR(100) UNIQUE,
    pending_registrations INTEGER DEFAULT 0,
    pending_renewals INTEGER DEFAULT 0,
    pending_complaints INTEGER DEFAULT 0,
    total_pending INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create biometrics table
CREATE TABLE IF NOT EXISTS biometrics (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id),
    fingerprint_data BYTEA, -- Binary data for fingerprint
    facial_data BYTEA, -- Binary data for facial recognition
    iris_data BYTEA, -- Binary data for iris scan
    biometric_status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
    last_scan TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert example data for persons
INSERT INTO persons (full_name, date_of_birth, gender, nationality, contact_number, email, address, occupation, employer, work_permit_number, work_permit_expiry, emergency_contact_name, emergency_contact_number, site) VALUES
('Rajesh Kumar', '1985-03-15', 'Male', 'India', '+91-9876543210', 'rajesh.kumar@email.com', '123 Main Street, Mumbai', 'Construction Worker', 'ABC Construction Ltd', 'WP2024001', '2025-03-15', 'Priya Kumar', '+91-9876543211', 'Mumbai Site A'),
('Maria Santos', '1990-07-22', 'Female', 'Philippines', '+63-9171234567', 'maria.santos@email.com', '456 Oak Avenue, Manila', 'Domestic Worker', 'XYZ Services', 'WP2024002', '2025-07-22', 'Carlos Santos', '+63-9171234568', 'Delhi Site B'),
('Ahmed Hassan', '1982-11-08', 'Male', 'Bangladesh', '+880-1712345678', 'ahmed.hassan@email.com', '789 Pine Road, Dhaka', 'Factory Worker', 'Global Manufacturing', 'WP2024003', '2025-11-08', 'Fatima Hassan', '+880-1712345679', 'Chennai Site C'),
('Li Wei', '1988-05-30', 'Male', 'China', '+86-13800138000', 'li.wei@email.com', '321 Elm Street, Shanghai', 'IT Specialist', 'Tech Solutions Inc', 'WP2024004', '2025-05-30', 'Wang Mei', '+86-13800138001', 'Bangalore Site D'),
('Fatou Diallo', '1992-09-12', 'Female', 'Senegal', '+221-771234567', 'fatou.diallo@email.com', '654 Cedar Lane, Dakar', 'Healthcare Assistant', 'Medical Center', 'WP2024005', '2025-09-12', 'Mamadou Diallo', '+221-771234568', 'Kolkata Site E'),
('Carlos Rodriguez', '1987-01-25', 'Male', 'Mexico', '+52-5512345678', 'carlos.rodriguez@email.com', '987 Maple Drive, Mexico City', 'Agricultural Worker', 'Farm Co Ltd', 'WP2024006', '2025-01-25', 'Ana Rodriguez', '+52-5512345679', 'Pune Site F'),
('Amina Yusuf', '1995-04-18', 'Female', 'Nigeria', '+234-8031234567', 'amina.yusuf@email.com', '147 Birch Street, Lagos', 'Teacher', 'Education Services', 'WP2024007', '2025-04-18', 'Ibrahim Yusuf', '+234-8031234568', 'Hyderabad Site G'),
('Mohammed Al-Rashid', '1983-12-03', 'Male', 'Pakistan', '+92-3001234567', 'mohammed.alrashid@email.com', '258 Spruce Avenue, Karachi', 'Driver', 'Transport Company', 'WP2024008', '2025-12-03', 'Sara Al-Rashid', '+92-3001234569', 'Ahmedabad Site H'),
('Elena Petrova', '1991-06-14', 'Female', 'Russia', '+7-9123456789', 'elena.petrova@email.com', '369 Willow Road, Moscow', 'Engineer', 'Engineering Corp', 'WP2024009', '2025-06-14', 'Dmitri Petrov', '+7-9123456790', 'Jaipur Site I'),
('David Thompson', '1989-08-27', 'Male', 'Nepal', '+977-9841234567', 'david.thompson@email.com', '741 Ash Street, Kathmandu', 'Hotel Staff', 'Hospitality Group', 'WP2024010', '2025-08-27', 'Maya Thompson', '+977-9841234568', 'Lucknow Site J');

-- Insert example data for biometrics
INSERT INTO biometrics (person_id, biometric_status, last_scan) VALUES
(1, 'active', '2024-01-15 10:30:00'),
(2, 'active', '2024-01-16 14:20:00'),
(3, 'active', '2024-01-17 09:15:00'),
(4, 'active', '2024-01-18 16:45:00'),
(5, 'active', '2024-01-19 11:30:00'),
(6, 'active', '2024-01-20 13:20:00'),
(7, 'active', '2024-01-21 08:45:00'),
(8, 'active', '2024-01-22 15:10:00'),
(9, 'active', '2024-01-23 12:30:00'),
(10, 'active', '2024-01-24 17:20:00');

-- Insert example data for registrations
INSERT INTO registrations (person_id, status, site, registration_type) VALUES
(1, 'approved', 'Mumbai Site A', 'new'),
(2, 'pending', 'Delhi Site B', 'new'),
(3, 'approved', 'Chennai Site C', 'renewal'),
(4, 'pending', 'Bangalore Site D', 'new'),
(5, 'approved', 'Kolkata Site E', 'new'),
(6, 'pending', 'Pune Site F', 'renewal'),
(7, 'approved', 'Hyderabad Site G', 'new'),
(8, 'pending', 'Ahmedabad Site H', 'new'),
(9, 'approved', 'Jaipur Site I', 'renewal'),
(10, 'pending', 'Lucknow Site J', 'new');

-- Insert example data for pending_counts
INSERT INTO pending_counts (site, pending_registrations, pending_renewals, pending_complaints, total_pending) VALUES
('Mumbai Site A', 5, 2, 1, 8),
('Delhi Site B', 8, 3, 2, 13),
('Chennai Site C', 3, 4, 0, 7),
('Bangalore Site D', 6, 1, 3, 10),
('Kolkata Site E', 4, 2, 1, 7),
('Pune Site F', 7, 3, 2, 12),
('Hyderabad Site G', 2, 5, 1, 8),
('Ahmedabad Site H', 9, 2, 3, 14),
('Jaipur Site I', 3, 4, 0, 7),
('Lucknow Site J', 5, 1, 2, 8);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_site ON persons(site);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_site ON registrations(site);
CREATE INDEX IF NOT EXISTS idx_pending_counts_site ON pending_counts(site);
CREATE INDEX IF NOT EXISTS idx_biometrics_person_id ON biometrics(person_id);