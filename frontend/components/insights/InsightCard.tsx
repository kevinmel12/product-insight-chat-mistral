import { type UXInsight } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const severityStyles: Record<
  UXInsight["severity"],
  { badge: string; label: string }
> = {
  high: { badge: "bg-red-100 text-red-700", label: "High severity" },
  medium: { badge: "bg-amber-100 text-amber-700", label: "Medium severity" },
  low: { badge: "bg-emerald-100 text-emerald-700", label: "Low severity" },
};

interface InsightCardProps {
  insight: UXInsight;
  index?: number;
}

export function InsightCard({ insight, index }: InsightCardProps) {
  const styles = severityStyles[insight.severity];

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <Badge className={styles.badge}>{styles.label}</Badge>
          {typeof index === "number" ? (
            <span className="text-xs font-medium text-muted-foreground">
              #{index + 1}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-lg font-semibold leading-tight">
          {insight.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Evidence
          </div>
          <p className="text-foreground">{insight.metric_evidence}</p>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Hypothesis
          </div>
          <p className="text-foreground">{insight.hypothesized_cause}</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendation
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {insight.recommendation}
          </p>
        </div>
        <div className="mt-auto border-t pt-3 text-xs text-muted-foreground">
          Target:{" "}
          <span className="font-medium text-foreground">
            {insight.target_segment}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

