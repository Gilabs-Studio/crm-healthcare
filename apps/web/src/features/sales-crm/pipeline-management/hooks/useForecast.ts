"use client";

import { useState, useMemo } from "react";
import { useForecast as useForecastQuery } from "./usePipelines";

export function useForecast() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const { data, isLoading } = useForecastQuery({ period });

  const forecast = data?.data;

  const formattedPeriod = useMemo(() => {
    if (!forecast) return "";

    const start = new Date(forecast.period.start);
    
    if (forecast.period.type === "month") {
      return start.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    } else if (forecast.period.type === "quarter") {
      return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
    } else {
      return start.getFullYear().toString();
    }
  }, [forecast]);

  return {
    forecast,
    isLoading,
    period,
    setPeriod,
    formattedPeriod,
  };
}

