"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingSnack } from "@/types";
import { formatPercentage } from "@/lib/utils";

interface SnackCardProps {
  snack: TrendingSnack;
  onSelect: (snack: TrendingSnack) => void;
}

export function SnackCard({ snack, onSelect }: SnackCardProps) {
  const isPositive = snack.change > 0;

  const renderIcons = () => {
    if (snack.change > 0) return <TrendingUp data-testid="trending-up" className="h-4 w-4 text-green-600" />;
    else if (snack.change < 0) return <TrendingDown data-testid="trending-down" className="h-4 w-4 text-red-500" />
    else return <Minus data-testid="neutral" className="h-4 w-4 text-gray-500" />
  }

  return (
    <Card
      data-testid="snack-card"
      className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
      onClick={() => onSelect(snack)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg text-gray-900 mb-1 group-hover:text-red-700 transition-colors">
              {snack.name}
            </h3>
            <p className="text-sm text-gray-500">{snack.brand}</p>
          </div>
          <div className="flex items-center gap-1">
            {renderIcons()}
            <span
              className={`text-sm ${snack.change > 0 ? "text-green-600" : snack.change < 0 ? "text-red-500" : "text-gray-500"
                }`}
            >
              {formatPercentage(snack.change)}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{snack.score}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Search Score
            </div>
          </div>

          <div className="text-right">
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className={`${snack.change > 0
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : snack.change < 0 ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-200 text-gray-500 hover:text-gray-500"
                }`}
            >
              {isPositive ? "Trending" : snack.change < 0 ? "Declining" : "Neutral"}
            </Badge>
          </div>
        </div>

        {/* Search score bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500 group-hover:from-red-600 group-hover:to-orange-600"
              style={{ width: `${snack.score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
