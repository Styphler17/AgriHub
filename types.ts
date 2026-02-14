
export type Language = 'en' | 'tw';

export interface User {
  id: string;
  name: string;
  location: string;
  phoneNumber?: string;
  role: 'farmer' | 'buyer' | 'extension-officer';
  profileImage?: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  location: string;
  trend: 'up' | 'down' | 'stable';
  updatedAt: string;
}

export interface CropAdvice {
  crop: string;
  soilType: string;
  region: string;
  advice: string;
  pests: string[];
  schedule: string;
}

export interface MarketplaceListing {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  title: string;
  description: string;
  price: string;
  type: 'sale' | 'wanted';
  category: string;
  contact: string;
}
