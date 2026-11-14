import {
  ScrollAreaCorner as ScrollAreaCornerPrimitive,
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport as ScrollAreaViewportPrimitive,
} from "@ui-sdk/react/scroll-area";
import { cva } from "class-variance-authority";
import type * as React from "react";

import { focusRing } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

// Compound parts: compose Root > Viewport + ScrollBar(s) + Corner explicitly.

/**
 * Root. Give it a size. Scrollbars show whenever their axis overflows (`type="auto"`); pass
 * `type="hover"` or `"scroll"` to show them less. `stickToEnd` keeps a growing end in view, like a chat.
 */
function ScrollArea({
  className,
  type = "auto",
  ...props
}: WithClassName<React.ComponentProps<typeof ScrollAreaPrimitive>>) {
  return (
    <ScrollAreaPrimitive
      type={type}
      className={cn("relative min-h-0 min-w-0", className)}
      {...props}
    />
  );
}

/** The scrolling element. Give it `tabIndex={0}` and a label when it holds no focusable content. */
function ScrollAreaViewport({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof ScrollAreaViewportPrimitive>>) {
  return (
    <ScrollAreaViewportPrimitive
      className={cn("size-full rounded-[inherit]", focusRing, className)}
      {...props}
    />
  );
}

const scrollBarVariants = cva(
  "flex touch-none p-px opacity-0 transition-opacity select-none data-visible:opacity-100 motion-reduce:transition-none",
  {
    variants: {
      orientation: {
        vertical: "w-2.5",
        horizontal: "h-2.5 flex-col",
      },
    },
    defaultVariants: { orientation: "vertical" },
  },
);

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: WithClassName<React.ComponentProps<typeof ScrollAreaScrollbar>>) {
  return (
    <ScrollAreaScrollbar
      orientation={orientation}
      className={cn(scrollBarVariants({ orientation }), className)}
      {...props}
    >
      <ScrollAreaThumb className="flex-1 rounded-full bg-border-strong" />
    </ScrollAreaScrollbar>
  );
}

function ScrollAreaCorner(props: React.ComponentProps<typeof ScrollAreaCornerPrimitive>) {
  return <ScrollAreaCornerPrimitive {...props} />;
}

export { ScrollArea, ScrollAreaViewport, ScrollBar, ScrollAreaCorner };
