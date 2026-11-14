import { Textarea as TextareaPrimitive } from "@ui-sdk/react/textarea";
import type * as React from "react";

import { inputVariants } from "#components/input";
import { cn, type WithClassName } from "#lib/utils";

type TextareaProps = WithClassName<React.ComponentProps<typeof TextareaPrimitive>>;

/**
 * UI SDK's Textarea with Input's chrome at lg padding. It joins a Field directly. `autoResize`
 * grows it with the text (bound it with `min-h-*` and `max-h-*`); `submitShortcut` submits on Enter.
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <TextareaPrimitive className={cn(inputVariants({ inputSize: "lg" }), className)} {...props} />
  );
}

export { Textarea };
export type { TextareaProps };
