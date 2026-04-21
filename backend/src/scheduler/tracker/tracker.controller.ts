import {
  Controller,
  Headers,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrackerService } from './tracker.service';

@Controller('tracker')
export class TrackerController {
  private readonly logger = new Logger(TrackerController.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly configService: ConfigService,
  ) {}

  @Post('trigger')
  async triggerPriceFetch(@Headers('x-sec') secret: string) {
    const expectedSecret = this.configService.get<string>('TRACKER_SECRET');

    if (!expectedSecret || secret !== expectedSecret) {
      this.logger.warn(
        'Unauthorized trigger attempt with invalid x-sec header',
      );
      throw new UnauthorizedException('Invalid or missing x-sec header');
    }

    this.logger.log('Manual flight price fetch triggered via endpoint.');

    // We run it asynchronously and do not await so the request doesn't hang
    this.trackerService.updateFlightPrices().catch((err) => {
      this.logger.error('Error during manual trigger execution', err.stack);
    });

    return {
      status: 'success',
      message: 'Flight price update triggered asynchronously.',
    };
  }
}
