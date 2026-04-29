import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const Holidays: any = require('date-holidays');

export interface HolidaySignal {
  location: 'origin' | 'destination';
  countryCode: string;
  name: string;
  date: string;
  daysFromTravel: number;
}

export interface HolidayContext {
  originCountry?: string;
  destinationCountry?: string;
  signals: HolidaySignal[];
  highDemand: boolean;
  summary: string;
}

@Injectable()
export class HolidayContextService {
  private readonly logger = new Logger(HolidayContextService.name);
  private airports: Array<{ iata: string; country: string; city?: string }> =
    [];

  constructor() {
    this.loadAirportData();
  }

  private loadAirportData() {
    try {
      const airportsPath = path.join(
        process.cwd(),
        'src',
        'data',
        'airports.json',
      );
      if (!fs.existsSync(airportsPath)) {
        this.logger.warn(
          `Airports data file not found at ${airportsPath}. Holiday lookup will be limited.`,
        );
        return;
      }

      this.airports = JSON.parse(
        fs.readFileSync(airportsPath, 'utf8'),
      ) as Array<{
        iata: string;
        country: string;
        city?: string;
      }>;
      this.logger.debug(
        `Loaded ${this.airports.length} airports for holiday context lookup.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to load airports data for holiday context service:',
        error,
      );
    }
  }

  private findCountryCode(iata: string): string | undefined {
    const normalized = iata?.trim().toUpperCase();
    const airport = this.airports.find((entry) => entry.iata === normalized);
    return airport?.country;
  }

  private getHolidaySignalsForCountry(
    countryCode: string,
    targetDate: Date,
    location: 'origin' | 'destination',
  ): HolidaySignal[] {
    const hd = new Holidays(countryCode);
    const year = targetDate.getUTCFullYear();
    const daysToCheck = [-2, -1, 0, 1, 2];
    const signals: HolidaySignal[] = [];

    for (const offset of daysToCheck) {
      const date = new Date(
        Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
        ),
      );
      date.setUTCDate(date.getUTCDate() + offset);
      const holidayInfo = hd.isHoliday(date);
      if (!holidayInfo) {
        continue;
      }

      const holidays = Array.isArray(holidayInfo) ? holidayInfo : [holidayInfo];
      for (const holiday of holidays) {
        signals.push({
          location,
          countryCode,
          name: holiday.name,
          date: date.toISOString().slice(0, 10),
          daysFromTravel: offset,
        });
      }
    }

    return signals;
  }

  getHolidayContext(
    originIata: string,
    destinationIata: string,
    departureDate: string,
    returnDate?: string,
  ): HolidayContext {
    const originCountry = this.findCountryCode(originIata);
    const destinationCountry = this.findCountryCode(destinationIata);
    const signals: HolidaySignal[] = [];

    if (originCountry) {
      signals.push(
        ...this.getHolidaySignalsForCountry(
          originCountry,
          new Date(departureDate),
          'origin',
        ),
      );
      if (returnDate) {
        signals.push(
          ...this.getHolidaySignalsForCountry(
            originCountry,
            new Date(returnDate),
            'origin',
          ),
        );
      }
    }

    if (destinationCountry) {
      signals.push(
        ...this.getHolidaySignalsForCountry(
          destinationCountry,
          new Date(departureDate),
          'destination',
        ),
      );
      if (returnDate) {
        signals.push(
          ...this.getHolidaySignalsForCountry(
            destinationCountry,
            new Date(returnDate),
            'destination',
          ),
        );
      }
    }

    const uniqueSignals = signals.filter(
      (signal, index, list) =>
        list.findIndex(
          (item) =>
            item.location === signal.location &&
            item.name === signal.name &&
            item.date === signal.date,
        ) === index,
    );

    const highDemand = uniqueSignals.length > 0;
    const summary = uniqueSignals.length
      ? uniqueSignals
          .map((signal) => {
            const dayLabel =
              signal.daysFromTravel === 0
                ? 'on travel day'
                : `${Math.abs(signal.daysFromTravel)} day${Math.abs(signal.daysFromTravel) === 1 ? '' : 's'} ${signal.daysFromTravel > 0 ? 'after' : 'before'}`;
            return `${signal.name} (${signal.date}) is ${dayLabel} ${signal.location} of travel.`;
          })
          .join(' ')
      : 'No major holidays were found within ±2 days of departure or return for the selected route.';

    return {
      originCountry,
      destinationCountry,
      signals: uniqueSignals,
      highDemand,
      summary,
    };
  }
}
