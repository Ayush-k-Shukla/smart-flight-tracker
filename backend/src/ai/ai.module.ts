import { Module } from '@nestjs/common';
import { FlightsModule } from '../flights/flights.module';
import { AiInsightController } from './ai-insight/ai-insight.controller';
import { AiInsightService } from './ai-insight/ai-insight.service';

@Module({
  imports: [FlightsModule],
  providers: [AiInsightService],
  controllers: [AiInsightController],
  exports: [AiInsightService],
})
export class AiModule {}
