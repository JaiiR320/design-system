import type * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "#lib/utils";

// No automatic role: callers add role="alert"/"status" only for dynamically revealed alerts.
const alertVariants = cva("border text-sm", {
  variants: {
    tone: {
      danger:
        "border-destructive-border/50 bg-destructive-surface/30 text-destructive-muted-foreground",
      warning: "border-warning-border/60 bg-warning-surface/20 text-warning-muted-foreground",
      info: "border-info-border/50 bg-info-surface/20 text-info-text",
      success: "border-success-border/50 bg-success-surface/20 text-success-text",
    },
    size: {
      default: "rounded-xl px-4 py-3",
      sm: "rounded-lg px-3 py-2",
      panel: "rounded-xl p-4",
    },
  },
  defaultVariants: { tone: "danger", size: "default" },
});

type AlertProps = useRender.ComponentProps<"div"> & VariantProps<typeof alertVariants>;

function Alert({ className, tone, size, render, ...props }: AlertProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      "data-slot": "alert",
      ...mergeProps<"div">({ className: cn(alertVariants({ tone, size }), className) }, props),
    },
  });
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-title" className={cn("text-sm font-semibold", className)} {...props} />
  );
}

// Inherits the tone colour; per-site body colours are passed as className.
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn(className)} {...props} />;
}

function AlertActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-actions"
      className={cn("mt-3 flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertActions, alertVariants };
export type { AlertProps };
