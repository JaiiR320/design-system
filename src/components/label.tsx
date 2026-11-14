import { Label as LabelPrimitive } from "@ui-sdk/react/label";
import type * as React from "react";

import { cn, type WithClassName } from "#lib/utils";

/** For controls outside Field (Field has its own connected FieldLabel). A press on it reaches its control. */
function Label({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof LabelPrimitive>>) {
  return (
    <LabelPrimitive
      className={cn("block text-sm font-medium text-subtle-foreground", className)}
      {...props}
    />
  );
}

export { Label };
