export type UserRole = 'rider' | 'driver';

export type RideStep =
  | 'home'
  | 'search'
  | 'route'
  | 'searching'
  | 'found'
  | 'arriving'
  | 'riding'
  | 'done';

export type DriverStep =
  | 'offline'
  | 'online'
  | 'request'
  | 'toPickup'
  | 'inRide'
  | 'completed';

export interface Tariff {
  id: string;
  name: string;
  price: number;
  eta: string;
  icon: string;
  desc: string;
}

export interface Address {
  id: number;
  name: string;
  full: string;
  icon: string;
  coords?: [number, number];
}

export interface RideRequest {
  passengerName: string;
  passengerRating: number;
  pickupAddress: string;
  dropoffAddress: string;
  distance: string;
  duration: string;
  price: number;
  tariff: string;
}
