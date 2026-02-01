import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class SnacksService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('snacks')
      .select(`
        id,
        name,
        created_at,
        companies (
          id,
          name,
          stock_ticker,
          stock_exchange
        )
      `)
      .order('name');

    if (error) {
      console.error('Error fetching snacks:', error);
      throw new Error(`Failed to fetch snacks: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: number): Promise<any> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('snacks')
      .select(`
        id,
        name,
        created_at,
        companies (
          id,
          name,
          stock_ticker,
          stock_exchange
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching snack ${id}:`, error);
      throw new Error(`Snack with ID ${id} not found`);
    }

    return data;
  }

  async getAllWithMetrics(): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    // Get the most recent metrics for each snack
    const { data, error } = await supabase
      .from('daily_metrics')
      .select(`
        snack_id,
        google_trends_score,
        reddit_mention_count,
        avg_reddit_sentiment,
        news_article_count,
        avg_news_sentiment,
        stock_close_price,
        date,
        snacks!inner (
          id,
          name,
          companies!inner (
            name,
            stock_ticker,
            stock_exchange
          )
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching snacks with metrics:', error);
      throw new Error(`Failed to fetch snacks with metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by snack_id and get the latest metrics for each
    const snackMetricsMap = new Map();

    data.forEach(metric => {
      if (!snackMetricsMap.has(metric.snack_id)) {
        snackMetricsMap.set(metric.snack_id, metric);
      }
    });

    // Calculate trends_change by comparing with previous day's data
    const results: any[] = [];
    for (const [snackId, latestMetric] of snackMetricsMap) {
      // Find the previous day's metric for trend calculation
      const previousMetric = data.find(m =>
        m.snack_id === snackId &&
        m.date !== latestMetric.date
      );

      const trendsChange = this.calculateTrendsChange(
        latestMetric.google_trends_score,
        previousMetric?.google_trends_score
      );

      const stockChange = this.calculateStockChange(
        latestMetric.stock_close_price,
        previousMetric?.stock_close_price
      );

      const overallScore = this.calculateOverallScore(latestMetric);

      results.push({
        snack_id: snackId,
        snack_name: latestMetric.snacks.name,
        company_name: (latestMetric.snacks.companies as any).name,
        stock_ticker: (latestMetric.snacks.companies as any).stock_ticker,
        stock_exchange: (latestMetric.snacks.companies as any).stock_exchange,
        current_trends_score: latestMetric.google_trends_score,
        trends_change: trendsChange,
        reddit_mentions: latestMetric.reddit_mention_count,
        reddit_sentiment: latestMetric.avg_reddit_sentiment,
        news_mentions: latestMetric.news_article_count,
        news_sentiment: latestMetric.avg_news_sentiment,
        stock_price: latestMetric.stock_close_price,
        stock_change: stockChange,
        overall_score: overallScore
      });
    }

    return results.sort((a, b) => b.overall_score - a.overall_score);
  }

  async getTrending(): Promise<any[]> {
    // Return all snacks sorted by trending score (overall_score)
    return this.getAllWithMetrics();
  }

  async search(query: string): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('snacks')
      .select(`
        id,
        name,
        created_at,
        companies (
          id,
          name,
          stock_ticker,
          stock_exchange
        )
      `)
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) {
      console.error('Error searching snacks:', error);
      throw new Error(`Failed to search snacks: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get metrics for the found snacks
    const snackIds = data.map(snack => snack.id);
    const allSnacksWithMetrics = await this.getAllWithMetrics();

    return allSnacksWithMetrics.filter(snack =>
      snackIds.includes(snack.snack_id)
    );
  }

  async getMetrics(id: number, days: number = 30): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('snack_id', id)
      .order('date', { ascending: false })
      .limit(days);

    if (error) {
      console.error(`Error fetching metrics for snack ${id}:`, error);
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }

    return data || [];
  }

  async getDetail(id: number): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Get snack details
    const { data: snackData, error: snackError } = await supabase
      .from('snacks')
      .select(`
        id,
        name,
        companies (
          id,
          name,
          stock_ticker,
          stock_exchange
        )
      `)
      .eq('id', id)
      .single();

    if (snackError) {
      console.error(`Error fetching snack detail ${id}:`, snackError);
      throw new Error(`Snack with ID ${id} not found`);
    }

    // Get recent metrics for timeline
    const { data: metricsData, error: metricsError } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('snack_id', id)
      .order('date', { ascending: false })
      .limit(30);

    if (metricsError) {
      console.error(`Error fetching metrics for snack ${id}:`, metricsError);
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
    }

    // Get the latest metrics for overall score
    const latestMetrics = metricsData?.[0];
    console.log("latest metric", metricsData)

    // Generate timeline data
    const timelineData = metricsData?.map(metric => ({
      date: metric.date,
      value: metric.google_trends_score || 0
    })) || [];

    // Generate sentiment data (mock for now - could be calculated from reddit/news sentiment)
    const sentimentData = [
      { type: "Positive" as const, percentage: Math.round((latestMetrics?.avg_reddit_sentiment || 0.5) * 100), color: "#10B981" },
      { type: "Neutral" as const, percentage: 25, color: "#6B7280" },
      { type: "Negative" as const, percentage: Math.round((1 - (latestMetrics?.avg_reddit_sentiment || 0.5)) * 100), color: "#EF4444" },
    ];

    // Generate news articles (mock for now - could be fetched from actual news data)
    const newsArticles = [
      {
        id: 1,
        title: `${snackData.name} Sales Performance Update`,
        source: "Food Industry News",
        date: "2 days ago",
        summary: "Recent market analysis shows continued performance for this popular snack brand.",
        sentiment: "positive" as const,
        url: "#"
      },
      {
        id: 2,
        title: `Market Trends: ${snackData.name} Consumer Interest`,
        source: "Market Analysis",
        date: "1 week ago",
        summary: "Consumer sentiment analysis reveals ongoing interest in this snack category.",
        sentiment: "neutral" as const,
        url: "#"
      }
    ];

    const overallScore = this.calculateOverallScore(latestMetrics);
    const trendsChange = this.calculateTrendsChange(
      latestMetrics?.google_trends_score,
      metricsData?.[metricsData.length - 2]?.google_trends_score
    );

    return {
      snack: {
        id: snackData.id,
        name: snackData.name,
        brand: (snackData.companies as any).name,
        score: overallScore,
        change: trendsChange,
        trending: trendsChange >= 0 ? "up" as const : "down" as const
      },
      timelineData,
      sentimentData,
      newsArticles,
      overallSentimentScore: Math.round((latestMetrics?.avg_reddit_sentiment || 0.5) * 10),
      company: {
        name: (snackData.companies as any).name,
        stockTicker: (snackData.companies as any).stock_ticker,
        stockExchange: (snackData.companies as any).stock_exchange,
        currentStockPrice: latestMetrics?.stock_close_price,
        stockChange: this.calculateStockChange(
          latestMetrics?.stock_close_price,
          metricsData?.[metricsData.length - 2]?.stock_close_price
        )
      }
    };
  }

  private calculateOverallScore(metric: any): number {
    if (!metric) return 0;

    const weights = {
      google_trends: 0.4,
      reddit: 0.3,
      news: 0.3
    };

    const googleScore = (metric.google_trends_score || 0) * weights.google_trends;
    const redditScore = ((metric.reddit_mention_count || 0) * 0.5 + (metric.avg_reddit_sentiment || 0) * 0.5) * weights.reddit;
    const newsScore = ((metric.news_article_count || 0) * 0.5 + (metric.avg_news_sentiment || 0) * 0.5) * weights.news;

    return Math.round((googleScore + redditScore + newsScore) * 10) / 10;
  }

  private calculateTrendsChange(current: number, previous: number): number {
    if (!current || !previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  private calculateStockChange(current: number, previous: number): number {
    if (!current || !previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }
}
