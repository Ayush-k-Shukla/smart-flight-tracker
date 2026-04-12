import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { Flight, FlightSchema } from './schemas/flight.schema';
import { PriceHistory, PriceHistorySchema } from './schemas/price-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flight.name, schema: FlightSchema },
      { name: PriceHistory.name, schema: PriceHistorySchema },
    ]),
  ],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService]
})
export class FlightsModule {}
