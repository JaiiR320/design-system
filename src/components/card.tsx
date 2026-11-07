import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#lib/utils";

// No imposed layout, padding, overflow or shadow: callers compose those locally.
const cardVariants = cva("rounded-xl border border-border text-card-foreground", {
  variants: {
    variant: {
      default: "bg-card",
      inset: "bg-muted",
      glass: "bg-surface-glass/80",
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

type CardProps = useRender.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

function Card({ className, variant, padding, render, ...props }: CardProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { className: cn(cardVariants({ variant, padding }), className) },
      props,
    ),
    state: { slot: "card" },
  });
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
function CardTitle({ className, render, ...props }: useRender.ComponentProps<"h3">) {
  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">(
      { className: cn("text-sm font-semibold text-foreground", className) },
      props,
    ),
    state: { slot: "card-title" },
  });
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
