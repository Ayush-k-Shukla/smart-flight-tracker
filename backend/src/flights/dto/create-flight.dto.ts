import { ApiProperty } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty({ example: 'JFK', description: 'Origin airport IATA code' })
  origin: string;

  @ApiProperty({ example: 'New York', description: 'Origin city name', required: false })
  originCity?: string;

  @ApiProperty({ example: 'LAX', description: 'Destination airport IATA code' })
  destination: string;

  @ApiProperty({ example: 'Los Angeles', description: 'Destination city name', required: false })
  destinationCity?: string;

  @ApiProperty({ example: '2024-05-20', description: 'Departure date' })
  departureDate: string;
}
