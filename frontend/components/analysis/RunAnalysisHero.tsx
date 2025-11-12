import { Button } from "@/components/ui/button";

interface RunAnalysisHeroProps {
  loading?: boolean;
  onRun?: () => void;
  error?: string | null;
}

export function RunAnalysisHero({
  loading = false,
  onRun,
  error,
}: RunAnalysisHeroProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8 rounded-lg border bg-card p-12 text-center lg:min-h-[500px]">
      <div className="flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Automated UX Intelligence
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Ready to Analyze
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
            Launch the automated analysis to identify conversion patterns and UX
            issues from 12,330 e-commerce sessions. Your insights will render
            instantly.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={onRun}
          disabled={loading}
          size="lg"
          className="h-11 min-w-[200px]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Analyzing…
            </span>
          ) : (
            "Run Analysis"
          )}
        </Button>
        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <InfoIcon className="h-3.5 w-3.5" />
          Sample dataset • No upload required
        </div>
      </div>
    </section>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        className="stroke-current"
        strokeWidth="1.5"
      />
      <path
        d="M10 9v5"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6" r="1" className="fill-current" />
    </svg>
  );
}

