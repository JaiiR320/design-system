import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { buttonSizeVariants } from "#components/button";
import { disabledState, focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// Off-state hovers are scoped to not-data-pressed so hovering an active toggle changes nothing.
const toggleCva = cva(
  `inline-flex items-center justify-center gap-2 transition motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4 ${focusRing} ${disabledState}`,
  {
    variants: {
      variant: {
        outline:
          "rounded-xl border border-border text-secondary-foreground not-data-pressed:hover:border-border-strong not-data-pressed:hover:bg-surface data-pressed:border-selected-border data-pressed:bg-selected data-pressed:text-selected-foreground",
        accent:
          "rounded-md border border-border bg-surface text-secondary-foreground not-data-pressed:hover:bg-secondary data-pressed:border-ring/70 data-pressed:bg-ring/15 data-pressed:text-info-text",
        segmented:
          "rounded-xl text-subtle-foreground not-data-pressed:hover:text-strong-foreground data-pressed:bg-primary data-pressed:text-primary-foreground",
      },
    },
  },
);

type ToggleVariant = NonNullable<VariantProps<typeof toggleCva>["variant"]>;
type ToggleSize = NonNullable<VariantProps<typeof buttonSizeVariants>["size"]>;

const defaultSizes: Record<ToggleVariant, ToggleSize> = {
  outline: "sm",
  accent: "sm",
  segmented: "md",
};

/**
 * Toggle classes. When size is omitted it follows the variant (segmented md, others sm).
 * `variant={null}` keeps only structure, focus and disabled classes (no size either unless
 * given) so an app can supply its own look through className.
 */
function toggleVariants({
  variant = "outline",
  size,
  className,
}: { variant?: ToggleVariant | null; size?: ToggleSize | null; className?: string } = {}) {
  return cn(
    toggleCva({ variant }),
    buttonSizeVariants({ size: size ?? (variant ? defaultSizes[variant] : null) }),
    className,
  );
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
