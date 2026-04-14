import { ApiProperty } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty({ example: 'JFK', description: 'Origin airport code' })
  origin: string;

  @ApiProperty({ example: 'LAX', description: 'Destination airport code' })
  destination: string;

  @ApiProperty({ example: '2024-05-20', description: 'Departure date' })
  departureDate: string;
}
