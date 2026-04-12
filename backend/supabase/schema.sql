-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(10) CHECK (role IN ('rider', 'driver')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  car_make VARCHAR(50) NOT NULL,
  car_model VARCHAR(50) NOT NULL,
  car_year INTEGER NOT NULL,
  car_color VARCHAR(30) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  is_online BOOLEAN DEFAULT false,
  current_location JSONB,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Rides table
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  fare DECIMAL(10,2) NOT NULL,
  distance DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  payment_method VARCHAR(10) CHECK (payment_method IN ('cash', 'card', 'balance')) DEFAULT 'balance',
  payment_status VARCHAR(10) CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(10) CHECK (method IN ('cash', 'card', 'balance')) NOT NULL,
  status VARCHAR(10) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User balances table
CREATE TABLE user_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_is_online ON drivers(is_online);
CREATE INDEX idx_rides_rider_id ON rides(rider_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_ride_id ON payments(ride_id);
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON user_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Service role can bypass RLS for user management
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Service role can manage balances
CREATE POLICY "Service role can manage balances" ON user_balances
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Drivers can view their own data
CREATE POLICY "Drivers can view own profile" ON drivers
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Drivers can update their own data
CREATE POLICY "Drivers can update own profile" ON drivers
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Riders can view their own rides
CREATE POLICY "Riders can view own rides" ON rides
    FOR SELECT USING (auth.uid()::text = rider_id::text);

-- Drivers can view rides assigned to them
CREATE POLICY "Drivers can view assigned rides" ON rides
    FOR SELECT USING (auth.uid()::text = driver_id::text);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own balance
CREATE POLICY "Users can view own balance" ON user_balances
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update their own balance
CREATE POLICY "Users can update own balance" ON user_balances
    FOR UPDATE USING (auth.uid()::text = user_id::text);
