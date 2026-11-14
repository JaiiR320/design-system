import { mergeProps, renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn, type WithClassName } from "#lib/utils";

// No imposed layout, padding or overflow; only the elevated `panel` variant adds a shadow.
const cardVariants = cva("rounded-xl border border-border text-card-foreground", {
  variants: {
    variant: {
      default: "bg-card",
      inset: "bg-muted",
      outline: "bg-transparent",
      panel: "rounded-2xl bg-card shadow-panel",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    },
  },
  defaultVariants: { variant: "default", padding: "none" },
});

type CardProps = WithClassName<PartProps<"div">> & VariantProps<typeof cardVariants>;

function Card({ className, variant, padding, render, ...props }: CardProps) {
  return renderElement(
    "div",
    mergeProps(
      { "data-slot": "card", className: cn(cardVariants({ variant, padding }), className) },
      props,
    ),
    render,
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-start justify-between gap-3", className)}
      {...props}
    />
  );
}

/** Native h3 by default; pick the right level with `render={<h2 />}`. */
function CardTitle({ className, render, ...props }: WithClassName<PartProps<"h3">>) {
  return renderElement(
    "h3",
    mergeProps(
      {
        "data-slot": "card-title",
        className: cn("text-sm font-semibold text-foreground", className),
      },
      props,
    ),
    render,
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("shrink-0", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn(className)} {...props} />;
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  cardVariants,
};
