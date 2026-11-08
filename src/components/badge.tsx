import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "#lib/utils";

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

type BadgeProps = useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: {
      "data-slot": "badge",
      ...mergeProps<"span">({ className: cn(badgeVariants({ variant }), className) }, props),
    },
  });
}

export { Badge, badgeVariants };
export type { BadgeProps };
