import { Module } from '@nestjs/common';
import { TrackerService } from './tracker/tracker.service';
import { TrackerController } from './tracker/tracker.controller';
import { FlightsModule } from '../flights/flights.module';
import { ProvidersModule } from '../providers/providers.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [FlightsModule, ProvidersModule, ConfigModule],
  controllers: [TrackerController],
  providers: [TrackerService]
})
export class SchedulerModule {}
