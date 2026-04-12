-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Drivers can view own profile" ON drivers;
DROP POLICY IF EXISTS "Drivers can update own profile" ON drivers;
DROP POLICY IF EXISTS "Riders can view own rides" ON rides;
DROP POLICY IF EXISTS "Drivers can view assigned rides" ON rides;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;
DROP POLICY IF EXISTS "Users can update own balance" ON user_balances;

-- Disable RLS for users table to allow service role operations
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled for other tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Recreate user-specific policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Drivers can view own profile" ON drivers
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Drivers can update own profile" ON drivers
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Riders can view own rides" ON rides
    FOR SELECT USING (auth.uid()::text = rider_id::text);

CREATE POLICY "Drivers can view assigned rides" ON rides
    FOR SELECT USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own balance" ON user_balances
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own balance" ON user_balances
    FOR UPDATE USING (auth.uid()::text = user_id::text);
