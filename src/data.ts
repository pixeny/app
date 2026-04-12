import type { Tariff, Address, RideRequest } from './types';
import { 
  HistoryIcon, 
  CreditCardIcon, 
  GiftIcon, 
  StarIcon, 
  UsersIcon, 
  ShieldIcon, 
  SettingsIcon, 
  HelpIcon,
  ChartIcon,
  MoneyIcon,
  TrophyIcon,
  CarIcon,
  CarDocumentIcon
} from './components/icons';

export const tariffs: Tariff[] = [
  { id: 'economy', name: 'Economy', price: 8, eta: '5m', icon: 'https://i.imgur.com/gktPU5D.png', desc: 'Affordable price' },
  { id: 'comfort', name: 'Comfort', price: 14, eta: '3m', icon: 'https://i.imgur.com/RzL8rRY.png', desc: 'Comfortable ride' },
  { id: 'business', name: 'Business', price: 25, eta: '7m', icon: 'https://i.imgur.com/gktPU5D.png', desc: 'Premium service' },
];

export const addresses: Address[] = [
  { id: 1, name: 'Freedom Square', full: 'Freedom Square, Tbilisi', icon: '🏛️', coords: [44.7957, 41.6958] },
  { id: 2, name: 'Rustaveli Avenue 12', full: 'Shota Rustaveli Avenue 12', icon: '🏢', coords: [44.8025, 41.6952] },
  { id: 3, name: 'Vake Park', full: 'Vake Park, Ilia Chavchavadze 49', icon: '🌳', coords: [44.7174, 41.7049] },
  { id: 4, name: 'Tbilisi Mall', full: 'David Aghmashenebeli Avenue, Tbilisi Mall', icon: '🛒', coords: [44.7953, 41.7161] },
  { id: 5, name: 'Didube District', full: 'Didube District, I Quarter', icon: '🏘️', coords: [44.8289, 41.7508] },
  { id: 6, name: 'Gldani District', full: 'Gldani District, VIII Microdistrict', icon: '🏘️', coords: [44.8956, 41.7954] },
  { id: 7, name: 'Airport', full: 'Shota Rustaveli Tbilisi International Airport', icon: '✈️', coords: [44.6738, 41.6325] },
  { id: 8, name: 'Samgori Metro', full: 'Samgori Metro Station', icon: '🚇', coords: [44.8334, 41.7366] },
  { id: 9, name: 'Saburtalo', full: 'Saburtalo, Pekini 45', icon: '📍', coords: [44.7707, 41.7149] },
  { id: 10, name: 'Isani', full: 'Isani, Navtlughi Street 12', icon: '📍', coords: [44.8234, 41.7289] },
];

export const recentPlaces = [
  { icon: '🏠', label: 'Home', address: 'Vazha-Pshavela 71' },
  { icon: '🏢', label: 'Work', address: 'Rustaveli 12' },
  { icon: '🏥', label: 'Aversi', address: 'Tsereteli 116' },
  { icon: '🛒', label: 'Carrefour', address: 'Tbilisi Mall' },
];

export const promos = [
  { title: 'First Ride -50%', sub: 'Code: HELLO', gradient: 'linear-gradient(135deg, #7C3AED, #3B82F6)' },
  { title: 'Invite a Friend', sub: 'Both get 5₾', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  { title: 'Business Class', sub: 'Premium', gradient: 'linear-gradient(135deg, #374151, #111827)' },
];

export const sampleRequests: RideRequest[] = [
  { passengerName: 'Giorgi M.', passengerRating: 4.8, pickupAddress: 'Freedom Square', dropoffAddress: 'Tbilisi Mall', distance: '8.5 km', duration: '18 min', price: 12, tariff: 'Economy' },
  { passengerName: 'Ana K.', passengerRating: 4.9, pickupAddress: 'Rustaveli Avenue', dropoffAddress: 'Didube District', distance: '6.2 km', duration: '14 min', price: 18, tariff: 'Comfort' },
  { passengerName: 'Luka B.', passengerRating: 4.5, pickupAddress: 'Samgori Metro', dropoffAddress: 'Airport', distance: '15 km', duration: '25 min', price: 22, tariff: 'Economy' },
];

export const driverInfo = {
  name: 'David G.',
  rating: 4.9,
  car: 'Toyota Camry',
  color: 'Black',
  plate: 'AA-123-BB',
  eta: 4,
};

export const menuItemsRider = [
  { icon: HistoryIcon, label: 'Ride History' },
  { icon: CreditCardIcon, label: 'Payment Methods' },
  { icon: GiftIcon, label: 'Promo Code' },
  { icon: StarIcon, label: 'Favorite Addresses' },
  { icon: UsersIcon, label: 'Invite Friend' },
  { icon: ShieldIcon, label: 'Safety' },
  { icon: SettingsIcon, label: 'Settings' },
  { icon: HelpIcon, label: 'Help' },
];

export const menuItemsDriver = [
  { icon: ChartIcon, label: 'Statistics' },
  { icon: MoneyIcon, label: 'Balance' },
  { icon: TrophyIcon, label: 'Bonuses' },
  { icon: HistoryIcon, label: 'Ride History' },
  { icon: CarIcon, label: 'My Car' },
  { icon: CarDocumentIcon, label: 'Documents' },
  { icon: SettingsIcon, label: 'Settings' },
  { icon: HelpIcon, label: 'Help' },
];
