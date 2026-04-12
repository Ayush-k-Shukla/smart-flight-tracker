import { Module } from '@nestjs/common';
import { FlightDataService } from './flight-data/flight-data.service';

@Module({
  providers: [FlightDataService],
  exports: [FlightDataService]
})
export class ProvidersModule {}
