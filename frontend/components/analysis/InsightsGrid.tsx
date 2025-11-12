import type { UXInsight } from "@/lib/types";

import { InsightCard } from "@/components/insights/InsightCard";

interface InsightsGridProps {
  insights: UXInsight[];
}

export function InsightsGrid({ insights }: InsightsGridProps) {
  if (!insights.length) {
    return (
      <div className="rounded-3xl border border-dashed border-muted-foreground/30 p-10 text-center text-sm text-muted-foreground">
        Insights will appear here once the analysis completes.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {insights.map((insight, index) => (
        <InsightCard insight={insight} index={index} key={insight.id} />
      ))}
    </div>
  );
}

