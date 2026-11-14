import { mergeProps, renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, type WithClassName } from "#lib/utils";

// Position, inset and app-specific looks stay with the caller (`variant={null}` + className).
const badgeVariants = cva("", {
  variants: {
    variant: {
      neutral: "rounded-lg bg-surface px-2 py-1 text-sm text-muted-foreground",
      outline: "rounded-lg border border-border px-2 py-1 text-sm text-muted-foreground",
    },
  },
  defaultVariants: { variant: "neutral" },
});

type BadgeProps = WithClassName<PartProps<"span">> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, render, ...props }: BadgeProps) {
  return renderElement(
    "span",
    mergeProps(
      { "data-slot": "badge", className: cn(badgeVariants({ variant }), className) },
      props,
    ),
    render,
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
