# 🌾 AgriHub Ghana

<div align="center">
  <img width="1200" height="475" alt="AgriHub Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  **Empowering Ghanaian Farmers with AI and Real-Time Data**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
  [![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
  [![PWA](https://img.shields.io/badge/PWA-Enabled-purple.svg)](https://web.dev/progressive-web-apps/)
</div>

## 📖 Overview

AgriHub is a **Progressive Web App (PWA)** designed to revolutionize agriculture in Ghana by providing farmers with:
- 📊 Real-time market prices across all regions
- 🌤️ Localized weather forecasts
- 🤖 AI-powered crop advice (Gemini + local knowledge base)
- 🛒 Peer-to-peer marketplace for buying/selling
- 📈 Analytics dashboard with price trends
- 🌍 Offline-first architecture with cloud sync

Built with **React 19**, **TypeScript**, **Dexie Cloud**, and **Tailwind CSS 4**.

---

## ✨ Features

### Core Functionality
- ✅ **Multi-language Support**: English & Twi
- ✅ **Guest Mode**: Public access to market prices without login
- ✅ **OTP Authentication**: Secure phone-based login via Dexie Cloud
- ✅ **Dark Mode**: Full theme support across the app
- ✅ **Offline Capable**: Works without internet, syncs when online
- ✅ **Responsive Design**: Mobile-first, optimized for all devices

### Market Intelligence
- 📊 **Live Market Prices**: Track commodity prices across Ghana
- 🔍 **Search & Filter**: Find prices by commodity, location, or trend
- 📈 **Price History**: View historical trends and analytics
- 📥 **Export Data**: Download reports as PDF or CSV
- ⭐ **Favorites**: Save frequently tracked commodities

### Agricultural Support
- 🌱 **Crop Advisor**: Get AI-powered planting advice for 7+ major crops
- 🌦️ **Weather Service**: Localized forecasts (mock data, ready for API integration)
- 🗺️ **Supply Chain Map**: Visualize agricultural networks

### Marketplace
- 🛒 **Buy/Sell Listings**: Post and browse agricultural products
- 👤 **User Profiles**: Farmer, Buyer, or Extension Officer roles
- 💬 **Contact Integration**: Direct phone/WhatsApp links

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Styphler17/AgriHub.git
   cd AgriHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   > **Note**: The app works without an API key using the local knowledge base. Get a free Gemini API key at [Google AI Studio](https://ai.google.dev/).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **State Management**: React Hooks, Dexie React Hooks
- **Database**: Dexie.js (IndexedDB) + Dexie Cloud (sync)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **PWA**: Service Worker, Web Manifest

### Project Structure
```
AgriHub/
├── components/          # React components
│   ├── Auth.tsx        # Authentication UI
│   ├── Dashboard.tsx   # Analytics dashboard
│   ├── MarketPrices.tsx # Price tracking
│   ├── Marketplace.tsx  # Buy/sell listings
│   ├── CropAdvisor.tsx  # AI crop advice
│   ├── Settings.tsx     # User settings
│   └── LandingPage.tsx  # Public landing page
├── services/            # Business logic
│   ├── geminiService.ts # AI + local knowledge
│   └── weatherService.ts # Weather data
├── db.ts               # Dexie database schema
├── types.ts            # TypeScript interfaces
├── translations.ts     # i18n (English/Twi)
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

### Database Schema
```typescript
{
  prices: 'id, commodity, location',
  weather: 'city',
  listings: 'id, category, type',
  profiles: 'id',
  priceAudit: 'id, priceId, timestamp'
}
```

---

## 🎨 Design Philosophy

- **Ghanaian Identity**: National colors (green, yellow, red) integrated throughout
- **Mobile-First**: Optimized for low-end devices and slow networks
- **Offline-First**: Local data storage with cloud sync
- **Accessibility**: High contrast ratios, semantic HTML, keyboard navigation
- **Performance**: Code splitting, lazy loading, optimized images

---

## 🔐 Authentication

AgriHub uses **Dexie Cloud** for authentication:
- OTP-based login (no passwords)
- Automatic cloud sync across devices
- Guest mode for public features
- Role-based access (Farmer, Buyer, Extension Officer)

---

## 📱 PWA Features

- ✅ Installable on mobile and desktop
- ✅ Offline functionality
- ✅ Background sync
- ✅ Push notifications (coming soon)
- ✅ App-like experience

---

## 🌍 Localization

Supports **English** and **Twi** (Ghanaian language):
- UI translations
- Crop advice in local language
- Cultural context in agricultural guidance

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered crop advice
- **Dexie Cloud** for offline-first database sync
- **Ghana Ministry of Food and Agriculture** for agricultural data
- **Ghanaian farmers** for invaluable feedback

---

## 📞 Support

- **Email**: support@agrihub.gh
- **GitHub Issues**: [Report a bug](https://github.com/Styphler17/AgriHub/issues)
- **Documentation**: [View full docs](https://github.com/Styphler17/AgriHub/wiki)

---

<div align="center">
  Made with ❤️ for Ghanaian Farmers
  
  **[View Demo](https://ai.studio/apps/drive/1N3VFRQpCVK0MAkCMG_8DqWchHZ0W9XdS)** • **[Report Bug](https://github.com/Styphler17/AgriHub/issues)** • **[Request Feature](https://github.com/Styphler17/AgriHub/issues)**
</div>
