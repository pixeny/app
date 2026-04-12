
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { RideStep } from '../types';
import { tariffs, recentPlaces, promos, driverInfo, menuItemsRider } from '../data';
import { C, shadow } from '../styles';
import apiService from '../services/api';
import socketService from '../services/socket';
import routingService from '../services/routing';
import geocodingService from '../services/geocoding';
import fareService from '../services/fare';
import {
  StarIcon,
  PhoneIcon,
  MessageIcon,
  SearchIcon,
  CreditCardIcon,
  ChevronRightIcon,
  XIcon,
  MapPinIcon,
  CarIcon,
  PersonIcon,
  UsersIcon,
  ShieldIcon,
  ClockIcon,
} from './icons';

// Custom Hook to get the latest version of a value
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// Modern Enhanced Styles for Rider Panel
const modernRiderPanel: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12), 0 -4px 20px rgba(0, 0, 0, 0.08)',
  zIndex: 30,
  pointerEvents: 'auto',
  backdropFilter: 'blur(20px)',
};

// Enhanced CSS Animations
const enhancedAnimations = `
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
    }
    50% { 
      opacity: 0.6;
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% { 
      transform: translateX(-100%);
    }
    100% { 
      transform: translateX(100%);
    }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.4;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }
`;

const riderGradientCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 20,
  padding: 24,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
};

const riderQuickActionBtn: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#f8f9fa',
  borderRadius: 16,
  padding: 16,
  border: '1px solid #e9ecef',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  transition: 'all 0.3s ease',
};

const riderSearchInput: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  borderRadius: 16,
  padding: 4,
  border: '2px solid #e9ecef',
  transition: 'all 0.2s ease',
};

const riderPrimaryButton: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: 16,
  padding: '18px 24px',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
};

interface RiderPanelProps {
  userLocation?: [number, number] | null;
  onStartNavigation?: (route: [number, number][]) => void;
  onStopNavigation?: () => void;
  isNavigating?: boolean;
  openLocationPicker?: (field: 'pickup' | 'dropoff') => void;
  updateMarkedLocations?: (pickup: string, dropoff: string, pickupCoords?: [number, number], dropoffCoords?: [number, number]) => void;
  currentUser?: any;
}

export default function RiderPanel({
  userLocation,
  onStartNavigation,
  onStopNavigation,
  isNavigating = false,
  openLocationPicker,
  updateMarkedLocations,
  currentUser
}: RiderPanelProps = {}) {
  // State Management
  const [step, setStep] = useState<RideStep>('home');
  const [selectedTariff, setSelectedTariff] = useState('economy');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [searchField, setSearchField] = useState<'pickup' | 'dropoff' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [rating, setRating] = useState(0);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geocodingResults, setGeocodingResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [rideSharing, setRideSharing] = useState(false);
  const [splitPayment, setSplitPayment] = useState(false);
  const [scheduledRide, setScheduledRide] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showSafetyTools, setShowSafetyTools] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Mom', phone: '+995 555 111 222' },
    { name: 'Best Friend', phone: '+995 555 333 444' }
  ]);

  // Stable Refs & Memos
  const onStartNavigationRef = useLatest(onStartNavigation);
  const onStopNavigationRef = useLatest(onStopNavigation);
  const updateMarkedLocationsRef = useLatest(updateMarkedLocations);

  const pickupCoordsStr = useMemo(() => JSON.stringify(pickupCoords), [pickupCoords]);
  const dropoffCoordsStr = useMemo(() => JSON.stringify(dropoffCoords), [dropoffCoords]);
  const userLocationStr = useMemo(() => JSON.stringify(userLocation), [userLocation]);
  const driverLocationStr = useMemo(() => JSON.stringify(driverLocation), [driverLocation]);

  const currentTariff = tariffs.find(t => t.id === selectedTariff) || tariffs[0];

  // Helper function to calculate tariff-specific fares
  const calculateTariffFare = useCallback((baseFare: number, tariffId: string) => {
    const multipliers: Record<string, number> = {
      'economy': 1.0,      // Base price
      'comfort': 1.4,      // 40% more expensive
      'business': 2.0      // 100% more expensive (double)
    };
    return baseFare * (multipliers[tariffId] || 1.0);
  }, []);

  // Memoized Functions
  const resetAll = useCallback(async () => {
    if (activeRide?.status !== 'completed') {
      try { await apiService.cancelRide(activeRide.id); } catch { }
    }
    setStep('home');
    setPickup(''); setDropoff('');
    setPickupCoords(null); setDropoffCoords(null);
    setSearchField(null);
    setRating(0); setActiveRide(null); setDriverLocation(null);
    onStopNavigationRef.current?.();
  }, [activeRide, onStopNavigationRef]);

  const openSearch = useCallback((field: 'pickup' | 'dropoff') => {
    setSearchField(field);
    setSearchQuery(field === 'pickup' ? pickup : dropoff);
    setStep('search');
  }, [pickup, dropoff]);

  // --- FIX 1: Improved address selection logic ---
  const selectAddress = useCallback((addr: string, coordinates?: [number, number]) => {
    if (!searchField) return;

    if (searchField === 'pickup') {
      setPickup(addr);
      setPickupCoords(coordinates ?? null);

      // If dropoff is not set, automatically switch to select it
      if (!dropoff) {
        setSearchField('dropoff');
        setSearchQuery(''); // Clear query for the new search
        // Stay on 'search' step
      } else {
        setStep('route'); // Go back to route overview if dropoff was already set
      }
    } else { // searchField === 'dropoff'
      setDropoff(addr);
      setDropoffCoords(coordinates ?? null);
      setStep('route'); // Finished selecting, go to route overview
    }
  }, [searchField, dropoff]); // Added dropoff to dependency array

  const selectGeocodedAddress = useCallback((result: any) => {
    const formattedAddress = geocodingService.formatAddress(result);
    const coordinates = geocodingService.getCoordinates(result);
    selectAddress(formattedAddress, coordinates);
  }, [selectAddress]);


  // Effects

  // --- FIX 2: Correct routing logic ---
  useEffect(() => {
    let routePromise: Promise<[number, number][] | null> | null = null;
    let points: { lat: number, lng: number }[] = [];

    // Planning Phase: Pickup -> Dropoff
    if (step === 'route' && pickupCoords && dropoffCoords) {
      // THE FIX: Do not add userLocation here. The route is from pickup to dropoff.
      points.push({ lng: pickupCoords[0], lat: pickupCoords[1] });
      points.push({ lng: dropoffCoords[0], lat: dropoffCoords[1] });
    }
    // Driver Arriving Phase: Driver -> Pickup
    else if ((step === 'found' || step === 'arriving') && driverLocation && pickupCoords) {
      points.push({ lng: driverLocation[0], lat: driverLocation[1] });
      points.push({ lng: pickupCoords[0], lat: pickupCoords[1] });
    }
    // Riding Phase: Car -> Dropoff
    else if (step === 'riding' && driverLocation && dropoffCoords) {
      points.push({ lng: driverLocation[0], lat: driverLocation[1] });
      points.push({ lng: dropoffCoords[0], lat: dropoffCoords[1] });
    }

    if (points.length >= 2) {
      routePromise = routingService.calculateRoute(points);
    } else {
      onStopNavigationRef.current?.(); // Clear route if not needed
      return;
    }

    let isCancelled = false;
    routePromise
      .then(route => { if (!isCancelled) onStartNavigationRef.current?.(route ?? []) })
      .catch(() => { if (!isCancelled) onStartNavigationRef.current?.([]) });

    return () => { isCancelled = true; };
  }, [step, pickupCoordsStr, dropoffCoordsStr, driverLocationStr, onStartNavigationRef, onStopNavigationRef]);

  // WebSocket event handler
  useEffect(() => {
    if (!activeRide) return;
    const rideId = activeRide.id;

    const handleRideAccepted = (data: { driver: any, location: [number, number] }) => {
      console.log('Ride accepted!', data);
      setDriverLocation(data.location);
      setStep('found');
    };

    const handleDriverLocationUpdate = (data: { location: [number, number] }) => {
      setDriverLocation(data.location);
    };

    socketService.on(`ride:${rideId}:accepted`, handleRideAccepted);
    socketService.on(`ride:${rideId}:driver_location_update`, handleDriverLocationUpdate);

    return () => {
      socketService.off(`ride:${rideId}:accepted`);
      socketService.off(`ride:${rideId}:driver_location_update`);
    };
  }, [activeRide]);

  // Other utility effects
  useEffect(() => {
    const handleLocationSelected = (event: CustomEvent) => selectAddress(event.detail.address, event.detail.coords);
    window.addEventListener('locationSelected', handleLocationSelected as EventListener);
    return () => window.removeEventListener('locationSelected', handleLocationSelected as EventListener);
  }, [selectAddress]);

  useEffect(() => {
    if (pickup && dropoff && step === 'home') setStep('route');
  }, [pickup, dropoff, step]);

  // Calculate distance and fare when pickup and dropoff coordinates are available
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setRouteDistance(null);
      setCalculatedFare(null);
      return;
    }

    const calculateDistanceAndFare = async () => {
      try {
        const points = [
          { lng: pickupCoords[0], lat: pickupCoords[1] },
          { lng: dropoffCoords[0], lat: dropoffCoords[1] }
        ];

        const routeInfo = await routingService.getRouteDistance(points);
        if (routeInfo) {
          setRouteDistance(routeInfo.distance);
          const fare = fareService.calculateFare({ distance: routeInfo.distance });
          setCalculatedFare(fare);
        }
      } catch (error) {
        console.error('Failed to calculate distance and fare:', error);
        setRouteDistance(null);
        setCalculatedFare(null);
      }
    };

    calculateDistanceAndFare();
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    updateMarkedLocationsRef.current?.(pickup, dropoff, pickupCoords ?? undefined, dropoffCoords ?? undefined);
  }, [pickup, dropoff, pickupCoords, dropoffCoords, updateMarkedLocationsRef]);

  useEffect(() => {
    if (searchQuery.trim().length < 1) { setGeocodingResults([]); return; }
    setIsSearchingLocation(true);
    const handler = setTimeout(() => {
      geocodingService.searchAddress(searchQuery, 20)
        .then(r => setGeocodingResults(r))
        .catch(() => setGeocodingResults([]))
        .finally(() => setIsSearchingLocation(false));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Ride Lifecycle Functions
  const orderRide = useCallback(async () => {
    if (!pickup || !dropoff || !pickupCoords || !dropoffCoords) { alert('Please select a location'); return; }
    setIsLoading(true);
    try {
      const origin = { lat: pickupCoords[1], lng: pickupCoords[0], address: pickup };
      const destination = { lat: dropoffCoords[1], lng: dropoffCoords[0], address: dropoff };
      const response = await apiService.requestRide({ origin, destination, payment_method: 'balance' });
      setActiveRide(response.ride);
      setStep('searching');
      socketService.joinRoom(`ride-${response.ride.id}`);
    } catch (e) {
      console.error('Failed to request ride:', e);
      alert('Failed to send request');
    } finally {
      setIsLoading(false);
    }
  }, [pickup, dropoff, pickupCoords, dropoffCoords]);

  const startRide = useCallback(async () => {
    if (!activeRide) return;
    try { await apiService.startRide(activeRide.id); setStep('riding'); }
    catch (e) { console.error('Failed to start ride:', e); }
  }, [activeRide]);

  const finishRide = useCallback(async () => {
    if (!activeRide) return;
    try { await apiService.completeRide(activeRide.id); setStep('done'); }
    catch (e) { console.error('Failed to complete ride:', e); }
  }, [activeRide]);

  // RENDER LOGIC (JSX)
  // ... The rest of your JSX code is unchanged ...
  // It's quite large, so I'm omitting it for brevity, but you should keep it as it was.
  // The fixes were purely in the logic hooks above the JSX.
  if (showMenu) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: C.white, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s ease-out forwards' }}>
        <div style={{ padding: '40px 24px 24px', backgroundColor: C.dark, position: 'relative' }}>
          <button onClick={() => setShowMenu(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
            <XIcon size={20} color={C.white} />
          </button>
          <img src='https://i.imgur.com/fbVmydw.jpeg' style={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'cover', marginBottom: 12 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: 0 }}>{currentUser?.full_name || 'User'}</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {menuItemsRider.map((item, i) => (
            <button key={i} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: 'none', border: 'none', borderBottom: `1px solid ${C.gray100}`, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}><item.icon size={20} /></div>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.gray800 }}>{item.label}</span>
              <ChevronRightIcon size={16} color={C.gray300} style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'search') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: C.white, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s ease-out forwards' }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.gray100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button 
              onClick={() => setStep(pickup || dropoff ? 'route' : 'home')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}
            >
              <XIcon size={20} color={C.gray500} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {searchField === 'pickup' ? 'From where?' : 'To where?'}
            </h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
              <SearchIcon size={18} color={C.gray700} />
            </div>
            <input
              type="text" 
              autoFocus 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Street, number, or place..."
              style={{ 
                width: '100%', 
                backgroundColor: C.gray100, 
                borderRadius: 12, 
                padding: '12px 16px 12px 40px', 
                fontSize: 16, 
                border: 'none', 
                outline: 'none' 
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <button 
            onClick={() => {
              if (openLocationPicker && searchField) {
                openLocationPicker(searchField);
                setStep(pickup || dropoff ? 'route' : 'home');
              }
            }} 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '14px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: `1px solid ${C.gray50}`, 
              cursor: 'pointer' 
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPinIcon size={20} color={C.gray600} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: 500, color: C.gray800 }}>Select on map</span>
              <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>Point on the map</div>
            </div>
          </button>
          
          <button 
            onClick={() => userLocation && selectAddress('My location', userLocation)} 
            disabled={!userLocation} 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '14px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: `1px solid ${C.gray50}`, 
              cursor: 'pointer', 
              opacity: userLocation ? 1 : 0.5 
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPinIcon size={20} color="#3B82F6" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: 500, color: C.info }}>My location</span>
              {userLocation && <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>Current location</div>}
            </div>
          </button>
          {!searchQuery ? (
            <>
              <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1 }}>Recently used</div>
              {recentPlaces.map((p, i) => (
                <button key={i} onClick={() => selectAddress(p.address, p.coords as [number, number])} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${C.gray50}`, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.icon}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.label}</p>
                    <p style={{ fontSize: 12, color: C.gray400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.address}</p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <>
              <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: C.gray400, textTransform: 'uppercase', letterSpacing: 1 }}>
                {isSearchingLocation ? 'Searching...' : `Results (${geocodingResults.length})`}
              </div>
              {geocodingResults.length > 0 && geocodingResults.map((result, i) => (
                <button key={`geo-${i}`} onClick={() => selectGeocodedAddress(result)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${C.gray50}`, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.primary + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPinIcon size={20} color={C.primary} /></div>
                  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{geocodingService.formatAddress(result).split(',')[0]}</p>
                    <p style={{ fontSize: 12, color: C.gray400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {geocodingService.formatAddress(result).split(',').slice(1).join(', ').trim()}
                    </p>
                  </div>
                </button>
              ))}
              {geocodingResults.length === 0 && !isSearchingLocation && (
                <p style={{ textAlign: 'center', color: C.gray400, fontSize: 14, padding: '32px 0' }}>Try searching for a city, street, or place</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ======================== RIDE OPTIONS ========================
  if (showRideOptions) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: C.white, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s ease-out forwards' }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.gray100}`, display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setShowRideOptions(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
            <XIcon size={20} color={C.gray500} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 0 12px' }}>Ride Options</h2>
        </div>
        
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          <div style={{ backgroundColor: C.gray50, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <UsersIcon size={24} color={C.primary} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Ride Sharing</h3>
                <p style={{ fontSize: 12, color: C.gray600, margin: '4px 0 0' }}>Share your ride and save money</p>
              </div>
            </div>
            <button onClick={() => { setRideSharing(!rideSharing); setShowRideOptions(false); }} style={{ width: '100%', padding: '12px 0', borderRadius: 8, backgroundColor: rideSharing ? C.primary : C.white, color: rideSharing ? 'white' : C.primary, border: `1px solid ${C.primary}`, fontWeight: 600, cursor: 'pointer' }}>
              {rideSharing ? 'Enabled - Save 20%' : 'Enable Ride Sharing'}
            </button>
          </div>

          <div style={{ backgroundColor: C.gray50, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <ClockIcon size={24} color={C.warning} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Schedule Ride</h3>
                <p style={{ fontSize: 12, color: C.gray600, margin: '4px 0 0' }}>Book in advance</p>
              </div>
            </div>
            <input type="datetime-local" style={{ width: '100%', padding: '12px', border: `1px solid ${C.gray200}`, borderRadius: 8, fontSize: 14, marginBottom: 12 }} />
            <button onClick={() => { setScheduledRide(true); setShowRideOptions(false); }} style={{ width: '100%', padding: '12px 0', borderRadius: 8, backgroundColor: C.warning, color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
              Schedule Ride
            </button>
          </div>

          <div style={{ backgroundColor: C.gray50, borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <CreditCardIcon size={24} color={C.success} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Split Payment</h3>
                <p style={{ fontSize: 12, color: C.gray600, margin: '4px 0 0' }}>Divide cost with friends</p>
              </div>
            </div>
            <button onClick={() => { setSplitPayment(!splitPayment); setShowRideOptions(false); }} style={{ width: '100%', padding: '12px 0', borderRadius: 8, backgroundColor: splitPayment ? C.success : C.white, color: splitPayment ? 'white' : C.success, border: `1px solid ${C.success}`, fontWeight: 600, cursor: 'pointer' }}>
              {splitPayment ? 'Split Payment Active' : 'Enable Split Payment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================== SAFETY TOOLS ========================
  if (showSafetyTools) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: C.white, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s ease-out forwards' }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.gray100}`, display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setShowSafetyTools(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
            <XIcon size={20} color={C.gray500} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 0 12px' }}>Safety Tools</h2>
        </div>
        
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
          <button style={{ width: '100%', backgroundColor: C.danger, color: 'white', fontWeight: 700, padding: '16px 0', borderRadius: 16, border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ShieldIcon size={24} color="white" />
            Emergency SOS
          </button>

          <div style={{ backgroundColor: C.gray50, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.gray800, marginBottom: 12 }}>Emergency Contacts</h3>
            {emergencyContacts.map((contact, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < emergencyContacts.length - 1 ? `1px solid ${C.gray200}` : 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{contact.name}</p>
                  <p style={{ fontSize: 12, color: C.gray500, margin: 0 }}>{contact.phone}</p>
                </div>
                <button style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                  <PhoneIcon size={16} color="white" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: C.gray50, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.gray800, marginBottom: 12 }}>Safety Features</h3>
            {[
              { icon: ShieldIcon, title: 'Share Trip Status', desc: 'Let friends track your ride' },
              { icon: PhoneIcon, title: 'Emergency Call', desc: 'Quick access to emergency services' },
              { icon: MapPinIcon, title: 'Live Location Sharing', desc: 'Real-time location updates' },
            ].map((feature, i) => (
              <button key={i} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? `1px solid ${C.gray200}` : 'none', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <feature.icon size={20} color={C.gray600} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{feature.title}</p>
                  <p style={{ fontSize: 12, color: C.gray500, margin: 0 }}>{feature.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#FEF3C7', borderRadius: 16, padding: 16, border: '1px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldIcon size={20} color="#F59E0B" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#92400E', margin: 0 }}>Safety Tip</h3>
            </div>
            <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>Always verify driver details and share your trip status with trusted contacts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{enhancedAnimations}</style>
      <div style={{ position: 'absolute', top: 10, left: 16, zIndex: 30 }}>
        <button onClick={() => setShowMenu(true)} style={{ width: 60, height: 60, borderRadius: '10px', backgroundColor: C.white, boxShadow: shadow.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src='https://i.imgur.com/fbVmydw.jpeg' width={53} height={53} style={{ borderRadius: '10px', objectFit: 'cover' }} />
        </button>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, pointerEvents: 'none' }}>
        {step === 'home' && (
          <div style={{ backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: shadow.xl, animation: 'slideUp 0.35s ease-out forwards', pointerEvents: 'auto' }}>
            <div style={{ padding: '20px 16px 12px' }}>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' as const }}>
                {promos.map((p, i) => (
                  <div key={i} style={{ flexShrink: 0, borderRadius: 10, padding: 16, color: C.white, width: 240, background: p.gradient }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{p.title}</p>
                    <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4, margin: 0 }}>{p.sub}</p>
                  </div>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button onClick={() => setShowRideOptions(true)} style={{ flex: 1, backgroundColor: C.gray50, borderRadius: 12, padding: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <UsersIcon size={20} color={C.primary} />
                  <span style={{ fontSize: 12, color: C.gray700, fontWeight: 500 }}>Ride Sharing</span>
                </button>
                <button onClick={() => setShowSafetyTools(true)} style={{ flex: 1, backgroundColor: C.gray50, borderRadius: 12, padding: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <ShieldIcon size={20} color={C.success} />
                  <span style={{ fontSize: 12, color: C.gray700, fontWeight: 500 }}>Safety</span>
                </button>
                <button onClick={() => setScheduledRide(true)} style={{ flex: 1, backgroundColor: C.gray50, borderRadius: 12, padding: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <ClockIcon size={20} color={C.warning} />
                  <span style={{ fontSize: 12, color: C.gray700, fontWeight: 500 }}>Schedule</span>
                </button>
              </div>
            </div>
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ 
                backgroundColor: '#f8fafc', 
                borderRadius: 16, 
                padding: 4,
                border: '1px solid #e2e8f0'
              }}>
                <button 
                  onClick={() => openSearch('pickup')} 
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '14px 16px', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    borderRadius: 12,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6',
                    flexShrink: 0
                  }} />
                  <span style={{ 
                    fontSize: 16, 
                    color: pickup ? '#1f2937' : '#9ca3af', 
                    flex: 1, 
                    textAlign: 'left'
                  }}>
                    {pickup || 'From where?'}
                  </span>
                </button>
                <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '0 16px' }} />
                <button 
                  onClick={() => openSearch('dropoff')} 
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '14px 16px', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    borderRadius: 12,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    backgroundColor: '#ef4444',
                    flexShrink: 0
                  }} />
                  <span style={{ 
                    fontSize: 16, 
                    color: dropoff ? '#1f2937' : '#9ca3af', 
                    flex: 1, 
                    textAlign: 'left'
                  }}>
                    {dropoff || 'To where?'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
        {step === 'route' && (
          <div style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: shadow.xl, animation: 'slideUp 0.35s ease-out forwards', pointerEvents: 'auto' }}>
            <div style={{ padding: '20px 16px 12px' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  <div style={{ width: 2, height: 32, backgroundColor: '#e5e7eb', margin: '8px 0' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button 
                    onClick={() => openSearch('pickup')} 
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      padding: '8px 0', 
                      fontSize: 15, 
                      fontWeight: 500, 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: `1px solid ${C.gray100}`, 
                      cursor: 'pointer', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      color: pickup ? '#1f2937' : '#9ca3af',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = pickup ? '#1f2937' : '#9ca3af';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {pickup || 'From where?'}
                  </button>
                  <button 
                    onClick={() => openSearch('dropoff')} 
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      padding: '8px 0', 
                      fontSize: 15, 
                      fontWeight: 500, 
                      background: 'transparent', 
                      border: 'none', 
                      cursor: 'pointer', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      color: dropoff ? '#1f2937' : '#9ca3af',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = dropoff ? '#1f2937' : '#9ca3af';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {dropoff || 'To where?'}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '8px 0', scrollbarWidth: 'none' as const }}>
                {tariffs.map(t => {
                  const fare = calculatedFare ? calculateTariffFare(calculatedFare, t.id) : t.price;
                  const distance = routeDistance ? Math.round(routeDistance / 100) / 100 : null;
                  return (
                    <button key={t.id} onClick={() => setSelectedTariff(t.id)} style={{ flexShrink: 0, borderRadius: 10,paddingRight:'15px', padding: 5, minWidth: 150, cursor: 'pointer', border: selectedTariff === t.id ? `1px solid #ff933a65` : `1px solid #0000001c`, backgroundColor: selectedTariff === t.id ? '#ff7b000e' : C.white, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flexShrink: 0, borderRadius: 10, padding: 10, marginRight:'5px', backgroundColor: '#00000010' }}><img src={t.icon} alt={t.name} style={{ width: 40, height: 40, objectFit: 'contain' }} /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 100 }}>{t.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 50, color: C.dark, marginTop: 2 }}>₾{fare.toFixed(1)}</div>
                        <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>
                          {distance ? `${distance} km` : t.eta}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: '0 16px 12px' }}>
              {/* Payment Options */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <CreditCardIcon size={15} />
                  <span style={{ fontSize: 14, color: C.gray600 }}>Cash</span>
                  <ChevronRightIcon size={16} color={C.gray300} />
                </button>
                <button onClick={() => setSplitPayment(!splitPayment)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: splitPayment ? C.primary : C.gray50, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                  <UsersIcon size={14} color={splitPayment ? 'white' : C.gray600} />
                  <span style={{ fontSize: 12, color: splitPayment ? 'white' : C.gray600, fontWeight: 500 }}>Split</span>
                </button>
              </div>
              
              {splitPayment && (
                <div style={{ backgroundColor: C.gray50, borderRadius: 8, padding: 8, marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: C.gray600, margin: '0 0 8px' }}>Split with friends</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Number of people" min="2" max="4" style={{ flex: 1, padding: '6px 8px', border: `1px solid ${C.gray200}`, borderRadius: 6, fontSize: 12 }} />
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: C.gray600 }}>
                      {calculatedFare ? `₾${(calculateTariffFare(calculatedFare, selectedTariff) / 2).toFixed(1)}` : '₾0'} each
                    </span>
                  </div>
                </div>
              )}
              
              {rideSharing && (
                <div style={{ backgroundColor: '#EBF5FF', borderRadius: 8, padding: 8, marginBottom: 12, border: '1px solid #3B82F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UsersIcon size={14} color="#3B82F6" />
                    <span style={{ fontSize: 12, color: '#1E40AF', fontWeight: 500 }}>Ride Sharing - Save 20%</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#64748B', margin: '4px 0 0' }}>Share your ride with others going the same way</p>
                </div>
              )}
            </div>
            {pickup && dropoff && (
              <div style={{ padding: '0 16px 24px' }}>
                <button onClick={orderRide} disabled={isLoading} style={{ width: '100%', fontWeight: 700, fontSize: 16, padding: '15px 0', borderRadius: 10, backgroundColor: C.primary, color: C.white, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? 'Sending...' : `Order ${calculatedFare ? calculateTariffFare(calculatedFare, selectedTariff).toFixed(1) : currentTariff.price}₾`}
                </button>
              </div>
            )}
          </div>
        )}
        {step === 'searching' && (
          <div style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: shadow.xl, animation: 'slideUp 0.35s ease-out forwards', padding: '48px 24px', pointerEvents: 'auto', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 20, display: 'inline-block' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: C.primary, opacity: 0.3, animation: 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }} />
              <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', backgroundColor: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchIcon color={C.white} size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Waiting for driver...</h3>
            <p style={{ fontSize: 14, color: C.gray400, marginTop: 4 }}>{currentTariff.name} · {calculatedFare ? calculateTariffFare(calculatedFare, selectedTariff).toFixed(1) : currentTariff.price}₾</p>
            <button onClick={resetAll} style={{ marginTop: 16, fontSize: 14, fontWeight: 500, color: C.danger, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
        {(step === 'found' || step === 'arriving') && (
          <div style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: shadow.xl, animation: 'slideUp 0.35s ease-out forwards', pointerEvents: 'auto' }}>
            <div style={{ padding: '12px 16px', backgroundColor: C.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <p style={{ textAlign: 'center', fontWeight: 700, color: C.white, margin: 0 }}>
                {step === 'found' ? 'Driver found!' : `Driver arriving in ${driverInfo.eta} minutes`}
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: C.gray200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PersonIcon size={32} color={C.gray500} /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, margin: 0 }}>{driverInfo.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StarIcon size={14} color='#FFC107' /><span style={{ fontSize: 14, color: C.gray600 }}>{driverInfo.rating}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}><PhoneIcon size={20} color="#16A34A" /></button>
                  <button style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}><MessageIcon size={20} color="#2563EB" /></button>
                </div>
              </div>
              <div style={{ backgroundColor: C.gray50, borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <CarIcon size={36} color={C.gray700} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{driverInfo.car}, {driverInfo.color}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, margin: 0 }}>{driverInfo.plate}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={resetAll} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `2px solid ${C.gray200}`, backgroundColor: 'transparent', color: C.gray600, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button onClick={startRide} style={{ flex: 1, padding: '12px 0', borderRadius: 12, backgroundColor: C.primary, color: C.white, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>Start Ride</button>
              </div>
            </div>
          </div>
        )}
        {step === 'riding' && (
          <div style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: shadow.xl, animation: 'slideUp 0.35s ease-out forwards', pointerEvents: 'auto' }}>
            <div style={{ padding: '12px 16px', backgroundColor: C.success, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}><p style={{ textAlign: 'center', fontWeight: 700, color: C.white, margin: 0 }}>Ride in progress</p></div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: C.gray200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PersonIcon size={28} color={C.gray500} /></div>
                <div style={{ flex: 1 }}><h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{driverInfo.name}</h3><p style={{ fontSize: 12, color: C.gray500, margin: 0 }}>{driverInfo.car}, {driverInfo.color}</p></div>
                <div style={{ textAlign: 'right' }}><p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{calculatedFare ? calculateTariffFare(calculatedFare, selectedTariff).toFixed(1) : currentTariff.price}₾</p><p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>~15 min</p></div>
              </div>
              <button onClick={finishRide} style={{ width: '100%', padding: '12px 0', backgroundColor: C.primary, borderRadius: 12, border: 'none', cursor: 'pointer' }}><span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Finish Ride</span></button>
            </div>
          </div>
        )}
        {step === 'done' && (
          <div style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: shadow.xl, animation: 'slideUp 0.35s ease-out forwards', padding: 24, pointerEvents: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Ride completed!</h3>
            <p style={{ fontSize: 24, fontWeight: 700, color: C.dark, margin: '8px 0 24px' }}>{calculatedFare ? calculateTariffFare(calculatedFare, selectedTariff).toFixed(1) : currentTariff.price}₾</p>
            <p style={{ fontSize: 14, color: C.gray500, marginBottom: 12 }}>Rate the driver</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} style={{ fontSize: 30, background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.2s' }}>{s <= rating ? '⭐' : '☆'}</button>
              ))}
            </div>
            <button onClick={resetAll} style={{ width: '100%', fontWeight: 700, fontSize: 16, padding: '16px 0', borderRadius: 12, backgroundColor: C.primary, color: C.white, border: 'none', cursor: 'pointer' }}>Back to Home</button>
          </div>
        )}
      </div>
    </>
  );
}