import { Module } from '@nestjs/common';
import { FlightsModule } from '../flights/flights.module';
import { AiInsightController } from './ai-insight/ai-insight.controller';
import { AiInsightService } from './ai-insight/ai-insight.service';
import { HolidayContextService } from './holiday-context.service';

@Module({
  imports: [FlightsModule],
  providers: [AiInsightService, HolidayContextService],
  controllers: [AiInsightController],
  exports: [AiInsightService],
})
export class AiModule {}
