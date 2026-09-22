# AgroConnect

AgroConnect is a smart farming platform built for Indian farmers to access live mandi prices, discover crop buying/selling opportunities, get AI-powered agricultural guidance, and learn sustainable farming practices in English, Hindi, and Kannada.

It combines a modern React frontend with an Express backend to deliver a mobile-friendly dashboard for crop market insights and farm support.

## Overview

AgroConnect helps farmers:

- Track live mandi price trends and compare market rates
- List and discover fresh produce in a farmer marketplace
- Ask an AI assistant crop and farm-related questions in local languages
- Get weather, soil, and seasonal farming guidance
- Learn organic and sustainable cultivation practices

## Features

### 1. Live Mandi Dashboard
- Real-time mandi price lookup with fallback offline data
- State and commodity filtering
- Price trend summaries for major Indian crops

### 2. Farmer Marketplace
- Post crop listings for sale
- Browse available produce by farmer, type, and location
- Include crop details, quantity, price, and image support

### 3. AI Voice and Chat Assistant
- Multilingual support: English, Hindi, and Kannada
- Helps with crop disease guidance, fertilizer advice, irrigation support, and seasonal recommendations
- Uses Gemini as the primary AI provider with OpenRouter fallback

### 4. Farming Tips and Advisory
- Seasonal agronomy guidance
- Sustainable and organic farming recommendations
- Crop rotation, compost, and soil health tips

### 5. Farmer-Friendly UI
- Mobile-first responsive layout
- Dark mode support
- Simple bottom navigation for field use

## Tech Stack

- React + TypeScript + Vite
- Express.js backend
- Tailwind CSS styling
- Lucide React icons
- Google Gemini AI integration
- OpenRouter fallback for AI responses
- Government mandi API with offline caching fallback

## Project Structure

```bash
agroconnect/
├── api/
│   └── index.ts
├── assets/
├── src/
│   ├── components/
│   │   ├── FarmingTips.tsx
│   │   ├── MarketPrices.tsx
│   │   ├── Marketplace.tsx
│   │   ├── PricePrediction.tsx
│   │   ├── SellForm.tsx
│   │   └── VoiceAssistant.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── .gitignore
├── index.html
├── manifest.json
├── metadata.json
├── package.json
├── render.yaml
├── server.ts
├── tsconfig.json
├── vercel.json
├── vite.config.ts
├── README.md
└── data/
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Then configure the variables as needed:

```env
GEMINI_API_KEY=your_gemini_key
APP_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_key
GOV_DATA_API_KEY=your_gov_data_key
```

> The exact values depend on your AI and mandi API access.

### Run locally

```bash
npm run dev
```

The app will start on the default local port used by the server (usually `http://localhost:3000`).

### Production build

```bash
npm run build
npm start
```

## Scripts

```bash
npm run dev      # run local development server
npm run build    # build frontend and server bundle
npm run start    # serve built app
npm run lint     # TypeScript type-check
```

## Notes

- The backend includes an offline fallback for mandi data if the government API fails or is unavailable.
- The AI assistant is designed to work for farmers in low-connectivity environments by falling back to local responses if external AI providers are unavailable.
- This project is intended as a farmer-first digital platform for agriculture support in India.

## License

This project is currently unlicensed unless otherwise specified by the repository owner.

## Contributing

Contributions are welcome. If you want to improve the app:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear summary

## Contact

For questions or collaboration, use the repository owner or project maintainer contact linked on GitHub.
