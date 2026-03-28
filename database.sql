-- Create and use the database
CREATE DATABASE IF NOT EXISTS hotel_reservation_db;
USE hotel_reservation_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) DEFAULT 'default_hotel.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table
-- Using a decimal for price to correctly store currency.
-- No is_available tag since availability is a derived property based on bookings.
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT DEFAULT 2,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- 4. Bookings Table
-- A booking references both the user who made it and the specific room booked.
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CHECK (check_out_date > check_in_date)
);

-- 5. Payments Table
-- Tracks the payment of a specific booking.
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Card',
    payment_status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 6. Reviews Table (Optional but requested)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);


-- ==========================================================
-- INSERT SAMPLE DATA
-- ==========================================================

-- Insert sample users (1 admin, 2 users). Passwords are plain text purely for visual purposes here, 
-- but in the actual application, they will be hashed using bcrypt. We will use a proxy hash here.
-- Passwords: admin@hotel.com=admin123 | john@example.com=john123 | jane@example.com=jane123
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@hotel.com', '$2b$10$TNIEXM9ItoVJz28ySlg3T.SluvfGTcFFli7rjeKKv9AD2B7NxS9N2', 'admin'),
('John Doe',   'john@example.com', '$2b$10$71LyE2owX6e93ulCs2M9Du/Yh9we4UaTVoptdu1MjONgCOMT6ugiC', 'user'),
('Jane Smith', 'jane@example.com', '$2b$10$iHKtMnfaLABFpmn9fLLB/OS4bOwMRUeQiKSwTIRzLm8jaIcfjuQ.a', 'user');

-- Insert sample Hotels
INSERT INTO hotels (name, location, description, image_url) VALUES
('Grand Azure Resort', 'Maldives', 'A beautiful overwater bungalow resort with stunning ocean views.', 'grand_azure.jpg'),
('The Metropolitan Plaza', 'New York City', 'A luxury 5-star hotel located right in the heart of Manhattan.', 'metro_plaza.jpg'),
('Sunrise Alpine Lodge', 'Swiss Alps', 'Cozy wooden cabins offering the best ski-in, ski-out experience.', 'alpine_lodge.jpg');

-- Insert Rooms
INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES
(1, 'Ocean View Suite', 450.00, 2),
(1, 'Presidential Villa', 1200.00, 4),
(2, 'Standard Queen', 150.00, 2),
(2, 'Deluxe King', 250.00, 2),
(2, 'Penthouse', 900.00, 4),
(3, 'Cabin Room', 120.00, 2),
(3, 'Family Suite', 300.00, 5);

-- Insert Sample Bookings
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES
(2, 4, '2024-05-10', '2024-05-15', 1250.00, 'Confirmed'),
(3, 1, '2024-06-01', '2024-06-05', 1800.00, 'Pending'),
(2, 6, '2024-12-20', '2024-12-25', 600.00, 'Cancelled');

-- Insert Sample Payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES
(1, 1250.00, 'Credit Card', 'Completed'),
(2, 1800.00, 'PayPal', 'Pending'),
(3, 600.00, 'Debit Card', 'Failed');

-- Insert Sample Reviews
INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES
(2, 2, 5, 'Absolutely loved the view and the staff was extremely friendly!'),
(2, 3, 4, 'Great ski trip, though the cabin was a bit too cold at night.');
