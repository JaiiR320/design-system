import {
  TooltipContent as TooltipContentPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/react/tooltip";
import type * as React from "react";

import { cn, type WithClassName } from "#lib/utils";

/**
 * Names an icon-only trigger, or describes any other (`role="tooltip"`, wired to the trigger).
 * After one tooltip opens, the next opens at once; no provider needed.
 */
function Tooltip({ delay = 400, ...props }: React.ComponentProps<typeof TooltipPrimitive>) {
  return <TooltipPrimitive delay={delay} {...props} />;
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipTriggerPrimitive>) {
  return <TooltipTriggerPrimitive {...props} />;
}

type TooltipContentProps = WithClassName<React.ComponentProps<typeof TooltipContentPrimitive>>;

function TooltipContent({
  className,
  side = "top",
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipContentPrimitive
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "w-fit max-w-xs rounded-lg border border-border bg-popover px-3 py-2 text-xs text-secondary-foreground shadow-raised",
        className,
      )}
      {...props}
    />
  );
}

export { Tooltip, TooltipContent, TooltipTrigger };
export type { TooltipContentProps };
