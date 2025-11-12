import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsSummaryProps {
  summary: string;
}

export function InsightsSummary({ summary }: InsightsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Executive Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Key themes extracted from 12,330 e-commerce sessions
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}

