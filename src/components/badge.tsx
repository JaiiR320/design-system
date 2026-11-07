import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "#lib/utils";

// Four observed DeckDiff recipes; position, inset and responsive sizing stay local.
const badgeVariants = cva("", {
  variants: {
    variant: {
      neutral: "rounded-lg bg-surface px-2 py-1 text-sm text-muted-foreground",
      selected:
        "rounded-full border border-highlight-strong/60 bg-primary/95 py-1 text-center text-xs font-bold tracking-label text-primary-foreground uppercase shadow-raised",
      outline:
        "rounded-full border border-highlight/50 bg-surface-glass/90 px-3 py-1 text-xs font-semibold tracking-label text-selected-foreground uppercase shadow-xl shadow-black/30",
      order:
        "flex size-6 items-center justify-center rounded-full bg-secondary p-0 text-xs font-semibold text-muted-foreground data-selected:bg-primary data-selected:text-primary-foreground",
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
