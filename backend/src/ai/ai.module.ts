import { Module } from '@nestjs/common';
import { AiInsightService } from './ai-insight/ai-insight.service';
import { AiInsightController } from './ai-insight/ai-insight.controller';
import { FlightsModule } from '../flights/flights.module';

@Module({
  imports: [FlightsModule],
  providers: [AiInsightService],
  controllers: [AiInsightController]
})
export class AiModule {}
