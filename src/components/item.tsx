import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Separator, type SeparatorProps } from "#components/separator";
import { focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// Hover only when the row is rendered interactive (a/button, e.g. render={<Toggle />}).
// font-normal resets the weight a rendered Toggle/Button would otherwise pass to the description.
// Selected rows: `data-selected` on plain rows, `data-pressed` when rendered as a Toggle.
const itemVariants = cva(
  `flex w-full items-center justify-between gap-3 text-left transition motion-reduce:transition-none ${focusRing}`,
  {
    variants: {
      variant: {
        outline:
          "rounded-xl border border-border bg-background [&:is(a,button)]:hover:border-border-strong data-pressed:border-selected-border data-pressed:bg-selected data-selected:border-selected-border data-selected:bg-selected",
        muted: "rounded-xl border border-border bg-muted",
        plain: "border-0 bg-transparent",
      },
      size: {
        md: "p-4",
        sm: "rounded-lg px-3 py-2",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

type ItemProps = useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>;

function Item({ className, variant, size, render, ...props }: ItemProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: cn(itemVariants({ variant, size }), className) }, props),
    state: { slot: "item" },
  });
}

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-group" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function ItemSeparator({ className, ...props }: SeparatorProps) {
  return <Separator data-slot="item-separator" className={className} {...props} />;
}

function ItemMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-media" className={cn("shrink-0", className)} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("min-w-0 flex-1", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  itemVariants,
};
export type { ItemProps };
