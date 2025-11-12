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
    <section className="flex flex-1 flex-col items-start justify-center gap-10 rounded-3xl bg-card/60 p-10 shadow-sm backdrop-blur lg:min-h-[640px]">
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1 text-sm font-medium text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Automated UX Intelligence
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Ready to Analyze
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Launch the automated analysis to identify conversion patterns and UX
            issues from the sample dataset. Your insights will render instantly,
            no uploads required.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          onClick={onRun}
          disabled={loading}
          className="h-12 w-full max-w-xs rounded-full text-base shadow-lg hover:shadow-xl"
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4" />
          Uses a sample dataset. No upload required.
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

