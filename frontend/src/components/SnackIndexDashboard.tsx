"use client";

import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SnackCard } from "@/components/SnackCard";
import { SnackList } from "@/components/SnackList";
import { SnackDetail } from "@/components/SnackDetail";
import { TrendingSnack, SnackDetailData } from "@/types";

// Mock data - this would come from your API
const trendingSnacks: TrendingSnack[] = [
  {
    id: 1,
    name: "Doritos Nacho Cheese",
    brand: "Frito Lay",
    score: 89,
    change: 3.2,
    trending: "up",
    color: "#FF6B35",
  },
  {
    id: 2,
    name: "Lay's Classic",
    brand: "Frito Lay",
    score: 76,
    change: -0.5,
    trending: "down",
    color: "#FFD23F",
  },
  {
    id: 3,
    name: "Cheetos Puffs",
    brand: "Frito Lay",
    score: 84,
    change: 2.1,
    trending: "up",
    color: "#FF8C42",
  },
];

const allSnacks: TrendingSnack[] = [
  {
    id: 1,
    name: "Doritos Nacho Cheese",
    brand: "Frito Lay",
    score: 89,
    change: 3.2,
    trending: "up",
    color: "#FF6B35",
  },
  {
    id: 2,
    name: "Kettle Brand Sea Salt",
    brand: "Kettle",
    score: 84,
    change: 4.5,
    trending: "up",
    color: "#2E8B57",
  },
  {
    id: 3,
    name: "Cheetos Puffs",
    brand: "Frito Lay",
    score: 76,
    change: 2.1,
    trending: "up",
    color: "#FF8C42",
  },
  {
    id: 4,
    name: "Pringles Original",
    brand: "Pringles",
    score: 72,
    change: 1.8,
    trending: "up",
    color: "#C70039",
  },
  {
    id: 5,
    name: "Lay's Classic",
    brand: "Frito Lay",
    score: 68,
    change: -0.5,
    trending: "down",
    color: "#FFD23F",
  },
  {
    id: 6,
    name: "Ruffles Cheddar",
    brand: "Frito Lay",
    score: 65,
    change: -1.2,
    trending: "down",
    color: "#FFC300",
  },
];

// Mock function to generate detail data
const generateSnackDetailData = (snack: TrendingSnack): SnackDetailData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timelineData = [];
  
  for (let i = 0; i < 12; i++) {
    const variation = (Math.random() - 0.5) * 30;
    const score = Math.max(10, Math.min(100, snack.score + variation));
    timelineData.push({
      date: months[i],
      value: Math.round(score),
    });
  }
  
  // Ensure the last data point matches current score
  timelineData[timelineData.length - 1].value = snack.score;
  
  const sentimentData = [
    { type: "Positive" as const, percentage: 65, color: "#10B981" },
    { type: "Neutral" as const, percentage: 25, color: "#6B7280" },
    { type: "Negative" as const, percentage: 10, color: "#EF4444" },
  ];
  
  const newsArticles = [
    {
      id: 1,
      title: `${snack.name} Sales Surge 25% in Q4 Following New Marketing Campaign`,
      source: "Food Industry News",
      date: "2 days ago",
      summary: "The popular snack brand saw significant growth after launching their innovative social media strategy targeting Gen Z consumers.",
      sentiment: "positive" as const,
    },
    {
      id: 2,
      title: `Health Experts Weigh In on Popular Snack Trends Including ${snack.name}`,
      source: "Nutrition Today",
      date: "1 week ago",
      summary: "Nutritionists discuss the growing demand for better-for-you snack options and how traditional brands are adapting.",
      sentiment: "neutral" as const,
    },
    {
      id: 3,
      title: `Social Media Buzz: ${snack.name} Goes Viral on TikTok`,
      source: "Social Media Tribune",
      date: "2 weeks ago",
      summary: "A viral TikTok trend featuring creative recipes with the snack has generated millions of views and increased brand awareness.",
      sentiment: "positive" as const,
    },
  ];
  
  // Mock company data based on the snack brand
  const getCompanyInfo = (brand: string) => {
    const companyMap: Record<string, { name: string; stockTicker: string; stockExchange: string; price: number; change: number }> = {
      "Frito Lay": { name: "PepsiCo, Inc.", stockTicker: "PEP", stockExchange: "NASDAQ", price: 172.45, change: 2.1 },
      "Kettle": { name: "Campbell Soup Company", stockTicker: "CPB", stockExchange: "NYSE", price: 48.23, change: 1.8 },
      "Pringles": { name: "Kellanova", stockTicker: "K", stockExchange: "NYSE", price: 65.80, change: -0.5 },
    };
    return companyMap[brand] || { name: brand, stockTicker: undefined, stockExchange: undefined, price: undefined, change: undefined };
  };
  
  const companyInfo = getCompanyInfo(snack.brand);
  
  return {
    snack,
    timelineData,
    sentimentData,
    newsArticles,
    overallSentimentScore: 7.8,
    company: {
      name: companyInfo.name,
      stockTicker: companyInfo.stockTicker,
      stockExchange: companyInfo.stockExchange,
      currentStockPrice: companyInfo.price,
      stockChange: companyInfo.change,
    },
  };
};

export function SnackIndexDashboard() {
  const [selectedSnack, setSelectedSnack] = useState<TrendingSnack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSnackSelect = (snack: TrendingSnack) => {
    setSelectedSnack(snack);
  };

  const handleBackToIndex = () => {
    setSelectedSnack(null);
  };

  const filteredSnacks = allSnacks.filter(snack =>
    snack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snack.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSnack) {
    return (
      <SnackDetail
        data={generateSnackDetailData(selectedSnack)}
        onBack={handleBackToIndex}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-red-700 mb-4">
            The Snack Index
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Track, analyze, and discover the search performance
            of your favorite snacks with real-time data and
            insights.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search for a snack..."
            className="pl-10 py-3 rounded-xl border-0 bg-white shadow-lg focus:shadow-xl transition-shadow duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Trending Snacks */}
        {!searchQuery && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">
                Trending Snacks
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingSnacks.map((snack) => (
                <SnackCard
                  key={snack.id}
                  snack={snack}
                  onSelect={handleSnackSelect}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Snacks */}
        <section>
          <h2 className="text-2xl font-bold text-red-700 mb-6">
            {searchQuery ? `Search Results (${filteredSnacks.length})` : "All Snacks"}
          </h2>
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search Score Rankings</span>
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700"
                >
                  {filteredSnacks.length} Snacks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSnacks.length > 0 ? (
                <SnackList
                  snacks={filteredSnacks}
                  onSelect={handleSnackSelect}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No snacks found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
