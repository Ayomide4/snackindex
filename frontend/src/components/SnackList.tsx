"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { TrendingSnack } from "@/types";
import { formatPercentage } from "@/lib/utils";

interface SnackListProps {
  snacks: TrendingSnack[];
  onSelect: (snack: TrendingSnack) => void;
}

const getSnackEmoji = (snackName: string): string => {
  const name = snackName.toLowerCase();
  if (name.includes("dorito") || name.includes("chip")) return "🌮";
  if (name.includes("cheeto")) return "🧀";
  if (name.includes("pretzel")) return "🥨";
  if (name.includes("cookie") || name.includes("oreo")) return "🍪";
  if (name.includes("candy")) return "🍬";
  if (name.includes("chocolate")) return "🍫";
  if (name.includes("popcorn")) return "🍿";
  return "🍟"; // Default snack emoji
};

export function SnackList({ snacks, onSelect }: SnackListProps) {
  return (
    <div className="space-y-1">
      {snacks.map((snack, index) => {
        const isPositive = snack.change > 0;
        
        return (
          <div
            key={snack.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50/80 transition-colors group cursor-pointer"
            onClick={() => onSelect(snack)}
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-600 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                {index + 1}
              </div>
              
              {/* Snack Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: snack.color || "#FF6B35" }}
              >
                <span className="text-lg">{getSnackEmoji(snack.name)}</span>
              </div>
              
              {/* Snack Info */}
              <div className="flex-1">
                <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                  {snack.name}
                </div>
                <div className="text-sm text-gray-500">{snack.brand}</div>
              </div>
            </div>
            
            {/* Score */}
            <div className="text-right mr-6">
              <div className="text-xl font-bold text-gray-900">{snack.score}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Score
              </div>
            </div>
            
            {/* Change */}
            <div className="flex items-center gap-2 min-w-[80px] justify-end">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? "text-green-600" : "text-red-500"
                }`}
              >
                {formatPercentage(snack.change)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
