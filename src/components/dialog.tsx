import type * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { popupLayer } from "#lib/recipes";
import { cn } from "#lib/utils";

const dialogOverlayVariants = cva(["fixed inset-0 bg-overlay", popupLayer]);

// Sits above the overlay and receives outside presses; tall popups scroll with it.
// safe: a popup taller than the viewport scrolls from its top instead of clipping it.
const dialogViewportVariants = cva([
  "fixed inset-0 flex items-center-safe justify-center overflow-y-auto overscroll-contain px-6",
  popupLayer,
]);

const dialogContentVariants = cva(
  "relative w-full rounded-2xl border border-border bg-popover text-popover-foreground shadow-overlay outline-none",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
      },
      padding: {
        default: "p-6",
        none: "p-0",
      },
    },
    defaultVariants: { size: "md", padding: "default" },
  },
);

const dialogFooterVariants = cva("mt-5", {
  variants: {
    layout: {
      end: "flex justify-end gap-3",
      stretch: "flex gap-2 [&>button]:flex-1",
      between: "flex items-center justify-between gap-3",
    },
  },
  defaultVariants: { layout: "end" },
});

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

type DialogOverlayProps = Omit<DialogPrimitive.Backdrop.Props, "className"> & {
  className?: string;
};

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(dialogOverlayVariants(), className)}
      {...props}
    />
  );
}

type DialogContentProps = Omit<DialogPrimitive.Popup.Props, "className"> &
  VariantProps<typeof dialogContentVariants> & {
    className?: string;
    portalProps?: DialogPrimitive.Portal.Props;
    overlayProps?: Omit<DialogPrimitive.Backdrop.Props, "className"> & { className?: string };
    viewportProps?: Omit<DialogPrimitive.Viewport.Props, "className"> & { className?: string };
  };

/**
 * Portal + overlay + scrolling viewport + popup. No built-in close button.
 * Restyle the parts for special layouts (e.g. a chrome-free full-width picker):
 * `padding="none"` + className on the popup, `overlayProps.className`, `viewportProps.className`.
 */
function DialogContent({
  className,
  size,
  padding,
  portalProps,
  overlayProps,
  viewportProps,
  ...props
}: DialogContentProps) {
  const { className: overlayClassName, ...overlayRest } = overlayProps ?? {};
  const { className: viewportClassName, ...viewportRest } = viewportProps ?? {};
  return (
    <DialogPortal {...portalProps}>
      <DialogOverlay className={overlayClassName} {...overlayRest} />
      <DialogPrimitive.Viewport
        data-slot="dialog-viewport"
        className={cn(dialogViewportVariants(), viewportClassName)}
        {...viewportRest}
      >
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(dialogContentVariants({ size, padding }), className)}
          {...props}
        />
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: Omit<DialogPrimitive.Title.Props, "className"> & { className?: string }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: Omit<DialogPrimitive.Description.Props, "className"> & { className?: string }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Content region. Imposes no padding or scrolling; callers add `overflow-y-auto` where needed. */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("min-h-0", className)} {...props} />;
}

function DialogFooter({
  className,
  layout,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof dialogFooterVariants>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(dialogFooterVariants({ layout }), className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
  dialogFooterVariants,
  dialogOverlayVariants,
  dialogViewportVariants,
};
export type { DialogContentProps };
