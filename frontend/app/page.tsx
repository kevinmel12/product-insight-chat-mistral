'use client';

import { useCallback, useMemo, useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { InsightsGrid } from "@/components/analysis/InsightsGrid";
import { InsightsSummary } from "@/components/analysis/InsightsSummary";
import { RunAnalysisHero } from "@/components/analysis/RunAnalysisHero";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { fetchInsights } from "@/lib/api-client";
import type { UXInsightsResponse } from "@/lib/types";

export default function HomePage() {
  const [data, setData] = useState<UXInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = useMemo(() => Boolean(data) && !isLoading, [data, isLoading]);
  const isInitial = !data && !isLoading;

  const runAnalysis = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetchInsights();
      setData(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to run analysis";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <DashboardShell>
      <div className="flex h-full gap-6">
        <div className="flex flex-1 flex-col overflow-auto">
          {isInitial ? (
            <RunAnalysisHero onRun={runAnalysis} loading={isLoading} error={error} />
          ) : isLoading ? (
            <AnalysisSkeleton />
          ) : hasData && data ? (
            <div className="flex flex-col gap-6">
              <InsightsSummary summary={data.summary} />
              <InsightsGrid insights={data.insights} />
            </div>
          ) : (
            <RunAnalysisHero onRun={runAnalysis} loading={isLoading} error={error} />
          )}
        </div>
        <div className="hidden h-[calc(100vh-7rem)] w-full max-w-md flex-shrink-0 lg:block">
          <ChatPanel
            enabled={hasData}
            lockedMessage="Run an analysis to unlock the assistant."
            welcomeMessage="Great! Ask about segments, bottlenecks, or growth ideas."
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full border-4 border-primary/20" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold">Analyzing your data...</h3>
        <p className="text-sm text-muted-foreground">
          Processing 12,330 sessions and generating UX insights
        </p>
      </div>
      <div className="mt-8 grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-lg opacity-50" />
        ))}
      </div>
    </div>
  );
}
