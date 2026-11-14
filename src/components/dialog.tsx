import {
  DialogBackdrop,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  Dialog as DialogPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from "@ui-sdk/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn, type WithClassName } from "#lib/utils";

const dialogOverlayVariants = cva("fixed inset-0 bg-overlay");

// UI SDK puts the content in the browser's top layer, above every z-index. It centers in the
// viewport and scrolls itself when taller than it.
const dialogContentVariants = cva(
  "fixed inset-0 m-auto h-fit max-h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover text-popover-foreground shadow-overlay outline-none",
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

function Dialog(props: React.ComponentProps<typeof DialogPrimitive>) {
  return <DialogPrimitive {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogTriggerPrimitive>) {
  return <DialogTriggerPrimitive {...props} />;
}

/** Closes the dialog. An `action` returning a Promise keeps it open, pending, until it resolves. */
function DialogClose(props: React.ComponentProps<typeof DialogClosePrimitive>) {
  return <DialogClosePrimitive {...props} />;
}

type DialogOverlayProps = WithClassName<React.ComponentProps<typeof DialogBackdrop>>;

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return <DialogBackdrop className={cn(dialogOverlayVariants(), className)} {...props} />;
}

type DialogContentProps = WithClassName<React.ComponentProps<typeof DialogContentPrimitive>> &
  VariantProps<typeof dialogContentVariants> & {
    overlayProps?: DialogOverlayProps;
  };

/**
 * Overlay + content. No built-in close button. Restyle the parts for special layouts (e.g. a
 * chrome-free full-width picker): `padding="none"` + className, and `overlayProps.className`.
 */
function DialogContent({ className, size, padding, overlayProps, ...props }: DialogContentProps) {
  return (
    <>
      <DialogOverlay {...overlayProps} />
      <DialogContentPrimitive
        className={cn(dialogContentVariants({ size, padding }), className)}
        {...props}
      />
    </>
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
}: WithClassName<React.ComponentProps<typeof DialogTitlePrimitive>>) {
  return (
    <DialogTitlePrimitive
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof DialogDescriptionPrimitive>>) {
  return (
    <DialogDescriptionPrimitive
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
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
  dialogFooterVariants,
  dialogOverlayVariants,
};
export type { DialogContentProps, DialogOverlayProps };
