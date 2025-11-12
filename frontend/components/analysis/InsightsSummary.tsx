import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsSummaryProps {
  summary: string;
}

export function InsightsSummary({ summary }: InsightsSummaryProps) {
  return (
    <Card className="border-none bg-card/70 shadow-lg backdrop-blur-lg">
      <CardHeader className="gap-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Executive Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Key themes extracted from the conversion dataset snapshot.
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}

