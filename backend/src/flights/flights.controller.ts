import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightsService } from './flights.service';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flight to track' })
  @ApiResponse({ status: 201, description: 'The flight has been successfully created.' })
  async create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active flights being tracked' })
  @ApiResponse({ status: 200, description: 'Return all active flights.' })
  async findAll() {
    return this.flightsService.findAllActive();
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get price history for a specific flight' })
  @ApiResponse({ status: 200, description: 'Return price history.' })
  @ApiResponse({ status: 404, description: 'Flight not found.' })
  async getHistory(@Param('id') id: string) {
    return this.flightsService.getPriceHistory(id);
  }
}
