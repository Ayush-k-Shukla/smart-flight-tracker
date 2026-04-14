import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { FlightsService } from '../../flights/flights.service';
import { AiInsightService } from './ai-insight.service';

@Controller('ai-insight')
export class AiInsightController {
  constructor(
    private readonly aiInsightService: AiInsightService,
    private readonly flightsService: FlightsService
  ) {}

  @Get(':flightId')
  async getInsight(
    @Param('flightId') flightId: string,
    @Query('forceRefresh') forceRefresh?: string
  ) {
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

    const isForceRefresh = forceRefresh === 'true';

    // 1. Return cached insight if available and not forced to refresh
    if (!isForceRefresh && flight.lastInsightGeneratedAt && flight.aiRecommendation) {
      return {
        recommendation: flight.aiRecommendation,
        explanation: flight.aiExplanation,
        generatedAt: flight.lastInsightGeneratedAt
      };
    }

    // 2. Generate new insight
    const newInsight = await this.aiInsightService.getRecommendation(flight, priceHistory);

    // 3. Save to database if successful
    if (newInsight.recommendation !== 'Error') {
      flight.aiRecommendation = newInsight.recommendation;
      flight.aiExplanation = newInsight.explanation;
      flight.lastInsightGeneratedAt = new Date();

      await this.flightsService.updateFlight(new Types.ObjectId(flight._id), {
        aiRecommendation: flight.aiRecommendation,
        aiExplanation: flight.aiExplanation,
        lastInsightGeneratedAt: flight.lastInsightGeneratedAt
      });
    }

    return {
      ...newInsight,
      generatedAt: flight.lastInsightGeneratedAt || new Date()
    };
  }
}
