# Sentiment Analysis Dashboard

A React-based dashboard for visualizing sentiment analysis data from YouTube comments. The dashboard provides multiple views for analyzing sentiment across different topics, including statistics, trends over time, and word clouds. Database is static.

## Features

- Topic Selection: Choose one or more topics to analyze
- Multiple Views:
  - Stats View: Total comments and sentiment distribution pie chart
  - Trends View: Sentiment scores over time
  - Wordclouds View: Word frequency visualization for each topic
- Responsive Design: Works on desktop and mobile devices
- Real-time Updates: Data updates automatically when selecting different topics

## Prerequisites

- Node.js (v18 or later)
- SQLite database file (`final_db.db`) with the required schema

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Dashboard

1. Make sure the SQLite database file (`final_db.db`) is in the root directory
2. Start both the frontend and backend servers:
   ```bash
   npm run dev:all
   ```
3. Open your browser and navigate to `http://localhost:5173`

## Development

- Frontend: React with TypeScript, running on Vite
- Backend: Express.js with SQLite
- UI Components: Tailwind CSS, Headless UI
- Charts: Recharts for trends, D3 for word clouds

## Project Structure

```
final-dashboard/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── assets/            # Static assets
│   └── App.tsx            # Main application component
├── server/                # Backend server code
│   └── server.ts         # Express server
├── public/               # Public assets
└── final_db.db           # SQLite database
```

## API Endpoints

- `GET /api/topics` - Get list of available topics
- `GET /api/stats` - Get comment statistics for selected topics
- `GET /api/trends` - Get sentiment trends over time
- `GET /api/wordclouds` - Get word frequency data for word clouds

## Database Schema

The dashboard uses a SQLite database with the following tables:

- `wordclouds`: Word frequency data for each topic
- `videos`: Video information and topic mapping
- `comments`: Comment data with sentiment analysis

# Edit:

To run this locally, you need to:

1. Go into the individual component files and change the API fetch points
   - const response = await fetch(`https://my-cloudflare-worker.workers.dev/api/stats?${queryParams}`)
   * const response = await fetch(`/api/stats?${queryParams}`)
2. Add Vite dev server proxy:
   // vite.config.ts
   export default defineConfig({
   plugins: [react()],
   server: {
   proxy: {
   '/api': {
   target: 'http://localhost:3001',
   changeOrigin: true
   }
   }
   }
   })
3. Add this in package.json:
   "scripts": {

- "server": "tsx server/server.ts",
- "dev:all": "concurrently \"npm run dev\" \"npm run server\""
  ...
  }

4. After you do all this, ask ChatGPT or Deepseek to create a server.js file lol
