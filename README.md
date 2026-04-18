# Smart Flight Tracker

**Live Demo:** https://tracksm.netlify.app

Smart Flight Tracker is a full-stack application for tracking flight prices, monitoring route history, and generating purchase recommendations. It combines a NestJS backend with a React + Vite frontend to provide fast flight search, active route dashboards, price history graphs, and optional AI insights.

## Features

- Track flights between origin and destination airports
- Search airports or cities via local search data
- Store active flight watchlists in MongoDB
- Automatically refresh tracked prices with scheduled updates
- View historical flight prices in an interactive chart
- Optional AI recommendation engine powered by Google Gemini
- Manual tracker trigger endpoint for custom price updates
- Swagger API documentation for backend endpoints

## Tech Stack

- Backend: NestJS, TypeScript, MongoDB, Mongoose
- Frontend: React, TypeScript, Vite, Recharts, Lucide icons
- Optional third-party integrations:
  - SerpApi for real flight price lookups
  - Google Gemini for AI flight purchase recommendations

## Repository Structure

- `backend/` - NestJS API server
- `frontend/` - React + Vite client
- `scratch/` - utility scripts

---

## Getting Started

### Prerequisites

- Node.js 18+ or newer
- npm
- MongoDB running locally or accessible via connection string

### Backend Setup

1. Change into the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables. Create a `.env` file or provide them in your environment:

```env
MONGO_URI=your_mongo_uri
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
TRACKER_SECRET=super-secret-token
```

4. Start the backend server:

```bash
npm run start:dev
```

5. Open API docs:

- `http://localhost:3000/api/docs`

### Frontend Setup

1. Change into the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. If needed, configure the frontend API base URL in a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

4. Start the frontend:

```bash
npm run dev
```

5. Open the app in your browser at the URL shown by Vite, typically `http://localhost:5173`.

---

## Backend API Endpoints

- `GET /flights/search-locations?q=<query>` — Search airport codes and cities
- `POST /flights` — Create a new flight watch entry
- `GET /flights` — List all active tracked flights
- `GET /flights/:id` — Get a specific tracked flight
- `GET /flights/:id/history` — Retrieve tracked price history for a flight
- `GET /ai-insight/:flightId` — Get AI recommendation for a flight

---

## Notes

- The tracker runs cron job automatically every 12 hours and saves new price history data.
- `SERPAPI_KEY` is required for live price lookups from SerpApi.
- `GEMINI_API_KEY` enables real AI-based buy/wait recommendations.
- If the AI key is missing, the app falls back to a mock recommendation mode.

## Potential Enhancements

- Add authentication and user-specific tracking lists
- Support round-trip flights and multi-city searches
- Add alerting/notifications for price drops
- Improve airport search relevance with fuzzy matching
