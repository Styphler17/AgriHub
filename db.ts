import Dexie, { Table } from 'dexie';
import dexieCloud from 'dexie-cloud-addon';
import { MarketPrice, WeatherData, MarketplaceListing, User } from './types';

export class AgriHubDB extends Dexie {
  prices!: Table<MarketPrice>;
  weather!: Table<WeatherData>;
  listings!: Table<MarketplaceListing>;
  profiles!: Table<User>;

  constructor() {
    super('AgriHubDB_v2', { addons: [dexieCloud] });
    this.version(3).stores({
      prices: 'id, commodity, location',
      weather: 'city',
      listings: 'id, category, type',
      profiles: 'id'
    });

    this.cloud.configure({
      databaseUrl: "https://zd5fgzz6e.dexie.cloud",
      requireAuth: true
    });
  }
}

export const db = new AgriHubDB();

