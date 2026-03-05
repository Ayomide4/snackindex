# Snack Index

Snack Index tracks the cultural popularity of snack brands by aggregating daily signals from Google Trends, Reddit, and news sources, then correlating them with the stock prices of the companies that make those snacks.

## How it works

Each day the collector fetches data for every tracked snack and writes it to the database. The backend exposes that data through a REST API, and the frontend presents it as a browsable dashboard with charts and trend views.

The daily metrics recorded per snack are:

- Google Trends interest score (food category, last 24 hours)
- Reddit mention count and average sentiment (r/snacks, r/fastfood, r/food, r/soda)
- News article count and average sentiment (via NewsAPI)
- Parent company stock closing price (via Finnhub)

Sentiment is scored using VADER. Individual Reddit posts, comments, and news articles that mention a snack are also stored as mention records.

## Project structure

```
snackindex/
  collector/    Python data collection pipeline
  backend/      NestJS REST API (port 3001)
  frontend/     Next.js web dashboard (port 3000)
```

### Collector

A Python script that runs the full data collection pipeline for each snack configured in the database. It reads snack and company data (including search term aliases) from the database, queries each data source, and upserts the results into `daily_metrics` and `snack_mentions`.

**Dependencies:** `praw`, `newsapi-python`, `pytrends`, `finnhub-python`, `vaderSentiment`, `psycopg2-binary`, `pandas`

**Environment variables required:**

| Variable | Description |
|---|---|
| `DB_CONNECTION_STRING` | PostgreSQL connection string (Supabase) |
| `REDDIT_CLIENT_ID` | Reddit API client ID |
| `REDDIT_CLIENT_SECRET` | Reddit API client secret |
| `NEWS_API_KEY` | NewsAPI key |
| `FINNHUB_API_KEY` | Finnhub API key |

**Running the collector:**

```bash
cd collector
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Backend

A NestJS application that reads from the database and serves data to the frontend.

**Environment variables required:**

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon or service key |

**Key endpoints:**

- `GET /snacks` — list all snacks
- `GET /snacks/trending` — snacks ranked by recent activity
- `GET /snacks/search?q=` — search snacks by name
- `GET /snacks/:id/metrics?days=` — historical metrics for a snack
- `GET /snacks/:id/detail` — full detail view for a snack

**Running the backend:**

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

A Next.js application that consumes the backend API and displays snack metrics, trends, and mention feeds.

**Running the frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Running everything locally

The `start-dev.sh` script starts both the backend and frontend in development mode:

```bash
./start-dev.sh
```

This starts the backend on `http://localhost:3001` and the frontend on `http://localhost:3000`.

## Database

The database is hosted on Supabase (PostgreSQL). The main tables are:

- `companies` — company name and stock ticker
- `snacks` — snack name and reference to its parent company
- `snack_aliases` — alternate search terms used when querying data sources
- `daily_metrics` — one row per snack per day with all aggregated signals
- `snack_mentions` — individual Reddit posts, comments, and news articles
