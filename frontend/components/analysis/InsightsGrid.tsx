import type { UXInsight } from "@/lib/types";

import { InsightCard } from "@/components/insights/InsightCard";

interface InsightsGridProps {
  insights: UXInsight[];
}

export function InsightsGrid({ insights }: InsightsGridProps) {
  if (!insights.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
        Insights will appear here once the analysis completes.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, index) => (
        <InsightCard insight={insight} index={index} key={insight.id} />
      ))}
    </div>
  );
}

