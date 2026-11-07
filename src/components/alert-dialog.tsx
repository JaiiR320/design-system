import type * as React from "react";
import { useRef } from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { Button, type ButtonProps } from "#components/button";
import {
  dialogContentVariants,
  dialogFooterVariants,
  dialogOverlayVariants,
  dialogViewportVariants,
} from "#components/dialog";
import { cn } from "#lib/utils";

// Base UI's AlertDialog never dismisses on outside press; Escape still closes it.
function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root {...props} />;
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}: Omit<AlertDialogPrimitive.Backdrop.Props, "className"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(dialogOverlayVariants(), className)}
      {...props}
    />
  );
}

type AlertDialogContentProps = Omit<AlertDialogPrimitive.Popup.Props, "className"> & {
  className?: string;
  size?: "sm" | "md";
  portalProps?: AlertDialogPrimitive.Portal.Props;
  overlayProps?: Omit<AlertDialogPrimitive.Backdrop.Props, "className"> & { className?: string };
  viewportProps?: Omit<AlertDialogPrimitive.Viewport.Props, "className"> & { className?: string };
};

function AlertDialogContent({
  className,
  size = "md",
  initialFocus,
  portalProps,
  overlayProps,
  viewportProps,
  ...props
}: AlertDialogContentProps) {
  const cancelHost = useRef<HTMLDivElement>(null);
  const { className: overlayClassName, ...overlayRest } = overlayProps ?? {};
  const { className: viewportClassName, ...viewportRest } = viewportProps ?? {};
  return (
    <AlertDialogPortal {...portalProps}>
      <AlertDialogOverlay className={overlayClassName} {...overlayRest} />
      <AlertDialogPrimitive.Viewport
        ref={cancelHost}
        data-slot="alert-dialog-viewport"
        className={cn(dialogViewportVariants(), viewportClassName)}
        {...viewportRest}
      >
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          // The safe choice gets focus first, whatever the footer order.
          initialFocus={
            initialFocus ??
            (() =>
              cancelHost.current?.querySelector<HTMLElement>('[data-slot="alert-dialog-cancel"]') ??
              true)
          }
          className={cn(dialogContentVariants({ size }), className)}
          {...props}
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("space-y-2", className)} {...props} />;
}

function AlertDialogTitle({
  className,
  ...props
}: Omit<AlertDialogPrimitive.Title.Props, "className"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: Omit<AlertDialogPrimitive.Description.Props, "className"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
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

function AlertDialogCancel({
  className,
  variant = "outline",
  size,
  ...props
}: Omit<AlertDialogPrimitive.Close.Props, "className"> &
  Pick<ButtonProps, "variant" | "size"> & { className?: string }) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant={variant} size={size} className={className} />}
      {...props}
    />
  );
}

/** A plain Button, not a Close: the caller closes after success and stays open on error. */
function AlertDialogAction({ variant = "destructive", ...props }: ButtonProps) {
  return <Button data-slot="alert-dialog-action" variant={variant} {...props} />;
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
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
export type { AlertDialogContentProps };
