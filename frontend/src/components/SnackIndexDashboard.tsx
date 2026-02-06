"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SnackCard } from "@/components/SnackCard";
import { SnackList } from "@/components/SnackList";
import { SnackDetail } from "@/components/SnackDetail";
import { TrendingSnack, SnackDetailData, Mention } from "@/types";
import { api } from "@/lib/api";

// Default colors for snacks
const getSnackColor = (id: number): string => {
  const colors = [
    "#FF6B35", // Doritos Nacho Cheese
    "#FFD23F", // Lay's Classic
    "#FF8C42", // Cheetos Puffs
    "#2E8B57", // Kettle Brand Sea Salt
    "#C70039", // Pringles Original
    "#FFC300", // Ruffles Cheddar
    "#FF69B4", // Sun Chips Harvest Cheddar
    "#32CD32", // Tostitos Scoops
  ];
  return colors[(id - 1) % colors.length];
};

// Function to fetch snack detail data from API
const fetchSnackDetailData = async (snackId: number): Promise<SnackDetailData> => {
  return await api.getSnackDetailData(snackId);
};

const fetchSnackMentionsData = async (snackId: number): Promise<any> => { return await api.getSnackMentions(snackId) }

interface SnackIndexDashboardProps {
  initialData?: TrendingSnack[];
}

export function SnackIndexDashboard({ initialData }: SnackIndexDashboardProps) {
  const [selectedSnack, setSelectedSnack] = useState<TrendingSnack | null>(null);
  const [selectedSnackDetail, setSelectedSnackDetail] = useState<SnackDetailData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingSnacks, setTrendingSnacks] = useState<TrendingSnack[]>(initialData || []);
  const [snackMentions, setSnackMentions] = useState<Mention[]>([]);
  const [allSnacks, setAllSnacks] = useState<TrendingSnack[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trendingData, allSnacksData] = await Promise.all([
          api.getTrendingSnacks(),
          api.getAllSnacks()
        ]);

        // Add colors to the snacks from API
        const trendingWithColors = trendingData.map(snack => ({
          ...snack,
          color: getSnackColor(snack.id)
        }));

        const allSnacksWithColors = allSnacksData.map(snack => ({
          ...snack,
          color: getSnackColor(snack.id)
        }));

        setTrendingSnacks(trendingWithColors);
        setAllSnacks(allSnacksWithColors);
      } catch (error) {
        console.error("Failed to fetch snacks data:", error);
        // Fallback to empty arrays if API fails
        setTrendingSnacks([]);
        setAllSnacks([]);
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchData();
    } else {
      // Add colors to initial data if provided
      const initialWithColors = initialData.map(snack => ({
        ...snack,
        color: getSnackColor(snack.id)
      }));
      setTrendingSnacks(initialWithColors);
    }
  }, [initialData]);

  const handleSnackSelect = async (snack: TrendingSnack) => {
    setSelectedSnack(snack);
    setDetailLoading(true);

    try {
      const detailData = await fetchSnackDetailData(snack.id);
      const mentionData = await fetchSnackMentionsData(snack.id)

      console.log(detailData)
      // console.log(mentionData)
      setSnackMentions(mentionData);
      setSelectedSnackDetail(detailData);
    } catch (error) {
      console.error("Failed to fetch snack detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToIndex = () => {
    setSelectedSnack(null);
    setSelectedSnackDetail(null);
  };

  const filteredSnacks = allSnacks.filter(snack =>
    snack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snack.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSnack) {
    if (detailLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading snack details...</p>
          </div>
        </div>
      );
    }

    if (selectedSnackDetail) {
      return (
        <SnackDetail
          data={selectedSnackDetail}
          onBack={handleBackToIndex}
        />
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading snack data...</p>
        </div>
      </div>
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
