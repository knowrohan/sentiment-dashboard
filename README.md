# Sentiment Analysis Dashboard

A React-based dashboard for visualizing sentiment analysis data from YouTube comments. The dashboard provides multiple views for analyzing sentiment across different topics, including statistics, trends over time, and word clouds.

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

1. Make sure your SQLite database file (`final_db.db`) is in the root directory
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
