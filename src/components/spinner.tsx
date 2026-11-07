import { LoaderCircle, type LucideProps } from "lucide-react";

import { cn } from "#lib/utils";

/** Decorative by default; for a standalone status, wrap it in a labelled `role="status"` parent. */
function Spinner({ className, ...props }: LucideProps) {
  return (
    <LoaderCircle
      data-slot="spinner"
      aria-hidden="true"
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Spinner };
