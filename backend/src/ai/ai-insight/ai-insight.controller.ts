import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AiInsightService } from './ai-insight.service';
import { FlightsService } from '../../flights/flights.service';

@Controller('ai-insight')
export class AiInsightController {
  constructor(
    private readonly aiInsightService: AiInsightService,
    private readonly flightsService: FlightsService
  ) {}

  @Get(':flightId')
  async getInsight(@Param('flightId') flightId: string) {
    const flight = await this.flightsService.getFlight(flightId);
    if (!flight) {
      throw new HttpException('Flight not found', HttpStatus.NOT_FOUND);
    }

    const priceHistory = await this.flightsService.getPriceHistory(flightId);
    if (priceHistory.length === 0) {
      return {
        recommendation: 'Wait',
        explanation: 'Not enough price history tracked yet to make a reliable recommendation.'
      };
    }

    return await this.aiInsightService.getRecommendation(flight, priceHistory);
  }
}
