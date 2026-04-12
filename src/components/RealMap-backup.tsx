import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPTILER_KEY = "bgOkxglp93JvbRZlJGpS";
const DESTINATION = [44.8151, 41.7251]; // [lng, lat] — რუსთაველის გამზირდამდე

export default function RealMap({ 
  zoom = 14, 
  center = [44.8271, 41.7151], 
  userLocation,
  showUserLocation = true,
  onLocationUpdate,
  route,
  showRoute = false
}: {
  zoom?: number;
  center: [number, number];
  userLocation?: [number, number];
  showUserLocation?: boolean;
  onLocationUpdate?: (location: [number, number]) => void;
  route?: [number, number][];
  showRoute?: boolean;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 📍 User location marker
  useEffect(() => {
    if (!showUserLocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLocation: [number, number] = [longitude, latitude];
        onLocationUpdate?.(newLocation);
      },
      (err) => console.warn("GPS error:", err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 🗺️ რუქის ინიციალიზაცია
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: [44.8271, 41.7151], // [lng, lat] — თბილისი
        zoom: 14,
        pitch: 45,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
      });

    } catch (error) {
      console.error("Map initialization error:", error);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // 📍 მარკერები და ცენტრირება
  useEffect(() => {
    if (!userLocation || !mapLoaded || !map.current) return;

    // Flying to user location
    map.current.flyTo({ center: userLocation, zoom: 16, speed: 0.8 });

    // User location marker
    const userMarker = document.createElement("div");
    userMarker.style.width = "20px";
    userMarker.style.height = "20px";
    userMarker.style.backgroundColor = "#4285F4";
    userMarker.style.borderRadius = "50%";
    userMarker.style.border = "3px solid white";
    userMarker.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

    new maplibregl.Marker({ element: userMarker })
      .setLngLat(userLocation)
      .addTo(map.current);

    // დანიშნულების მარკერი
    const destMarker = document.createElement("div");
    destMarker.style.width = "24px";
    destMarker.style.height = "24px";
    destMarker.style.backgroundColor = "#FF6600";
    destMarker.style.borderRadius = "50%";
    destMarker.style.border = "3px solid white";
    destMarker.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

    new maplibregl.Marker({ element: destMarker })
      .setLngLat(DESTINATION)
      .addTo(map.current);
  }, [userLocation, mapLoaded]);

  // 🧭 მარშრუტი
  useEffect(() => {
    if (!userLocation || !mapLoaded || !map.current || !showRoute) return;

    const drawRoute = (coords: number[][]) => {
      try {
        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        };

        if (map.current!.getSource("route")) {
          (map.current!.getSource("route") as maplibregl.GeoJSONSource).setData(geojson);
        } else {
          map.current!.addSource("route", { type: "geojson", data: geojson });
          map.current!.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#FF6600",
              "line-width": 5,
              "line-opacity": 0.85,
            },
          });
        }
      } catch (err) {
        console.error("მარშრუტის შეცდომა:", err);
      }
    };

    // თუ მარშრუტი მოცემულია props-დან, გამოვიყენოთ ის
    if (route && route.length > 0) {
      drawRoute(route);
      return;
    }

    // სხვაგვარად, ცადოთ API-დან მიღება
    const fetchRoute = async () => {
      try {
        const [uLng, uLat] = userLocation;
        const [dLng, dLat] = DESTINATION;

        const url = `https://api.maptiler.com/directions/v2/driving/${uLng},${uLat};${dLng},${dLat}?key=${MAPTILER_KEY}`;
        
        console.log("Fetching route from:", url);
        const res = await fetch(url);

        if (!res.ok) {
          console.error("მარშრუტის API შეცდომა:", res.status);
          // შევქმნათ მარტივი მარშრუტი
          const simpleRoute = [[uLng, uLat], [dLng, dLat]];
          drawRoute(simpleRoute);
          return;
        }

        const data = await res.json();
        const coords = data.routes?.[0]?.geometry?.coordinates;

        if (!coords) {
          console.warn("მარშრუტი ვერ მოიძებნა");
          const simpleRoute = [[uLng, uLat], [dLng, dLat]];
          drawRoute(simpleRoute);
          return;
        }

        drawRoute(coords);
      } catch (error) {
        console.error("მარშრუტის ფეტჩის შეცდომა:", error);
        const [uLng, uLat] = userLocation;
        const [dLng, dLat] = DESTINATION;
        const simpleRoute = [[uLng, uLat], [dLng, dLat]];
        drawRoute(simpleRoute);
      }
    };

    fetchRoute();
  }, [userLocation, mapLoaded, showRoute, route]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}
