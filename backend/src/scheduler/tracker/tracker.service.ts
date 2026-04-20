import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiInsightService } from '../../ai/ai-insight/ai-insight.service';
import { FlightsService } from '../../flights/flights.service';
import { FlightDataService } from '../../providers/flight-data/flight-data.service';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    private flightsService: FlightsService,
    private flightDataService: FlightDataService,
    private aiInsightService: AiInsightService,
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
      this.logger.debug(
        `Found ${activeFlights.length} active flights to track.`,
      );

      for (const flight of activeFlights) {
        try {
          const flightData = await this.flightDataService.getCurrentPrice(
            flight.origin,
            flight.destination,
            flight.departureDate,
          );

          await this.flightsService.addPriceHistory(flight._id, flightData);
          this.logger.log(
            `Successfully updated tracking for ${flight.origin}->${flight.destination}: ₹${flightData.price}`,
          );

          // Regenerate AI insight after updating price data
          try {
            const priceHistory = await this.flightsService.getPriceHistory(
              flight._id.toString(),
            );
            const aiRecommendation =
              await this.aiInsightService.getRecommendation(
                {
                  origin: flight.origin,
                  destination: flight.destination,
                  departureDate: flight.departureDate,
                },
                priceHistory,
              );

            await this.flightsService.updateFlight(flight._id, {
              aiRecommendation: aiRecommendation.recommendation,
              aiExplanation: aiRecommendation.explanation,
              lastInsightGeneratedAt: new Date(),
            });

            this.logger.log(
              `Successfully updated AI insight for ${flight.origin}->${flight.destination}: ${aiRecommendation.recommendation}`,
            );
          } catch (aiError) {
            this.logger.error(
              `Failed to generate AI insight for flight ${flight._id}:`,
              aiError,
            );
          }
        } catch (error) {
          this.logger.error(`Failed to update flight ${flight._id}:`, error);
        }
      }
    } catch (e) {
      this.logger.error('Error fetching active flights:', e);
    }
  }
}
