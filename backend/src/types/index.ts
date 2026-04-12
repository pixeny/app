export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'rider' | 'driver';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_color: string;
  license_plate: string;
  is_online: boolean;
  current_location?: {
    lat: number;
    lng: number;
  };
  rating: number;
  total_trips: number;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id?: string;
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
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
}

export interface Payment {
  id: string;
  ride_id: string;
  user_id: string;
  amount: number;
  method: 'cash' | 'card' | 'balance';
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface LocationUpdate {
  userId: string;
  rideId?: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

export interface RouteResponse {
  routes: {
    geometry: {
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
  }[];
}
