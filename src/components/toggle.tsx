import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { disabledState, focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// Off-state hovers are scoped to not-data-pressed so hovering an active toggle changes nothing.
const toggleCva = cva(
  `inline-flex items-center justify-center gap-2 text-sm font-medium transition motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4 ${focusRing} ${disabledState}`,
  {
    variants: {
      variant: {
        outline:
          "rounded-xl border border-border text-secondary-foreground not-data-pressed:hover:border-border-strong not-data-pressed:hover:bg-surface data-pressed:border-selected-border data-pressed:bg-selected data-pressed:text-selected-foreground",
        accent:
          "rounded-md border border-border bg-surface text-secondary-foreground not-data-pressed:hover:bg-secondary data-pressed:border-ring/70 data-pressed:bg-ring/15 data-pressed:text-info-text",
        segmented:
          "rounded-xl text-subtle-foreground not-data-pressed:hover:text-strong-foreground data-pressed:bg-primary data-pressed:text-primary-foreground",
        round:
          "size-10 rounded-full border border-border bg-background p-0 opacity-30 grayscale not-data-pressed:hover:border-border-strong not-data-pressed:hover:opacity-60 data-pressed:border-on-image-border/40 data-pressed:opacity-100 data-pressed:grayscale-0 data-pressed:shadow-glow",
      },
      // Mirrors Button's sizes; size radii win over the variant's.
      size: {
        xs: "rounded-lg px-3 py-1.5 text-sm",
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-4 py-3 text-sm",
        "icon-xs": "size-5 rounded-md p-0",
        "icon-sm": "size-7 p-0",
        icon: "p-2.5 text-sm",
        "icon-lg": "size-12 rounded-full p-0",
        none: "p-0",
      },
    },
  },
);

type ToggleVariant = NonNullable<VariantProps<typeof toggleCva>["variant"]>;
type ToggleSize = NonNullable<VariantProps<typeof toggleCva>["size"]>;

const defaultSizes: Record<ToggleVariant, ToggleSize> = {
  outline: "sm",
  accent: "icon-sm",
  segmented: "md",
  round: "none",
};

/** Toggle classes; when size is omitted it follows the variant (outline sm, accent icon-sm, segmented md, round none). */
function toggleVariants({
  variant = "outline",
  size,
  className,
}: { variant?: ToggleVariant | null; size?: ToggleSize | null; className?: string } = {}) {
  const resolved = variant ?? "outline";
  return cn(toggleCva({ variant: resolved, size: size ?? defaultSizes[resolved] }), className);
}

type ToggleProps = Omit<TogglePrimitive.Props, "className"> &
  VariantProps<typeof toggleVariants> & { className?: string };

function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={toggleVariants({ variant, size, className })}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
export type { ToggleProps };
