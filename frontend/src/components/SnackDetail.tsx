"use client";

import { ArrowLeft, TrendingUp, TrendingDown, GitCompare, MessageCircle, Calendar, ExternalLink, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SnackDetailData } from "@/types";
import { formatPercentage } from "@/lib/utils";

interface SnackDetailProps {
  data: SnackDetailData;
  onBack: () => void;
}

export function SnackDetail({ data, onBack }: SnackDetailProps) {
  const { snack, timelineData, sentimentData, newsArticles, overallSentimentScore, company } = data;
  const isPositive = snack.change > 0;
  const isStockPositive = (company.stockChange || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Index
          </Button>
        </div>

        {/* Snack Overview */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl text-gray-900 mb-2">
                  {snack.name}
                </CardTitle>
                <p className="text-xl text-gray-600">{snack.brand}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 mb-2">{snack.score}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  Current Search Score
                </div>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <span
                    className={`text-lg font-semibold ${
                      isPositive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {formatPercentage(snack.change)}
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <GitCompare className="h-4 w-4 mr-2" />
                Compare with Other Snacks
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Score Timeline */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Search Score Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#DC2626"
                        strokeWidth={3}
                        dot={{ fill: "#DC2626", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* News Articles */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-red-600" />
                  Recent News & Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsArticles.map((article) => (
                    <div key={article.id} className="border-l-4 border-red-200 pl-4 hover:bg-gray-50/50 p-3 rounded-r-lg transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-gray-900 font-medium leading-relaxed">
                          {article.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`ml-2 ${
                            article.sentiment === 'positive'
                              ? 'bg-green-100 text-green-700'
                              : article.sentiment === 'negative'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {article.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{article.source}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {article.date}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Company Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-red-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Parent Company</div>
                    <div className="text-lg font-semibold text-gray-900">{company.name}</div>
                  </div>
                  
                  {company.stockTicker && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Stock Information</div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {company.stockExchange}:{company.stockTicker}
                            </Badge>
                          </div>
                          {company.currentStockPrice && (
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-lg font-bold text-gray-900">
                                  ${company.currentStockPrice.toFixed(2)}
                                </span>
                              </div>
                              {company.stockChange !== undefined && (
                                <div className="flex items-center gap-1 justify-end mt-1">
                                  {isStockPositive ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                  )}
                                  <span
                                    className={`text-xs font-medium ${
                                      isStockPositive ? "text-green-600" : "text-red-500"
                                    }`}
                                  >
                                    {company.stockChange > 0 ? "+" : ""}{company.stockChange.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {!company.currentStockPrice && (
                          <div className="text-sm text-gray-400 italic">
                            Stock price not available
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Social Media Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData.map((sentiment) => (
                    <div key={sentiment.type}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{sentiment.type}</span>
                        <span className="text-sm font-semibold text-gray-900">{sentiment.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${sentiment.percentage}%`,
                            backgroundColor: sentiment.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{overallSentimentScore}/10</div>
                  <div className="text-sm text-gray-500 mb-2">Overall Sentiment Score</div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                    {overallSentimentScore >= 7 ? "Highly Positive" : 
                     overallSentimentScore >= 5 ? "Positive" : 
                     overallSentimentScore >= 3 ? "Neutral" : "Negative"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
