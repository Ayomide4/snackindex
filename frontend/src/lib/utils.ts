import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatPercentage(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getTrendingStatus(change: number): "up" | "down" {
  return change >= 0 ? "up" : "down";
}

export function getSentimentColor(sentiment: "positive" | "neutral" | "negative"): string {
  switch (sentiment) {
    case "positive":
      return "#10B981";
    case "negative":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

export function calculateOverallScore(metrics: {
  google_trends_score?: number;
  reddit_mentions?: number;
  reddit_sentiment?: number;
  news_mentions?: number;
  news_sentiment?: number;
}): number {
  const weights = {
    trends: 0.4,
    reddit_mentions: 0.15,
    reddit_sentiment: 0.15,
    news_mentions: 0.15,
    news_sentiment: 0.15,
  };

  let totalScore = 0;
  let totalWeight = 0;

  if (metrics.google_trends_score !== undefined) {
    totalScore += metrics.google_trends_score * weights.trends;
    totalWeight += weights.trends;
  }

  if (metrics.reddit_mentions !== undefined) {
    // Normalize reddit mentions to 0-100 scale
    const normalizedMentions = Math.min(100, metrics.reddit_mentions * 5);
    totalScore += normalizedMentions * weights.reddit_mentions;
    totalWeight += weights.reddit_mentions;
  }

  if (metrics.reddit_sentiment !== undefined) {
    // Convert sentiment from -1/+1 to 0-100 scale
    const normalizedSentiment = (metrics.reddit_sentiment + 1) * 50;
    totalScore += normalizedSentiment * weights.reddit_sentiment;
    totalWeight += weights.reddit_sentiment;
  }

  if (metrics.news_mentions !== undefined) {
    // Normalize news mentions to 0-100 scale
    const normalizedMentions = Math.min(100, metrics.news_mentions * 10);
    totalScore += normalizedMentions * weights.news_mentions;
    totalWeight += weights.news_mentions;
  }

  if (metrics.news_sentiment !== undefined) {
    // Convert sentiment from -1/+1 to 0-100 scale
    const normalizedSentiment = (metrics.news_sentiment + 1) * 50;
    totalScore += normalizedSentiment * weights.news_sentiment;
    totalWeight += weights.news_sentiment;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}
