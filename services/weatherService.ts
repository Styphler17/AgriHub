
import { WeatherData } from '../types';
import { db } from '../db';

const MOCK_WEATHER_TEMPLATES: Record<string, WeatherData> = {
  "Kumasi": {
    city: "Kumasi",
    temp: 29,
    condition: "Partly Cloudy",
    icon: "cloud",
    forecast: [
      { day: "Mon", temp: 30, condition: "Sunny" },
      { day: "Tue", temp: 28, condition: "Rain" },
      { day: "Wed", temp: 27, condition: "Storms" },
      { day: "Thu", temp: 29, condition: "Partly Cloudy" },
      { day: "Fri", temp: 31, condition: "Sunny" },
      { day: "Sat", temp: 30, condition: "Clear" },
      { day: "Sun", temp: 28, condition: "Showers" },
    ]
  },
  "Accra": {
    city: "Accra",
    temp: 31,
    condition: "Sunny",
    icon: "sun",
    forecast: [
      { day: "Mon", temp: 32, condition: "Sunny" },
      { day: "Tue", temp: 31, condition: "Partly Cloudy" },
      { day: "Wed", temp: 29, condition: "Cloudy" },
      { day: "Thu", temp: 30, condition: "Sunny" },
      { day: "Fri", temp: 32, condition: "Hot" },
      { day: "Sat", temp: 33, condition: "Clear" },
      { day: "Sun", temp: 31, condition: "Sunny" },
    ]
  }
};

export const fetchWeather = async (city: string = "Kumasi"): Promise<WeatherData> => {
  try {
    // Attempt to get real location if user allows
    if (navigator.geolocation) {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);
      
      if (pos) {
        console.log("Using GPS for weather:", pos.coords.latitude, pos.coords.longitude);
        // In production: fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}...`)
      }
    }

    await new Promise(r => setTimeout(r, 600));
    const data = MOCK_WEATHER_TEMPLATES[city] || MOCK_WEATHER_TEMPLATES["Kumasi"];
    
    // Update local cache
    await db.weather.put(data);
    return data;
  } catch (error) {
    const cached = await db.weather.get(city);
    if (cached) return cached;
    return MOCK_WEATHER_TEMPLATES["Kumasi"]; // Absolute fallback
  }
};
