import { NextResponse } from "next/server";
import { MetricSummary } from "@/types";

// Mock data for now - replace with actual database queries
const mockTrendingSnacks: MetricSummary[] = [
  {
    snack_name: "Doritos Nacho Cheese",
    snack_id: 1,
    company_name: "PepsiCo, Inc.",
    stock_ticker: "PEP",
    stock_exchange: "NASDAQ",
    current_trends_score: 89,
    trends_change: 3.2,
    reddit_mentions: 45,
    reddit_sentiment: 0.7,
    news_mentions: 8,
    news_sentiment: 0.6,
    stock_price: 172.45,
    stock_change: 2.1,
    overall_score: 89,
  },
  {
    snack_name: "Kettle Brand Sea Salt",
    snack_id: 2,
    company_name: "Campbell Soup Company",
    stock_ticker: "CPB",
    stock_exchange: "NYSE",
    current_trends_score: 84,
    trends_change: 4.5,
    reddit_mentions: 32,
    reddit_sentiment: 0.8,
    news_mentions: 5,
    news_sentiment: 0.9,
    stock_price: 48.23,
    stock_change: 1.8,
    overall_score: 84,
  },
  {
    snack_name: "Cheetos Puffs",
    snack_id: 3,
    company_name: "PepsiCo, Inc.",
    stock_ticker: "PEP",
    stock_exchange: "NASDAQ",
    current_trends_score: 76,
    trends_change: 2.1,
    reddit_mentions: 38,
    reddit_sentiment: 0.6,
    news_mentions: 6,
    news_sentiment: 0.5,
    stock_price: 172.45,
    stock_change: 2.1,
    overall_score: 76,
  },
];

export async function GET() {
  try {
    // In a real implementation, you would:
    // 1. Connect to your database
    // 2. Query the latest daily_metrics
    // 3. Calculate trending scores and changes
    // 4. Return formatted data
    
    // Filter to only trending snacks (positive change)
    const trendingSnacks = mockTrendingSnacks
      .filter(snack => snack.trends_change > 0)
      .sort((a, b) => b.trends_change - a.trends_change)
      .slice(0, 3);

    return NextResponse.json(trendingSnacks);
  } catch (error) {
    console.error("Error fetching trending snacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending snacks" },
      { status: 500 }
    );
  }
}
