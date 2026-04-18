import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface FlightDataResponse {
  price: number;
  airline?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: number;
}

@Injectable()
export class FlightDataService {
  private readonly logger = new Logger(FlightDataService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Fetches the current flight price and details.
   * If SERPAPI_KEY is missing, it throws an error.
   */
  async getCurrentPrice(origin: string, destination: string, departureDate: string): Promise<FlightDataResponse> {
    const apiKey = this.configService.get<string>('SERPAPI_KEY');

    if (!apiKey || apiKey === 'your_serpapi_key_here') {
      throw new Error(`No valid SerpApi key found for ${origin} -> ${destination} on ${departureDate}.`);
    }

    try {
      this.logger.debug(`Fetching real price via SerpApi for ${origin} -> ${destination} on ${departureDate}`);
      const response = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_flights',
          departure_id: origin,
          arrival_id: destination,
          outbound_date: departureDate, // Expected format YYYY-MM-DD
          currency: 'INR',
          hl: 'en',
          api_key: apiKey,
          type: '2', // for one way, 1 for round trip, 3 for multi-city
        },
      });

      const data = response.data;

      const extractDetails = (flightDoc: any): FlightDataResponse => {
        const result: FlightDataResponse = { price: flightDoc.price };
        if (flightDoc.flights && flightDoc.flights.length > 0) {
          const leg = flightDoc.flights[0];
          result.airline = leg.airline;
          result.flightNumber = leg.flight_number;
          result.duration = leg.duration;
          if (leg.departure_airport && leg.departure_airport.time) {
            result.departureTime = leg.departure_airport.time;
          }
          if (leg.arrival_airport && leg.arrival_airport.time) {
            result.arrivalTime = leg.arrival_airport.time;
          }
        }
        return result;
      };

      // Extract details from best_flights
      if (data.best_flights && data.best_flights.length > 0 && typeof data.best_flights[0].price === 'number') {
        return extractDetails(data.best_flights[0]);
      }

      // Extract details from other_flights if best_flights is unavailable
      if (data.other_flights && data.other_flights.length > 0 && typeof data.other_flights[0].price === 'number') {
        return extractDetails(data.other_flights[0]);
      }

      throw new Error(`No price data found in SerpApi response for ${origin} -> ${destination}.`);
    } catch (error: any) {
      this.logger.error(`Error fetching from SerpApi for ${origin} -> ${destination}: ${error.message}`);
      throw error;
    }
  }
}
