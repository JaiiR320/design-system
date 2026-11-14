import {
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialog as AlertDialogPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
} from "@ui-sdk/react/alert-dialog";
import type * as React from "react";

import { Button, buttonVariants, type ButtonProps } from "#components/button";
import {
  dialogContentVariants,
  dialogFooterVariants,
  dialogOverlayVariants,
} from "#components/dialog";
import { cn, type WithClassName } from "#lib/utils";

// Always modal; never closes on an outside press. Escape still closes it.
function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive>) {
  return <AlertDialogPrimitive {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogTriggerPrimitive>) {
  return <AlertDialogTriggerPrimitive {...props} />;
}

type AlertDialogOverlayProps = WithClassName<React.ComponentProps<typeof AlertDialogBackdrop>>;

// Every alert dialog dims what it interrupts, including a parent Dialog.
function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  return <AlertDialogBackdrop className={cn(dialogOverlayVariants(), className)} {...props} />;
}

type AlertDialogContentProps = WithClassName<
  React.ComponentProps<typeof AlertDialogContentPrimitive>
> & {
  size?: "sm" | "md";
  overlayProps?: AlertDialogOverlayProps;
};

// The safe choice gets focus first, whatever the footer order.
const cancelSelector = "[data-alert-dialog-cancel]";

function AlertDialogContent({
  className,
  size = "md",
  initialFocus = cancelSelector,
  overlayProps,
  ...props
}: AlertDialogContentProps) {
  return (
    <>
      <AlertDialogOverlay {...overlayProps} />
      <AlertDialogContentPrimitive
        initialFocus={initialFocus}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      />
    </>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("space-y-2", className)} {...props} />;
}

function AlertDialogTitle({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof AlertDialogTitlePrimitive>>) {
  return (
    <AlertDialogTitlePrimitive
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof AlertDialogDescriptionPrimitive>>) {
  return (
    <AlertDialogDescriptionPrimitive
      className={cn("text-sm text-subtle-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  layout,
  ...props
}: React.ComponentProps<"div"> & { layout?: "end" | "stretch" }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(dialogFooterVariants({ layout }), className)}
      {...props}
    />
  );
}

type AlertDialogCloseProps = WithClassName<React.ComponentProps<typeof AlertDialogClose>> &
  Pick<ButtonProps, "variant" | "size">;

function AlertDialogCancel({
  className,
  variant = "outline",
  size,
  ...props
}: AlertDialogCloseProps) {
  // The recipe sits on Close itself so it reaches a caller's `render` too.
  return (
    <AlertDialogClose
      data-alert-dialog-cancel=""
      render={<Button variant={variant} size={size} />}
      {...props}
      className={buttonVariants({ variant, size, className })}
    />
  );
}

/**
 * The agreeing answer: a Close part with `value="confirm"`. Pass `action` for the work; a
 * returned Promise keeps the dialog open and the button pending until it resolves, and a
 * rejection keeps it open so the caller can show the error.
 */
function AlertDialogAction({
  className,
  variant = "destructive",
  size,
  value = "confirm",
  ...props
}: AlertDialogCloseProps) {
  return (
    <AlertDialogClose
      value={value}
      render={<Button variant={variant} size={size} />}
      {...props}
      className={buttonVariants({ variant, size, className })}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
};
export type { AlertDialogContentProps };
