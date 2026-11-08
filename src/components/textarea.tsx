import type * as React from "react";

import { inputVariants } from "#components/input";
import { cn } from "#lib/utils";

/** Native textarea with Input's chrome at lg padding. Inside Field: `<FieldControl render={<Textarea />} />`. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputVariants({ inputSize: "lg" }), className)}
      {...props}
    />
  );
}

export { Textarea };
