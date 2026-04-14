import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service to handle airport lookups from a local JSON dataset.
 * This reduces SerpApi credit usage by performing location searches locally.
 */
@Injectable()
export class AirportLookupService implements OnModuleInit {
  private airports: any[] = [];

  onModuleInit() {
    // Path relative to the backend root where the command is run from
    const filePath = path.join(process.cwd(), 'src', 'data', 'airports.json');
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        this.airports = JSON.parse(data);
        console.log(`Loaded ${this.airports.length} airports for local lookup.`);
      } else {
        console.warn(`Airports data file not found at ${filePath}. Search will return empty results.`);
      }
    } catch (error) {
      console.error('Failed to load airports data:', error);
    }
  }

  /**
   * Search for airports by query.
   * Logic:
   * 1. If query is empty, return top 20 (already prioritized for India in the JSON).
   * 2. Otherwise, filter by IATA, name, or city (case-insensitive partial match).
   * 3. Limit to 15 results.
   */
  search(query: string): any[] {
    if (!query || query.trim().length === 0) {
      return this.airports.slice(0, 20);
    }

    const lowerQuery = query.toLowerCase().trim();

    return this.airports
      .filter(a => {
        // Direct IATA match (highest priority if we were sorting here, but filtering is fast enough)
        if (a.iata.toLowerCase() === lowerQuery) return true;
        
        // Partial matches
        return (
          a.iata.toLowerCase().includes(lowerQuery) ||
          a.name.toLowerCase().includes(lowerQuery) ||
          (a.city && a.city.toLowerCase().includes(lowerQuery))
        );
      })
      .slice(0, 15);
  }
}
