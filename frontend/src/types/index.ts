export interface Snack {
  id: number;
  name: string;
  company_id: number;
  created_at?: string;
  updated_at?: string;
  company?: Company;
  aliases?: SnackAlias[];
}

export interface Company {
  id: number;
  name: string;
  stock_ticker?: string;
  stock_exchange?: string;
  ticker_symbol?: string; // Keep for backward compatibility
  created_at?: string;
  updated_at?: string;
}

export interface SnackAlias {
  id: number;
  snack_id: number;
  alias: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyMetric {
  id: number;
  snack_id: number;
  date: string;
  google_trends_score?: number;
  reddit_mentions?: number;
  reddit_sentiment?: number;
  news_mentions?: number;
  news_sentiment?: number;
  stock_price?: number;
  created_at?: string;
  updated_at?: string;
  snack?: Snack;
}

export interface Mention {
  id: number;
  snack_id: number;
  source: string;
  source_name: string;
  content: string;
  url: string;
  sentiment_score: number;
  published_at?: string;
  created_at?: string;
  snack_name?: string;
}

export interface MetricSummary {
  snack_name: string;
  snack_id: number;
  company_name: string;
  stock_ticker?: string;
  stock_exchange?: string;
  current_trends_score: number;
  trends_change: number;
  reddit_mentions: number;
  reddit_sentiment: number;
  news_mentions: number;
  news_sentiment: number;
  stock_price?: number;
  stock_change?: number;
  overall_score: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  snack_name: string;
  data: ChartDataPoint[];
}

export interface TrendingSnack {
  id: number;
  name: string;
  brand: string;
  score: number;
  change: number;
  trending: "up" | "down";
  color?: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  source: string;
  date: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  url?: string;
}

export interface SentimentData {
  type: "Positive" | "Neutral" | "Negative";
  percentage: number;
  color: string;
}

export interface SnackDetailData {
  snack: TrendingSnack;
  timelineData: ChartDataPoint[];
  sentimentData: SentimentData[];
  newsArticles: NewsArticle[];
  overallSentimentScore: number;
  company: {
    name: string;
    stockTicker?: string;
    stockExchange?: string;
    currentStockPrice?: number;
    stockChange?: number;
  };
  mentions?: Mention[];
}
