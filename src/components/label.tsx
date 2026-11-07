import type * as React from "react";

import { cn } from "#lib/utils";

/** Native label for controls outside Field (Field has its own connected FieldLabel). */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("block text-sm font-medium text-subtle-foreground", className)}
      {...props}
    />
  );
}

export { Label };
