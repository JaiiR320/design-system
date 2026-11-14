import { Separator as SeparatorPrimitive } from "@ui-sdk/react/separator";
import type * as React from "react";

import { cn, type WithClassName } from "#lib/utils";

type SeparatorProps = WithClassName<React.ComponentProps<typeof SeparatorPrimitive>>;

// No margins: dividers set their own spacing (e.g. `mx-1 h-10`) or flex-1 in a caption row.
function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
