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
      <div className="grid gap-10 lg:grid-cols-[1fr] xl:grid-cols-[7fr_5fr]">
        <div className="flex flex-col gap-10">
          {isInitial ? (
            <RunAnalysisHero onRun={runAnalysis} loading={isLoading} error={error} />
          ) : isLoading ? (
            <AnalysisSkeleton />
          ) : hasData && data ? (
            <section className="flex flex-col gap-8">
              <InsightsSummary summary={data.summary} />
              <Separator className="hidden lg:block" />
              <InsightsGrid insights={data.insights} />
            </section>
          ) : (
            <RunAnalysisHero onRun={runAnalysis} loading={isLoading} error={error} />
          )}
        </div>
        <div className="flex">
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
    <section className="flex flex-col gap-8">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-3xl" />
        ))}
      </div>
    </section>
  );
}
