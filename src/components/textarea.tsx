import type * as React from "react";

import { inputVariants } from "#components/input";
import { cn } from "#lib/utils";

/** Native textarea with Input's md chrome at text-sm. Inside Field: `<FieldControl render={<Textarea />} />`. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputVariants(), "text-sm", className)}
      {...props}
    />
  );
}

export { Textarea };
