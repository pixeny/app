interface FareCalculationOptions {
  distance: number; // in meters
  baseFare?: number; // base fare in GEL
  pricePerKilometer?: number; // price per kilometer in GEL
  minimumFare?: number; // minimum fare in GEL
}

class FareService {
  private static readonly DEFAULT_BASE_FARE = 3.5; // 3.5 GEL base fare
  private static readonly DEFAULT_PRICE_PER_KILOMETER = 1.9; // 1.9 GEL per km
  private static readonly DEFAULT_MINIMUM_FARE = 5.0; // 5 GEL minimum fare

  /**
   * Calculate fare based on distance
   * @param options - Fare calculation options
   * @returns Calculated fare in GEL
   */
  static calculateFare(options: FareCalculationOptions): number {
    const {
      distance,
      baseFare = this.DEFAULT_BASE_FARE,
      pricePerKilometer = this.DEFAULT_PRICE_PER_KILOMETER,
      minimumFare = this.DEFAULT_MINIMUM_FARE
    } = options;

    // Convert distance from meters to kilometers
    const distanceInKm = distance / 1000;

    // Calculate fare: base fare + (distance × price per km)
    const calculatedFare = baseFare + (distanceInKm * pricePerKilometer);

    // Ensure minimum fare is applied
    return Math.max(calculatedFare, minimumFare);
  }

  /**
   * Calculate fare with formatted string
   * @param options - Fare calculation options
   * @returns Formatted fare string (e.g., "12.50 GEL")
   */
  static calculateFormattedFare(options: FareCalculationOptions): string {
    const fare = this.calculateFare(options);
    return `${fare.toFixed(2)} GEL`;
  }

  /**
   * Get fare breakdown details
   * @param options - Fare calculation options
   * @returns Detailed fare breakdown
   */
  static getFareBreakdown(options: FareCalculationOptions): {
    baseFare: number;
    distanceFare: number;
    totalFare: number;
    distanceInKm: number;
  } {
    const {
      distance,
      baseFare = this.DEFAULT_BASE_FARE,
      pricePerKilometer = this.DEFAULT_PRICE_PER_KILOMETER,
      minimumFare = this.DEFAULT_MINIMUM_FARE
    } = options;

    const distanceInKm = distance / 1000;
    const distanceFare = distanceInKm * pricePerKilometer;
    const calculatedFare = baseFare + distanceFare;
    const totalFare = Math.max(calculatedFare, minimumFare);

    return {
      baseFare,
      distanceFare,
      totalFare,
      distanceInKm: Math.round(distanceInKm * 100) / 100 // Round to 2 decimal places
    };
  }
}

export default FareService;
