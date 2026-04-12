import { supabase } from '../lib/supabase';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  phone: string;
  password: string;
  role: 'rider' | 'driver';
  car_make?: string;
  car_model?: string;
  car_color?: string;
  license_plate?: string;
  car_photo_url?: string;
}

export interface User {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  balance?: number;
  car_make?: string;
  car_model?: string;
  car_color?: string;
  license_plate?: string;
  car_photo_url?: string;
  is_online?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface DriverRegistration {
  license_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_color: string;
  license_plate: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RideRequest {
  origin: Location;
  destination: Location;
  payment_method?: 'cash' | 'card' | 'balance';
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id?: string;
  origin: Location;
  destination: Location;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  distance: number;
  duration: number;
  payment_method: 'cash' | 'card' | 'balance';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  driver?: any;
}

class ApiService {
  private token: string | null = null;
  private currentUser: User | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }


  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Get user by phone
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', data.phone)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // In production, you should use bcrypt.compare
      // For now, we'll do simple string comparison (NOT SECURE FOR PRODUCTION)
      if (user.password_hash !== data.password) {
        throw new Error('Password is incorrect');
      }

      // Get driver info if user is a driver
      let userData: User = {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        balance: user.balance
      };

      if (user.role === 'driver') {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (driverData) {
          userData = {
            ...userData,
            car_make: driverData.car_make,
            car_model: driverData.car_model,
            car_color: driverData.car_color,
            license_plate: driverData.license_plate,
            car_photo_url: driverData.car_photo_url,
            is_online: driverData.is_online
          };
        }
      }

      this.setToken(user.id);
      this.setCurrentUser(userData);

      return {
        message: 'Successfully logged in',
        token: user.id,
        user: userData
      };
    } catch (error: any) {
      throw new Error(error.message || 'Authorization error');
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if phone already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', data.phone)
        .single();

      if (existingUser) {
        throw new Error('This phone number is already in use');
      }

      // Create user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          password_hash: data.password, // In production, hash this with bcrypt
          role: data.role,
          balance: 0
        })
        .select()
        .single();

      if (userError || !newUser) {
        throw new Error('Registration error');
      }

      // If driver, create driver record
      let userData: User = {
        id: newUser.id,
        full_name: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        balance: newUser.balance
      };

      if (data.role === 'driver') {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .insert({
            id: newUser.id,
            car_make: data.car_make || '',
            car_model: data.car_model || '',
            car_color: data.car_color || '',
            license_plate: data.license_plate || '',
            car_photo_url: data.car_photo_url || '',
            is_online: false
          })
          .select()
          .single();

        if (driverError || !driverData) {
          // Rollback user creation
          await supabase.from('users').delete().eq('id', newUser.id);
          throw new Error('Driver registration error');
        }

        userData = {
          ...userData,
          car_make: driverData.car_make,
          car_model: driverData.car_model,
          car_color: driverData.car_color,
          license_plate: driverData.license_plate,
          car_photo_url: driverData.car_photo_url,
          is_online: driverData.is_online
        };
      }

      this.setToken(newUser.id);
      this.setCurrentUser(userData);

      return {
        message: 'Successfully registered',
        token: newUser.id,
        user: userData
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration error');
    }
  }

  async getProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    const cachedUser = this.getCurrentUser();
    if (cachedUser) {
      return cachedUser;
    }

    throw new Error('User information not found');
  }

  async registerDriver(data: DriverRegistration): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    try {
      const response = await fetch('http://localhost:3011/api/drivers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Driver registration error');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Driver registration error');
    }
  }

  async getDriverProfile(): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    try {
      const response = await fetch('http://localhost:3011/api/drivers/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Driver profile not found');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error getting driver profile');
    }
  }

  async updateDriverStatus(isOnline: boolean): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    try {
      const response = await fetch('http://localhost:3011/api/drivers/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_online: isOnline })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error updating driver status');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error updating driver status');
    }
  }

  async acceptRide(rideId: string): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    try {
      const response = await fetch(`http://localhost:3011/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error accepting ride');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error accepting ride');
    }
  }

  async cancelRide(rideId: string): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    try {
      const response = await fetch(`http://localhost:3011/api/rides/${rideId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error cancelling ride');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error cancelling ride');
    }
  }

  async completeRide(rideId: string): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('You are not authenticated');
    }

    try {
      const response = await fetch(`http://localhost:3011/api/rides/${rideId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error completing ride');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error completing ride');
    }
  }

}

export const apiService = new ApiService();
export default apiService;
