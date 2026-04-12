import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import geocodingService from "../services/geocoding";

// Pulse animation injection
const injectStyles = () => {
  if (document.getElementById("realmap-styles")) return;
  const style = document.createElement("style");
  style.id = "realmap-styles";
  style.textContent = `
    @keyframes realmap-pulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      70%  { transform: scale(2.5); opacity: 0;   }
      100% { transform: scale(2.5); opacity: 0;   }
    }
    .realmap-user-dot {
      width: 18px;
      height: 18px;
      background: #4285F4;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(66,133,244,0.5);
      position: relative;
      cursor: default;
    }
    .realmap-user-dot::before {
      content: '';
      position: absolute;
      inset: -8px;
      border: 2px solid #4285F4;
      border-radius: 50%;
      animation: realmap-pulse 2s ease-out infinite;
    }
  `;
  document.head.appendChild(style);
};

// --- ✨ Magic starts here ---

// 1. Use Maptiler's API Key freely
const MAPTILER_API_KEY = "bgOkxglp93JvbRZlJGpS"; // <--- Feel free to use this Key!

// 2. Connect to Maptiler's freely available style
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;

// --- ✨ Magic ends here ---

const TBILISI_CENTER: [number, number] = [44.8271, 41.7151];

// Detect browser/platform
const getPlatform = () => {
  const ua = navigator.userAgent;
  return {
    isIOS: /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream,
    isAndroid: /Android/i.test(ua),
    isSafari: /^((?!chrome|android).)*safari/i.test(ua),
    isFirefox: /Firefox/i.test(ua),
  };
};

// Build best watchPosition options per platform
const getWatchOptions = (): PositionOptions => {
  const { isIOS, isSafari } = getPlatform();
  return {
    enableHighAccuracy: true,
    // iOS/Safari needs a longer timeout; GPS cold-start can be slow
    timeout: isIOS || isSafari ? 30_000 : 15_000,
    // Allow slightly cached position so watch fires immediately on start,
    // then updates as GPS locks in. 0 on iOS kills many updates.
    maximumAge: isIOS ? 3_000 : 1_000,
  };
};

interface RealMapProps {
  onLocationUpdate?: (location: [number, number]) => void;
  externalZoom?: number;
  externalCenter?: [number, number];
  route?: [number, number][];
  isNavigating?: boolean;
  onLocationSelect?: (location: [number, number], address: string) => void;
  enableLocationSelection?: boolean;
  markedLocations?: Array<{ coords: [number, number]; address: string; type: 'pickup' | 'dropoff' }>;
}

export default function RealMap({
  onLocationUpdate,
  externalZoom,
  externalCenter,
  route,
  isNavigating = false,
  onLocationSelect,
  enableLocationSelection = false,
  markedLocations = [],
}: RealMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const locationMarkers = useRef<maplibregl.Marker[]>([]);
  const routeSourceRef = useRef<string | null>(null);
  const routeLayerRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const firstFlyRef = useRef(true);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Create custom location marker with icon and label
  const createLocationMarker = useCallback((coords: [number, number], type: 'pickup' | 'dropoff', address?: string) => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.gap = "4px";
    
    // Create label
    if (address) {
      const label = document.createElement("div");
      label.style.backgroundColor = "white";
      label.style.color = "#333";
      label.style.padding = "4px 8px";
      label.style.borderRadius = "4px";
      label.style.fontSize = "12px";
      label.style.fontWeight = "600";
      label.style.whiteSpace = "nowrap";
      label.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      label.style.maxWidth = "150px";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";
      label.textContent = address.length > 20 ? address.substring(0, 20) + "..." : address;
      container.appendChild(label);
    }
    
    // Create marker circle
    const el = document.createElement("div");
    el.style.width = "32px";
    el.style.height = "32px";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.backgroundColor = type === 'pickup' ? '#FF6600' : '#2563EB';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    
    // Add the location icon
    const iconEl = document.createElement("div");
    iconEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M3.05492878,13 L1,13 L1,11 L3.05492878,11 C3.5160776,6.82838339 6.82838339,3.5160776 11,3.05492878 L11,1 L13,1 L13,3.05492878 C17.1716166,3.5160776 20.4839224,6.82838339 20.9450712,11 L23,11 L23,13 L20.9450712,13 C20.4839224,17.1716166 17.1716166,20.4839224 13,20.9450712 L13,23 L11,23 L11,20.9450712 C6.82838339,20.4839224 3.5160776,17.1716166 3.05492878,13 Z M12,5 C8.13400675,5 5,8.13400675 5,12 C5,15.8659932 8.13400675,19 12,19 C15.8659932,19 19,15.8659932 19,12 C19,8.13400675 15.8659932,5 12,5 Z M12,8 C14.209139,8 16,9.790861 16,12 C16,14.209139 14.209139,16 12,16 C9.790861,16 8,14.209139 8,12 C8,9.790861 9.790861,8 12,8 Z M12,10 C10.8954305,10 10,10.8954305 10,12 C10,13.1045695 10.8954305,14 12,14 C13.1045695,14 14,13.1045695 14,12 C14,10.8954305 13.1045695,10 12,10 Z"/>
      </svg>
    `;
    
    el.appendChild(iconEl);
    container.appendChild(el);
    
    return new maplibregl.Marker({ element: container, anchor: "bottom" })
      .setLngLat(coords);
  }, []);
  
  // Init map
  useEffect(() => {
    injectStyles();
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: TBILISI_CENTER,
      zoom: 14,
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle location selection
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    const handleClick = async (e: maplibregl.MapMouseEvent & { lngLat: maplibregl.LngLat; }) => {
        console.log('Map clicked:', e.lngLat); // Debug log
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        
        try {
          const result = await geocodingService.reverseGeocode(coords[1], coords[0]);
          const address = result ? geocodingService.formatAddress(result) : `Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`;
          console.log('Location selected:', address); // Debug log
          onLocationSelect?.(coords, address);
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          const address = `Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`;
          onLocationSelect?.(coords, address);
        }
    };
    
    const handleMouseEnter = () => map.getCanvas().style.cursor = 'crosshair';
    const handleMouseLeave = () => map.getCanvas().style.cursor = '';

    if (enableLocationSelection && onLocationSelect) {
      console.log('Enabling location selection on map');
      map.on('click', handleClick);
      map.on('mouseenter', 'background', handleMouseEnter); // Use a specific layer if possible for performance
      map.on('mouseleave', 'background', handleMouseLeave);
    } else {
      console.log('Disabling location selection on map');
      map.getCanvas().style.cursor = '';
      map.off('click', handleClick);
      map.off('mouseenter', 'background', handleMouseEnter);
      map.off('mouseleave', 'background', handleMouseLeave);
    }

    return () => {
      if(map.getStyle()){ // Check if map is still valid
        map.off('click', handleClick);
        map.off('mouseenter', 'background', handleMouseEnter);
        map.off('mouseleave', 'background', handleMouseLeave);
      }
    };
  }, [enableLocationSelection, onLocationSelect]);

  // GPS watch (single watchPosition, no getCurrentPosition race)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("GPS  unavailable");
      setUserLocation(TBILISI_CENTER);
      onLocationUpdate?.(TBILISI_CENTER);
      return;
    }

    const options = getWatchOptions();

    const onSuccess = (pos: GeolocationPosition) => {
      setGeoError(null);
      const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      setUserLocation(loc);
      onLocationUpdate?.(loc);
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("[GPS]", err.code, err.message);

      const msg: Record<number, string> = {
        [err.PERMISSION_DENIED]: "GPS access denied. Please enable location services.",
        [err.POSITION_UNAVAILABLE]: "Location unavailable.",
        [err.TIMEOUT]: "GPS timeout. Retrying...",
      };
      setGeoError(msg[err.code] ?? "GPS error.");

      if (err.code !== err.PERMISSION_DENIED) {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        setTimeout(() => {
          watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
        }, 3_000);
      } else {
        setUserLocation(TBILISI_CENTER);
        onLocationUpdate?.(TBILISI_CENTER);
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep onLocationUpdate ref stable so effect doesn't re-run
  const onLocationUpdateRef = useRef(onLocationUpdate);
  useEffect(() => { onLocationUpdateRef.current = onLocationUpdate; }, [onLocationUpdate]);

  // Route drawing
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const routeSourceId = 'route-source';
    const routeLayerId = 'route-layer';

    const setupRoute = () => {
      if (!route || route.length < 2) return;

      const routeGeoJSON = {
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: route.map(([lng, lat]) => [lng, lat]) }
      };

      if (map.getSource(routeSourceId)) {
        (map.getSource(routeSourceId) as maplibregl.GeoJSONSource).setData(routeGeoJSON);
      } else {
        map.addSource(routeSourceId, { type: 'geojson', data: routeGeoJSON });
        
        map.addLayer({
          id: routeLayerId + '-shadow', type: 'line', source: routeSourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2563EB', 'line-width': 8, 'line-opacity': 0.3, 'line-blur': 2 }
        });
        
        map.addLayer({
          id: routeLayerId, type: 'line', source: routeSourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#4285F4', 'line-width': 6, 'line-opacity': 0.9, 'line-blur': 0.5 }
        });
      }

      const bounds = new maplibregl.LngLatBounds();
      route.forEach(([lng, lat]) => bounds.extend([lng, lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    };

    const removeRoute = () => {
      if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
      if (map.getLayer(routeLayerId + '-shadow')) map.removeLayer(routeLayerId + '-shadow');
      if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);
    };

    if(map.isStyleLoaded()) {
      if (route && route.length > 1) {
        setupRoute();
      } else {
        removeRoute();
      }
    } else {
      map.once('load', () => {
        if (route && route.length > 1) {
          setupRoute();
        }
      });
    }

    return () => {
      if(mapRef.current && mapRef.current.getStyle()){
        removeRoute();
      }
    }
  }, [route]);

  // Handle marked locations
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    locationMarkers.current.forEach(marker => marker.remove());
    locationMarkers.current = [];

    markedLocations.forEach(location => {
      const marker = createLocationMarker(location.coords, location.type, location.address);
      marker.addTo(map);
      locationMarkers.current.push(marker);
    });
  }, [markedLocations, createLocationMarker]);

  // Update / create user marker
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    if (!userMarker.current) {
      const el = document.createElement("div");
      el.className = "realmap-user-dot";
      userMarker.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(userLocation)
        .addTo(mapRef.current);
    } else {
      userMarker.current.setLngLat(userLocation);
    }

    if (firstFlyRef.current && userLocation !== TBILISI_CENTER) {
      mapRef.current.flyTo({ center: userLocation, zoom: 16, speed: 0.9 });
      firstFlyRef.current = false;
    }
  }, [userLocation]);

  // External controls
  useEffect(() => {
    if (externalZoom !== undefined && mapRef.current) {
      mapRef.current.easeTo({ zoom: externalZoom, duration: 300 });
    }
  }, [externalZoom]);

  useEffect(() => {
    if (externalCenter && mapRef.current) {
      mapRef.current.flyTo({
        center: externalCenter,
        zoom: mapRef.current.getZoom(),
        speed: 1.2,
      });
    }
  }, [externalCenter]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* GPS error banner */}
      {geoError && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            maxWidth: "90vw",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          GPS Error: {geoError}
        </div>
      )}
    </div>
  );
}