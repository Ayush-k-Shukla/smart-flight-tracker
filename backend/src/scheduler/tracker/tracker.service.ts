import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FlightsService } from '../../flights/flights.service';
import { FlightDataService } from '../../providers/flight-data/flight-data.service';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    private flightsService: FlightsService,
    private flightDataService: FlightDataService,
  ) {}

  // Run every 12 hours (adjust as needed)
  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCron() {
    this.logger.debug('Starting scheduled flight price tracker update...');
    await this.updateFlightPrices();
  }

  // Method can be called manually as well (e.g. from a controller or test script)
  async updateFlightPrices() {
    try {
      const activeFlights = await this.flightsService.findAllActive();
      this.logger.debug(`Found ${activeFlights.length} active flights to track.`);

      for (const flight of activeFlights) {
        try {
          const price = await this.flightDataService.getCurrentPrice(
            flight.origin,
            flight.destination,
            flight.departureDate,
          );

          await this.flightsService.addPriceHistory(flight._id, price);
          this.logger.log(`Successfully updated tracking for ${flight.origin}->${flight.destination}: $${price}`);
        } catch (error) {
          this.logger.error(`Failed to update flight ${flight._id}:`, error);
        }
      }
    } catch (e) {
      this.logger.error('Error fetching active flights:', e);
    }
  }
}
