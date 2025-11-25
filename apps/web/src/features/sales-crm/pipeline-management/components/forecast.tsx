"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForecast } from "../hooks/useForecast";
import { formatCurrency } from "../utils/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Target,
  Building2,
  Circle
} from "lucide-react";

export function Forecast() {
  const { forecast, isLoading, period, setPeriod, formattedPeriod } = useForecast();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted animate-pulse rounded w-64 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-96" />
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Revenue Forecast</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Projected revenue based on pipeline deals
          </p>
        </div>
        <Card className="p-6 border-border">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No forecast data available</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Revenue Forecast</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Projected revenue based on pipeline deals
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as "month" | "quarter" | "year")}>
          <SelectTrigger className="w-full sm:w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6 border-border">
        <div className="space-y-6">
          {/* Period Info */}
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Forecast Period</p>
              <p className="text-lg font-semibold text-foreground">{formattedPeriod}</p>
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 bg-muted/50 border-border">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Expected Revenue</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {forecast.expected_revenue_formatted || formatCurrency(forecast.expected_revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on deal values
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-primary/5 border-primary/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Weighted Revenue</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {forecast.weighted_revenue_formatted || formatCurrency(forecast.weighted_revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on probability
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Deals List */}
          {forecast.deals && forecast.deals.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h4 className="text-lg font-semibold">Deals in Forecast</h4>
                <Badge variant="secondary" className="ml-auto">
                  {forecast.deals.length} {forecast.deals.length === 1 ? "deal" : "deals"}
                </Badge>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {forecast.deals.map((deal) => (
                  <Card 
                    key={deal.id} 
                    className="p-4 hover:bg-muted/50 transition-colors border-border"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{deal.title}</p>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {deal.account_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <Circle className="h-2 w-2 mr-1.5" />
                            {deal.stage_name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {deal.probability}% probability
                          </Badge>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0 sm:ml-4">
                        <p className="text-lg font-bold text-primary">
                          {deal.weighted_value_formatted || formatCurrency(deal.weighted_value)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Deal value: {deal.value_formatted || formatCurrency(deal.value)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

