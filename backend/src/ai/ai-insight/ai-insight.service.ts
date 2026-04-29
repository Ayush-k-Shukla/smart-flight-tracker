import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HolidayContext,
  HolidayContextService,
} from '../holiday-context.service';

@Injectable()
export class AiInsightService {
  private readonly logger = new Logger(AiInsightService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private holidayContextService: HolidayContextService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        'No valid GEMINI_API_KEY found. AI Insights will return mock data.',
      );
    }
  }

  private buildPrompt(
    flightDetails: any,
    priceHistory: any[],
    holidayContext: HolidayContext,
  ): string {
    const latestPrice = priceHistory[priceHistory.length - 1]?.price ?? 0;
    const averagePrice =
      priceHistory.reduce((sum, record) => sum + record.price, 0) /
      Math.max(priceHistory.length, 1);
    const departureDate = new Date(flightDetails.departureDate);
    const today = new Date();
    const timeToFly = Math.max(
      0,
      Math.ceil(
        (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const priceDifference = latestPrice - averagePrice;
    const premiumText =
      priceDifference > 0
        ? `The current price is ₹${Math.round(priceDifference)} above the average.`
        : `The current price is ₹${Math.round(Math.abs(priceDifference))} below the average.`;

    const holidaySection = holidayContext.highDemand
      ? `Holidays: ${holidayContext.summary}`
      : 'Holidays: No major holidays were found within ±2 days of departure or return.';

    const travelWindow = flightDetails.returnDate
      ? `Departure Date: ${flightDetails.departureDate}\nReturn Date: ${flightDetails.returnDate}`
      : `Departure Date: ${flightDetails.departureDate}`;

    return `Current Context:
Route: ${flightDetails.origin} -> ${flightDetails.destination}
${travelWindow}
Price: ₹${latestPrice} (Standard Avg: ₹${Math.round(averagePrice)})
Time to Fly: ${timeToFly} day${timeToFly === 1 ? '' : 's'}
${holidaySection}

Price History (Chronological):
${priceHistory
  .map(
    (p) => `- ${new Date(p.fetchedAt).toISOString().slice(0, 10)}: ₹${p.price}`,
  )
  .join('\n')}

Task: Analyze whether the current price is worth buying now or waiting. ${premiumText} Please explain the risk of waiting given holiday and demand signals.

Return ONLY valid JSON in the exact format below with no additional commentary:
{
  "recommendation": "Buy Now" | "Wait",
  "explanation": "Short 1-2 sentence explanation of your reasoning based on the latest trend and holiday demand."
}`;
  }

  private parseJsonResponse(responseText: string): any {
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch {
        // fall through to final parse attempt
      }
    }

    return JSON.parse(cleaned);
  }

  async getRecommendation(
    flightDetails: any,
    priceHistory: any[],
  ): Promise<any> {
    const holidayContext = this.holidayContextService.getHolidayContext(
      flightDetails.origin,
      flightDetails.destination,
      flightDetails.departureDate,
      flightDetails.returnDate,
    );

    if (!this.genAI) {
      return {
        recommendation: 'Wait',
        explanation:
          'Mock mode: We lack historical data to suggest buying right now. Please supply a Gemini API Key for real recommendations.',
        holidayContext,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });

      const prompt = this.buildPrompt(
        flightDetails,
        priceHistory,
        holidayContext,
      );
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        const recommendation = this.parseJsonResponse(responseText);
        return {
          ...recommendation,
          holidayContext,
        };
      } catch (parseError) {
        this.logger.error(
          'Could not parse Gemini response as JSON. Response text:',
          responseText,
        );
        throw parseError;
      }
    } catch (e) {
      this.logger.error('Error fetching Gemini AI recommendation:', e);
      return {
        recommendation: 'Error',
        explanation:
          'Could not fetch recommendation at this time due to an API error.',
        holidayContext,
      };
    }
  }
}
