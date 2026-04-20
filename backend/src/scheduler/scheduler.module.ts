import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { FlightsModule } from '../flights/flights.module';
import { ProvidersModule } from '../providers/providers.module';
import { TrackerController } from './tracker/tracker.controller';
import { TrackerService } from './tracker/tracker.service';

@Module({
  imports: [FlightsModule, ProvidersModule, ConfigModule, AiModule],
  controllers: [TrackerController],
  providers: [TrackerService],
})
export class SchedulerModule {}
