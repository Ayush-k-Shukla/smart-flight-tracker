import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiInsightService {
  private readonly logger = new Logger(AiInsightService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        'No valid GEMINI_API_KEY found. AI Insights will return mock data.',
      );
    }
  }

  async getRecommendation(
    flightDetails: any,
    priceHistory: any[],
  ): Promise<any> {
    if (!this.genAI) {
      return {
        recommendation: 'Wait',
        explanation:
          'Mock mode: We lack historical data to suggest buying right now. Please supply a Gemini API Key for real recommendations.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });

      const prompt = `
        You are an expert flight tracking AI. Given the following flight details and price history,
        your job is to recommend whether the user should "BUy Now" or "Wait". Provide a short explanation.

        Flight Route: ${flightDetails.origin} to ${flightDetails.destination}
        Departure Date: ${flightDetails.departureDate}

        Price History (Chronological):
        ${priceHistory.map((p) => `- ${p.fetchedAt}: $${p.price}`).join('\n')}

        Return JSON strictly in this format:
        {
          "recommendation": "Buy Now" | "Wait",
          "explanation": "Short 1-2 sentence explanation of your reasoning based on the latest trend."
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean possible Markdown JSON formatting
      const cleanJsonStr = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleanJsonStr);
    } catch (e) {
      this.logger.error('Error fetching Gemini AI recommendation:', e);
      return {
        recommendation: 'Error',
        explanation:
          'Could not fetch recommendation at this time due to an API error.',
      };
    }
  }
}
