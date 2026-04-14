import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  async create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  async findAll() {
    return this.flightsService.findAllActive();
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.flightsService.getPriceHistory(id);
  }
}
