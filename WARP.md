# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Snack Index is a data collection and analysis system that tracks snack food popularity and sentiment across multiple data sources. The system collects data from Google Trends, Reddit, NewsAPI, and stock prices to create a comprehensive "index" of snack food performance.

## Development Commands

### Environment Setup
```powershell
# Navigate to collector directory and install dependencies
cd collector
pip install -r requirements.txt
```

### Running the Data Collector
```powershell
# Set up environment variables (create .env file with required keys)
# Required environment variables:
# DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT
# REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET
# NEWS_API_KEY, FINNHUB_API_KEY

# Run the main data collection pipeline
cd collector
python main.py
```

### Testing and Development
```powershell
# Run individual components for testing
cd collector
python -c "from data_collector import get_google_trends_data; print(get_google_trends_data(['oreo']))"
python -c "from db_utils import connect_db, fetch_data; conn = connect_db(); print(fetch_data(conn) if conn else 'No connection')"
```

### GitHub Actions Workflow
```powershell
# Trigger the daily collection workflow manually
gh workflow run "Daily Data Collection"

# View workflow runs
gh run list --workflow="daily-collector.yml"
```

## Code Architecture

### Core Components

**`collector/main.py`** - Entry point that orchestrates the data collection pipeline:
- Loads environment variables and configures logging
- Connects to PostgreSQL database (Supabase)
- Fetches snack configuration from database
- Runs collection pipeline for each snack
- Manages database connections and cleanup

**`collector/data_collector.py`** - Core data collection logic:
- **Google Trends Integration**: Fetches search popularity data with rate limiting and retry logic
- **Reddit Data Collection**: Searches specific subreddits (snacks+fastfood+food+soda) for mentions and analyzes sentiment using VADER
- **News Data Collection**: Uses NewsAPI to find relevant articles and performs sentiment analysis
- **Stock Price Collection**: Fetches closing prices using Finnhub API with caching
- **Sentiment Analysis**: Uses VADER sentiment analyzer for Reddit posts/comments and news articles

**`collector/db_utils.py`** - Database operations and configuration:
- PostgreSQL connection management using psycopg2
- Dynamic snack configuration builder from database records
- Upsert operations for daily metrics with conflict resolution
- Query builder for Reddit and News API search terms

### Data Pipeline Flow

1. **Configuration Loading**: Fetches snacks, companies, and aliases from database
2. **Dynamic Query Building**: Creates search queries for each platform based on snack names and aliases
3. **Multi-Source Data Collection**: 
   - Google Trends: Search popularity scores
   - Reddit: Mention counts and sentiment from posts/comments
   - NewsAPI: Article counts and sentiment analysis
   - Finnhub: Stock closing prices for parent companies
4. **Data Processing**: Aggregates sentiment scores and counts
5. **Database Storage**: Upserts daily metrics with conflict resolution

### Database Schema Context

The system expects these database tables:
- `snacks`: Core snack products with company relationships
- `companies`: Parent companies with stock ticker symbols
- `snack_aliases`: Alternative names/spellings for search optimization
- `daily_metrics`: Time-series data storage for all collected metrics

### Configuration Management

- **Environment Variables**: All API keys and database credentials via `.env` files
- **Search Configuration**: Dynamically generated from database records
- **Rate Limiting**: Built-in retry logic with exponential backoff for Google Trends
- **Caching**: Stock price caching to avoid redundant API calls within single run

### Scheduled Execution

- **GitHub Actions**: Daily execution at midnight US time (5 AM UTC)
- **Logging**: Comprehensive logging with file rotation (7-day retention)
- **Error Handling**: Graceful degradation when individual APIs fail
- **Debug Features**: DNS resolution checks and connection validation in CI/CD

## Development Notes

### API Rate Limits and Retry Logic
- Google Trends implements exponential backoff for 429 responses
- Stock price data is cached per execution to minimize API usage
- Reddit API uses PRAW with built-in rate limiting

### Time Window Handling
- Data collection focuses on previous 24-hour window
- Uses both Unix timestamps (Reddit) and ISO dates (NewsAPI)
- Timezone handling for consistent data collection

### Sentiment Analysis Strategy
- VADER sentiment analyzer provides compound scores (-1 to +1)
- Averages sentiment across all mentions for daily aggregation
- Handles both Reddit posts/comments and news article text

### Data Quality Measures
- Duplicate detection for news articles by title
- Relevance filtering using search terms in Reddit comments
- Stock ticker validation and null handling
- Comprehensive error logging for debugging
