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
    <Card className="flex h-full flex-col border-none bg-card/80 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="gap-3 pb-4">
        <div className="flex items-center justify-between">
          <Badge className={styles.badge}>{styles.label}</Badge>
          {typeof index === "number" ? (
            <span className="text-sm font-medium text-muted-foreground">
              #{index + 1}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-xl font-semibold leading-tight">
          {insight.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">Evidence:</span>{" "}
          {insight.metric_evidence}
        </div>
        <div>
          <span className="font-semibold text-foreground">Hypothesis:</span>{" "}
          {insight.hypothesized_cause}
        </div>
        <div className="rounded-2xl bg-muted/60 p-4 text-foreground">
          <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommendation
          </div>
          <p className="mt-1 text-base leading-relaxed">
            {insight.recommendation}
          </p>
        </div>
        <div className="mt-auto text-xs uppercase tracking-wide text-muted-foreground">
          Target segment:{" "}
          <span className="font-semibold text-foreground">
            {insight.target_segment}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

