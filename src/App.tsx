import { useState, useEffect, useCallback } from 'react';
import RealMap from './components/RealMap';
import RiderPanel from './components/RiderPanel';
import DriverPanel from './components/DriverPanel';
import AuthModal from './components/AuthModal';
import { C, shadow, s } from './styles';
import apiService from './services/api';
import socketService from './services/socket';

export default function App() {
  const [mapZoom, setMapZoom] = useState(14);
  const [mapCenter, setMapCenter] = useState<[number, number]>([44.827, 41.721]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationRoute, setNavigationRoute] = useState<[number, number][]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [enableMapSelection, setEnableMapSelection] = useState(false);
  const [markedLocations, setMarkedLocations] = useState<Array<{ coords: [number, number]; address: string; type: 'pickup' | 'dropoff' }>>([]);
  const [isLocationButtonHovered, setIsLocationButtonHovered] = useState(false);
  
  const handleLocationUpdate = (location: [number, number]) => {
    setUserLocation(location);
    // Don't automatically recenter on location updates
    // Let user control the map manually
    // Only recenter when explicitly requested (like clicking location button)
  };

  const [currentSelectionField, setCurrentSelectionField] = useState<'pickup' | 'dropoff' | null>(null);

  const updateMarkedLocations = useCallback((pickup: string, dropoff: string, pickupCoords?: [number, number], dropoffCoords?: [number, number]) => {
    console.log('updateMarkedLocations called:', { pickup, dropoff, pickupCoords, dropoffCoords });
    
    // Force clear all locations first
    setMarkedLocations([]);
    
    setTimeout(() => {
      const locations = [];
      
      // Only add markers if we have real coordinates
      if (pickup && pickupCoords) {
        console.log('Adding pickup marker at REAL coords:', pickupCoords);
        locations.push({
          coords: pickupCoords,
          address: pickup,
          type: 'pickup' as const
        });
      } else if (pickup) {
        console.log('No pickup coordinates available - skipping marker');
      }
      
      if (dropoff && dropoffCoords) {
        console.log('Adding dropoff marker at REAL coords:', dropoffCoords);
        locations.push({
          coords: dropoffCoords,
          address: dropoff,
          type: 'dropoff' as const
        });
      } else if (dropoff) {
        console.log('No dropoff coordinates available - skipping marker');
      }
      
      console.log('Final marked locations:', locations);
      setMarkedLocations(locations);
    }, 50);
  }, []);

  const handleLocationSelect = (location: [number, number], address: string) => {
    console.log('Selected location:', location, address);
    setMapCenter(location);
    setMapZoom(16);
    
    // Update the appropriate field based on currentSelectionField
    if (currentSelectionField === 'pickup' || currentSelectionField === 'dropoff') {
      // Find the RiderPanel component and update its state
      const event = new CustomEvent('locationSelected', {
        detail: { field: currentSelectionField, coords: location, address }
      });
      window.dispatchEvent(event);
      
      // Disable map selection after selecting
      setEnableMapSelection(false);
      setCurrentSelectionField(null);
    }
  };

  const openLocationPicker = (field: 'pickup' | 'dropoff') => {
    setCurrentSelectionField(field);
    // Directly enable map selection without showing the modal
    setEnableMapSelection(true);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuthModal(false); // Close modal after successful login
    
    // Connect to socket if user is authenticated
    const token = apiService.getToken();
    if (token) {
      socketService.connect(token);
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    socketService.disconnect();
    setCurrentUser(null);
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      // Validate token and get user info
      apiService.getProfile()
        .then(user => {
          handleAuthSuccess(user);
        })
        .catch(() => {
          // Token is invalid, clear it
          handleLogout();
        });
    }
  }, []);

  const startNavigation = (route: [number, number][]) => {
    console.log('startNavigation called with route:', route);
    console.log('Route length:', route.length);
    setIsNavigating(true);
    setNavigationRoute(route);
    if (route.length > 0) {
      // Only set center when starting navigation, not continuously
      setMapCenter(route[0]);
    }
    console.log('Navigation state set to true, route set');
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationRoute([]);
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: C.bg }}>
       {/* Map */}
       <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
         <RealMap 
           onLocationUpdate={handleLocationUpdate}
           externalZoom={mapZoom}
           externalCenter={mapCenter}
           route={navigationRoute}
           isNavigating={isNavigating}
           onLocationSelect={handleLocationSelect}
           enableLocationSelection={enableMapSelection}
           markedLocations={markedLocations}
         />
       </div>

     

      {/* Auth button - show when not logged in */}
      {!currentUser && (
        <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 40 }}>
          <button 
            onClick={() => setShowAuthModal(true)}
            style={{ 
              ...s.btnPrimary,
              padding: '10px 20px',
              boxShadow: `0 2px 8px ${C.primary}40`
            }}
          >
            Login
          </button>
        </div>
      )}

      {/* User info & logout */}
      {currentUser && (
        <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 40 }}>
          <div style={{ 
            ...s.card,
            padding: '12px 16px', 
            boxShadow: shadow.lg,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.gray800 }}>
                {currentUser.full_name}
              </div>
              <div style={{ fontSize: 12, color: C.gray500 }}>
                {currentUser.role === 'rider' ? 'Rider' : 'Driver'}
                {currentUser.balance !== undefined && ` • ${currentUser.balance}₾`}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                ...s.btnSecondary,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      
      {/* Map selection indicator */}
      {enableMapSelection && (
        <div style={{
          position: 'absolute',
          top: 102,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor:'#ffffffff',
          color: C.dark,
          padding: '8px 16px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          zIndex: 100,
        }}>
          {currentSelectionField === 'pickup' ? 'Select pickup location' : 'Select dropoff location'}
        </div>
      )}

      {/* Map controls - top right */}
      <div style={{ 
        position: 'absolute', 
        right: 20, 
        top: 180, 
        zIndex: 60, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2
      }}>
        {/* Zoom in button */}
        <button 
          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
          style={{
            width: 36,
            height: 36,
            backgroundColor: C.white,
            border: 'none',
            borderRadius: '8px 8px 0 0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 600,
            color: C.gray700,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = C.gray50;
            e.currentTarget.style.color = C.gray900;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = C.white;
            e.currentTarget.style.color = C.gray700;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = C.gray100;
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >+</button>

        {/* Zoom out button */}
        <button 
          onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
          style={{
            width: 36,
            height: 36,
            backgroundColor: C.white,
            border: 'none',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 600,
            color: C.gray700,
            transition: 'all 0.2s ease',
            outline: 'none',
            borderTop: '1px solid rgba(229, 231, 235, 0.8)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = C.gray50;
            e.currentTarget.style.color = C.gray900;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = C.white;
            e.currentTarget.style.color = C.gray700;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = C.gray100;
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >-</button>

        {/* Spacer */}
        <div style={{ height: 12 }} />

        

        {/* Spacer */}
        <div style={{ height: 12 }} />

        {/* Location button */}
        <button 
          onClick={() => {
            if (userLocation) {
              setMapCenter(userLocation);
              setMapZoom(16);
            }
          }}
          disabled={!userLocation}
          className={isLocationButtonHovered && userLocation ? 'location-button-hovered' : ''}
          style={{
            width: 36,
            height: 36,
            backgroundColor: userLocation ? C.white : C.gray100,
            border: 'none',
            borderRadius: '50%',
            boxShadow: userLocation ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: userLocation ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            outline: 'none',
            opacity: userLocation ? 1 : 0.5
          }}
          title="My location"
          onMouseEnter={() => setIsLocationButtonHovered(true)}
                            >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.gray700}>
            <path d="M12 2c-4.4 0-8 3.6-8 8 0 5.4 7 11.5 7.3 11.8.2.1.5.2.7.2.2 0 .5-.1.7-.2.3-.3 7.3-6.4 7.3-11.8 0-4.4-3.6-8-8-8zm0 17.7c-2.1-2-6-6.3-6-9.7 0-3.3 2.7-6 6-6s6 2.7 6 6-3.9 7.7-6 9.7zM12 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill={C.gray700}/>
          </svg>
        </button>
      </div>

      {/* Panels - only show for authenticated users */}
      {currentUser && (
        currentUser.role === 'rider' ? 
          <RiderPanel 
            userLocation={userLocation}
            onStartNavigation={startNavigation}
            onStopNavigation={stopNavigation}
            isNavigating={isNavigating}
            openLocationPicker={openLocationPicker}
            updateMarkedLocations={updateMarkedLocations}
            currentUser={currentUser}
          /> : 
          <DriverPanel 
            userLocation={userLocation}
            onStartNavigation={startNavigation}
            onStopNavigation={stopNavigation}
          />
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      
          </div>
  );
}
