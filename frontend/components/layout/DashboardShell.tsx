import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10 lg:px-12 xl:px-20",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

