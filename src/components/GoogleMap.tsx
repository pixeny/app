import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";
const DESTINATION: [number, number] = [44.8151, 41.7251];

export default function GoogleMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const userMarker = useRef<google.maps.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // 🚀 Load Google Maps ONCE
  useEffect(() => {
    const loadScript = () => {
      if (window.google) return initMap();

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;

      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current) return;

      mapRef.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: 41.7151, lng: 44.8271 },
        zoom: 14,
        disableDefaultUI: true,
      });

      // destination marker
      new window.google.maps.Marker({
        position: { lat: DESTINATION[1], lng: DESTINATION[0] },
        map: mapRef.current,
      });
    };

    loadScript();
  }, []);

  // 📍 GPS (OPTIMIZED)
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setUserLocation(coords);
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 👤 Update Marker (NO LAG)
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    const lat = userLocation[1];
    const lng = userLocation[0];

    // create marker ONCE
    if (!userMarker.current) {
      userMarker.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // center ONLY first time
      mapRef.current.setCenter({ lat, lng });
      mapRef.current.setZoom(15);
    } else {
      // update position ONLY (no pan/zoom spam)
      userMarker.current.setPosition({ lat, lng });
    }
  }, [userLocation]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}