interface RoutePoint {
  lng: number;
  lat: number;
}

interface RouteResponse {
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    legs: Array<{
      distance: number;
      duration: number;
    }>;
  }>;
}

class RoutingService {
  private static readonly OSRM_URL = 'https://router.project-osrm.org';

  static async calculateRoute(points: RoutePoint[]): Promise<[number, number][] | null> {
    if (points.length < 2) return null;

    try {
      // Build coordinates string for OSRM API
      const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
      const url = `${this.OSRM_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Routing request failed: ${response.status}`);
      }

      const data: RouteResponse = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Return the geometry coordinates of the first route
        return data.routes[0].geometry.coordinates as [number, number][];
      }
      
      return null;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  }

  static async getRouteDistance(points: RoutePoint[]): Promise<{ distance: number; duration: number } | null> {
    if (points.length < 2) return null;

    try {
      const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
      const url = `${this.OSRM_URL}/route/v1/driving/${coordinates}?overview=false`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Routing request failed: ${response.status}`);
      }

      const data: RouteResponse = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance, 0);
        const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration, 0);
        
        return {
          distance: totalDistance,
          duration: totalDuration
        };
      }
      
      return null;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  }

  // Fallback method for when routing service fails
  static createStraightLineRoute(points: RoutePoint[]): [number, number][] {
    return points.map(p => [p.lng, p.lat]);
  }
}

export default RoutingService;
