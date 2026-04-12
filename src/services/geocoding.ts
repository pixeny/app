interface GeocodeResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string];
}

interface ReverseGeocodeResult {
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  osm_type: string;
  osm_id: number;
}

class GeocodingService {
  private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  private static lastRequestTime = 0;

  private static async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < 1100) {
      await new Promise(r => setTimeout(r, 1100 - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  static async searchAddress(query: string, limit: number = 15): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      // First: search restricted to Georgia
      await this.throttle();
      const georgiaResults = await this.searchNominatim(query, limit, true);

      if (georgiaResults.length >= 3) {
        return georgiaResults.slice(0, limit);
      }

      // Fallback: global search (no country restriction)
      await this.throttle();
      const globalResults = await this.searchNominatim(query, limit, false);

      // Merge Georgia first, then global, deduplicated
      const merged = [...georgiaResults];
      for (const r of globalResults) {
        const duplicate = merged.some(
          m =>
            Math.abs(parseFloat(m.lat) - parseFloat(r.lat)) < 0.001 &&
            Math.abs(parseFloat(m.lon) - parseFloat(r.lon)) < 0.001
        );
        if (!duplicate) merged.push(r);
      }

      return merged.slice(0, limit);
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  private static async searchNominatim(
    query: string,
    limit: number,
    georgiaOnly: boolean
  ): Promise<GeocodeResult[]> {
    const params: Record<string, string> = {
      q: query.trim(),
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      'accept-language': 'ka,en',
      dedupe: '1',
    };

    if (georgiaOnly) {
      params.countrycodes = 'ge';
    }

    const url = `${this.NOMINATIM_URL}/search?${new URLSearchParams(params)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RideShareApp/1.0 (contact@example.com)',
      },
    });

    if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);

    const results: GeocodeResult[] = await response.json();
    return results.filter(r => r.lat && r.lon && r.display_name);
  }

  static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      await this.throttle();

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'ka,en',
      });

      const response = await fetch(`${this.NOMINATIM_URL}/reverse?${params}`, {
        headers: { 'User-Agent': 'RideShareApp/1.0 (contact@example.com)' },
      });

      if (!response.ok) throw new Error(`Reverse geocode error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  static formatShortLabel(result: GeocodeResult | ReverseGeocodeResult): string {
    const addr = result.address;
    const parts: string[] = [];

    if (addr.house_number && addr.road) {
      parts.push(`${addr.road} ${addr.house_number}`);
    } else if (addr.road) {
      parts.push(addr.road);
    }

    if (addr.suburb && !parts.join('').includes(addr.suburb)) {
      parts.push(addr.suburb);
    }

    if (addr.city && !parts.join('').includes(addr.city)) {
      parts.push(addr.city);
    }

    return parts.join(', ') || result.display_name?.split(',')[0] || 'Unknown';
  }

  static formatAddress(result: GeocodeResult | ReverseGeocodeResult): string {
    return result.display_name || this.formatShortLabel(result);
  }

  static formatSubLabel(result: GeocodeResult | ReverseGeocodeResult): string {
    const addr = result.address;
    const parts: string[] = [];
    if (addr.city) parts.push(addr.city);
    if (addr.country && addr.country_code !== 'ge') parts.push(addr.country);
    return parts.join(', ');
  }

  static getCoordinates(result: GeocodeResult | ReverseGeocodeResult): [number, number] {
    return [parseFloat(result.lon), parseFloat(result.lat)];
  }

  static isGeorgia(result: GeocodeResult | ReverseGeocodeResult): boolean {
    return result.address?.country_code === 'ge';
  }
}

export default GeocodingService;