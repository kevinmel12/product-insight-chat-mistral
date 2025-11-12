import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6 lg:px-8">
          <h1 className="text-xl font-semibold">InsightChat</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">UX Analytics Assistant</span>
          </div>
        </div>
      </header>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 px-6 py-6 lg:px-8",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

