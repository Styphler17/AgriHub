import Dexie, { Table } from 'dexie';
import dexieCloud from 'dexie-cloud-addon';
import { MarketPrice, WeatherData, MarketplaceListing, User, PriceHistory } from './types';

export class AgriHubDB extends Dexie {
  prices!: Table<MarketPrice>;
  weather!: Table<WeatherData>;
  listings!: Table<MarketplaceListing>;
  profiles!: Table<User>;
  priceAudit!: Table<PriceHistory>;

  constructor() {
    super('AgriHubDB_v2', { addons: [dexieCloud] });
    this.version(6).stores({
      prices: 'id, commodity, location',
      weather: 'city',
      listings: 'id, category, type',
      profiles: 'id',
      priceAudit: 'id, priceId, timestamp'
    });

    this.cloud.configure({
      databaseUrl: "https://zd5fgzz6e.dexie.cloud",
      requireAuth: false,
      customLoginGui: true
    });
  }
}

export const db = new AgriHubDB();

