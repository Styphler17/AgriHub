import Dexie, { Table } from 'dexie';
import dexieCloud from 'dexie-cloud-addon';
import { MarketPrice, WeatherData, MarketplaceListing } from './types';

export class AgriHubDB extends Dexie {
  prices!: Table<MarketPrice>;
  weather!: Table<WeatherData>;
  listings!: Table<MarketplaceListing>;

  constructor() {
    super('AgriHubDB', { addons: [dexieCloud] });
    this.version(1).stores({
      prices: '++id, commodity, location',
      weather: 'city',
      listings: '++id, category, type'
    });

    this.cloud.configure({
      databaseUrl: "https://zd5fgzz6e.dexie.cloud",
      requireAuth: false
    });
  }
}

export const db = new AgriHubDB();

