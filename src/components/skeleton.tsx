import type * as React from "react";

import { cn } from "#lib/utils";

// Decorative placeholder; callers size it and announce loading on a labelled parent.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-surface motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
