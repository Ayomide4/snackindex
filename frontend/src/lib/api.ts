import { MetricSummary, TrendingSnack, DailyMetric, Snack, Company } from "@/types";
import { calculateOverallScore } from "./utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// API endpoints
export const api = {
  // Get trending snacks based on recent performance changes
  getTrendingSnacks: async (): Promise<TrendingSnack[]> => {
    const summaries = await fetchAPI<MetricSummary[]>("/snacks/trending");
    return summaries.map(summary => ({
      id: summary.snack_id,
      name: summary.snack_name,
      brand: summary.company_name,
      score: summary.overall_score,
      change: summary.trends_change,
      trending: summary.trends_change >= 0 ? "up" : "down",
    }));
  },

  // Get all snacks with their latest metrics
  getAllSnacks: async (): Promise<TrendingSnack[]> => {
    const summaries = await fetchAPI<MetricSummary[]>("/snacks/all");
    return summaries.map(summary => ({
      id: summary.snack_id,
      name: summary.snack_name,
      brand: summary.company_name,
      score: summary.overall_score,
      change: summary.trends_change,
      trending: summary.trends_change >= 0 ? "up" : "down",
    }));
  },

  // Get detailed metrics for a specific snack
  getSnackDetail: async (snackId: number): Promise<DailyMetric[]> => {
    return fetchAPI<DailyMetric[]>(`/snacks/${snackId}/metrics`);
  },

  // Get time series data for a snack
  getSnackTimeSeries: async (snackId: number, days: number = 30) => {
    return fetchAPI<DailyMetric[]>(`/snacks/${snackId}/metrics?days=${days}`);
  },

  // Get all snacks for reference
  getSnacks: async (): Promise<Snack[]> => {
    return fetchAPI<Snack[]>("/snacks");
  },

  // Get all companies
  getCompanies: async (): Promise<Company[]> => {
    return fetchAPI<Company[]>("/companies");
  },

  // Search snacks by name or brand
  searchSnacks: async (query: string): Promise<TrendingSnack[]> => {
    const summaries = await fetchAPI<MetricSummary[]>(`/snacks/search?q=${encodeURIComponent(query)}`);
    return summaries.map(summary => ({
      id: summary.snack_id,
      name: summary.snack_name,
      brand: summary.company_name,
      score: summary.overall_score,
      change: summary.trends_change,
      trending: summary.trends_change >= 0 ? "up" : "down",
    }));
  },
};

// Utility function to transform database metrics to display format
export function transformMetricsToSummary(metrics: DailyMetric[], snack: Snack): MetricSummary {
  const latestMetric = metrics[0]; // Assuming sorted by date desc
  const previousMetric = metrics[1];
  
  const overallScore = calculateOverallScore({
    google_trends_score: latestMetric.google_trends_score,
    reddit_mentions: latestMetric.reddit_mentions,
    reddit_sentiment: latestMetric.reddit_sentiment,
    news_mentions: latestMetric.news_mentions,
    news_sentiment: latestMetric.news_sentiment,
  });

  // Calculate previous score for comparison (currently unused but available for future features)
  // const previousScore = previousMetric ? calculateOverallScore({
  //   google_trends_score: previousMetric.google_trends_score,
  //   reddit_mentions: previousMetric.reddit_mentions,
  //   reddit_sentiment: previousMetric.reddit_sentiment,
  //   news_mentions: previousMetric.news_mentions,
  //   news_sentiment: previousMetric.news_sentiment,
  // }) : overallScore;

  return {
    snack_name: snack.name,
    snack_id: snack.id,
    company_name: snack.company?.name || "Unknown",
    current_trends_score: latestMetric.google_trends_score || 0,
    trends_change: latestMetric.google_trends_score && previousMetric?.google_trends_score 
      ? ((latestMetric.google_trends_score - previousMetric.google_trends_score) / previousMetric.google_trends_score) * 100
      : 0,
    reddit_mentions: latestMetric.reddit_mentions || 0,
    reddit_sentiment: latestMetric.reddit_sentiment || 0,
    news_mentions: latestMetric.news_mentions || 0,
    news_sentiment: latestMetric.news_sentiment || 0,
    stock_price: latestMetric.stock_price,
    stock_change: latestMetric.stock_price && previousMetric?.stock_price
      ? ((latestMetric.stock_price - previousMetric.stock_price) / previousMetric.stock_price) * 100
      : undefined,
    overall_score: overallScore,
  };
}
