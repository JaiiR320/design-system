import type * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { popupLayer, popupSurface } from "#lib/recipes";
import { cn } from "#lib/utils";

// Nonmodal by default: the page stays scrollable and clickable while open.
function Popover({ modal = false, ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root modal={modal} {...props} />;
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = Omit<PopoverPrimitive.Popup.Props, "className"> &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "anchor"
  > & {
    className?: string;
    portalProps?: PopoverPrimitive.Portal.Props;
    positionerProps?: Omit<PopoverPrimitive.Positioner.Props, "className"> & { className?: string };
  };

function PopoverContent({
  className,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 8,
  anchor,
  portalProps,
  positionerProps,
  ...props
}: PopoverContentProps) {
  const { className: positionerClassName, ...restPositionerProps } = positionerProps ?? {};
  return (
    <PopoverPrimitive.Portal data-slot="popover-portal" {...portalProps}>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
        className={cn(popupLayer, positionerClassName)}
        {...restPositionerProps}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(popupSurface, "w-56", className)}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col", className)} {...props} />;
}

function PopoverTitle({
  className,
  ...props
}: Omit<PopoverPrimitive.Title.Props, "className"> & { className?: string }) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: Omit<PopoverPrimitive.Description.Props, "className"> & { className?: string }) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function PopoverClose(props: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
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
