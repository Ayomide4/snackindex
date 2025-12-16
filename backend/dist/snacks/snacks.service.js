"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnacksService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let SnacksService = class SnacksService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findAll() {
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
    async findOne(id) {
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
    async getAllWithMetrics() {
        const supabase = this.supabaseService.getClient();
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
        const snackMetricsMap = new Map();
        data.forEach(metric => {
            if (!snackMetricsMap.has(metric.snack_id)) {
                snackMetricsMap.set(metric.snack_id, metric);
            }
        });
        const results = [];
        for (const [snackId, latestMetric] of snackMetricsMap) {
            const previousMetric = data.find(m => m.snack_id === snackId &&
                m.date !== latestMetric.date);
            const trendsChange = this.calculateTrendsChange(latestMetric.google_trends_score, previousMetric?.google_trends_score);
            const stockChange = this.calculateStockChange(latestMetric.stock_close_price, previousMetric?.stock_close_price);
            const overallScore = this.calculateOverallScore(latestMetric);
            results.push({
                snack_id: snackId,
                snack_name: latestMetric.snacks.name,
                company_name: latestMetric.snacks.companies.name,
                stock_ticker: latestMetric.snacks.companies.stock_ticker,
                stock_exchange: latestMetric.snacks.companies.stock_exchange,
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
    async getTrending() {
        return this.getAllWithMetrics();
    }
    async search(query) {
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
        const snackIds = data.map(snack => snack.id);
        const allSnacksWithMetrics = await this.getAllWithMetrics();
        return allSnacksWithMetrics.filter(snack => snackIds.includes(snack.snack_id));
    }
    async getMetrics(id, days = 30) {
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
    async getDetail(id) {
        const supabase = this.supabaseService.getClient();
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
        const { data: metricsData, error: metricsError } = await supabase
            .from('daily_metrics')
            .select('*')
            .eq('snack_id', id)
            .order('date', { ascending: true })
            .limit(30);
        if (metricsError) {
            console.error(`Error fetching metrics for snack ${id}:`, metricsError);
            throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
        }
        const latestMetrics = metricsData?.[metricsData.length - 1];
        const timelineData = metricsData?.map(metric => ({
            date: metric.date,
            value: metric.google_trends_score || 0
        })) || [];
        const sentimentData = [
            { type: "Positive", percentage: Math.round((latestMetrics?.avg_reddit_sentiment || 0.5) * 100), color: "#10B981" },
            { type: "Neutral", percentage: 25, color: "#6B7280" },
            { type: "Negative", percentage: Math.round((1 - (latestMetrics?.avg_reddit_sentiment || 0.5)) * 100), color: "#EF4444" },
        ];
        const newsArticles = [
            {
                id: 1,
                title: `${snackData.name} Sales Performance Update`,
                source: "Food Industry News",
                date: "2 days ago",
                summary: "Recent market analysis shows continued performance for this popular snack brand.",
                sentiment: "positive",
                url: "#"
            },
            {
                id: 2,
                title: `Market Trends: ${snackData.name} Consumer Interest`,
                source: "Market Analysis",
                date: "1 week ago",
                summary: "Consumer sentiment analysis reveals ongoing interest in this snack category.",
                sentiment: "neutral",
                url: "#"
            }
        ];
        const overallScore = this.calculateOverallScore(latestMetrics);
        const trendsChange = this.calculateTrendsChange(latestMetrics?.google_trends_score, metricsData?.[metricsData.length - 2]?.google_trends_score);
        return {
            snack: {
                id: snackData.id,
                name: snackData.name,
                brand: snackData.companies.name,
                score: overallScore,
                change: trendsChange,
                trending: trendsChange >= 0 ? "up" : "down"
            },
            timelineData,
            sentimentData,
            newsArticles,
            overallSentimentScore: Math.round((latestMetrics?.avg_reddit_sentiment || 0.5) * 10),
            company: {
                name: snackData.companies.name,
                stockTicker: snackData.companies.stock_ticker,
                stockExchange: snackData.companies.stock_exchange,
                currentStockPrice: latestMetrics?.stock_close_price,
                stockChange: this.calculateStockChange(latestMetrics?.stock_close_price, metricsData?.[metricsData.length - 2]?.stock_close_price)
            }
        };
    }
    calculateOverallScore(metric) {
        if (!metric)
            return 0;
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
    calculateTrendsChange(current, previous) {
        if (!current || !previous || previous === 0)
            return 0;
        return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    }
    calculateStockChange(current, previous) {
        if (!current || !previous || previous === 0)
            return 0;
        return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    }
};
exports.SnacksService = SnacksService;
exports.SnacksService = SnacksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SnacksService);
//# sourceMappingURL=snacks.service.js.map