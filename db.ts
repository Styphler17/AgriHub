
import Dexie from 'dexie';
import type { Table } from 'dexie';
import { MarketPrice, WeatherData, MarketplaceListing } from './types';

// Using default import for Dexie class to ensure the AgriHubDB subclass correctly inherits all instance methods like 'version'
export class AgriHubDB extends Dexie {
  prices!: Table<MarketPrice>;
  weather!: Table<WeatherData>;
  listings!: Table<MarketplaceListing>;

  constructor() {
    super('AgriHubDB');
    // Configure database version and schema
    // The version method is part of the Dexie instance, inherited from the base class
    this.version(1).stores({
      prices: '++id, commodity, location',
      weather: 'city',
      listings: '++id, category, type'
    });
  }
}

export const db = new AgriHubDB();
