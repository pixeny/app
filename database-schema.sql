-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('rider', 'driver')),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table (extends users)
CREATE TABLE drivers (
    id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    car_make VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_color VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    car_photo_url VARCHAR(500),
    is_online BOOLEAN DEFAULT false,
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rides table
CREATE TABLE rides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    origin_lat DECIMAL(10, 8) NOT NULL,
    origin_lng DECIMAL(11, 8) NOT NULL,
    origin_address TEXT,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    destination_address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    fare DECIMAL(10, 2) NOT NULL,
    distance DECIMAL(8, 2) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'balance')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Payment history table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ride_payment', 'top_up', 'withdraw')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'balance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_drivers_is_online ON drivers(is_online);
CREATE INDEX idx_drivers_location ON drivers(current_lat, current_lng) WHERE is_online = true;
CREATE INDEX idx_rides_rider_id ON rides(rider_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
