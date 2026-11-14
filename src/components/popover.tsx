import {
  PopoverClose as PopoverClosePrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  Popover as PopoverPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
} from "@ui-sdk/react/popover";
import type * as React from "react";

import { popupSurface } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

// Nonmodal by default: the page stays scrollable and clickable while open.
function Popover({ modal = false, ...props }: React.ComponentProps<typeof PopoverPrimitive>) {
  return <PopoverPrimitive modal={modal} {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverTriggerPrimitive>) {
  return <PopoverTriggerPrimitive {...props} />;
}

type PopoverContentProps = WithClassName<React.ComponentProps<typeof PopoverContentPrimitive>>;

// Renders in the browser's top layer, anchored to its trigger; flips and shifts to stay in view.
function PopoverContent({
  className,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverContentPrimitive
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(popupSurface, "w-56", className)}
      {...props}
    />
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col", className)} {...props} />;
}

function PopoverTitle({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof PopoverTitlePrimitive>>) {
  return (
    <PopoverTitlePrimitive
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof PopoverDescriptionPrimitive>>) {
  return (
    <PopoverDescriptionPrimitive
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function PopoverClose(props: React.ComponentProps<typeof PopoverClosePrimitive>) {
  return <PopoverClosePrimitive {...props} />;
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
export type { PopoverContentProps };
