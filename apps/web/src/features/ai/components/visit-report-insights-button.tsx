"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAnalyzeVisitReport } from "../hooks/useAnalyzeVisitReport";
import type { VisitReportInsight } from "../types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface VisitReportInsightsButtonProps {
  visitReportId: string;
}

export function VisitReportInsightsButton({
  visitReportId,
}: VisitReportInsightsButtonProps) {
  const [open, setOpen] = useState(false);
  const [insight, setInsight] = useState<VisitReportInsight | null>(null);
  const { mutate: analyze, isPending } = useAnalyzeVisitReport();

  const handleAnalyze = () => {
    analyze(
      { visit_report_id: visitReportId },
      {
        onSuccess: (response) => {
          setInsight(response.data.data);
          setOpen(true);
        },
      }
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "negative":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle2 className="h-4 w-4" />;
      case "negative":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Button
        onClick={handleAnalyze}
        disabled={isPending}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Get AI Insights
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Insights</DialogTitle>
            <DialogDescription>
              AI-generated analysis of this visit report
            </DialogDescription>
          </DialogHeader>

          {insight && (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{insight.summary}</p>
              </div>

              {/* Sentiment */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Sentiment</h3>
                <Badge
                  className={getSentimentColor(insight.sentiment)}
                  variant="outline"
                >
                  {getSentimentIcon(insight.sentiment)}
                  <span className="ml-1 capitalize">{insight.sentiment}</span>
                </Badge>
              </div>

              {/* Key Points */}
              {insight.key_points && insight.key_points.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {insight.key_points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {insight.action_items && insight.action_items.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Action Items</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {insight.action_items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insight.recommendations && insight.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

