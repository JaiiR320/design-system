import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { disabledState, focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

/**
 * Size axis on its own so Toggle can reuse it: `cn(toggleBase, toggleVariant, buttonSizeVariants({ size }))`.
 * No default: callers pick the size (Button defaults to `md`). Size radii come last and win.
 */
const buttonSizeVariants = cva("", {
  variants: {
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
});

const buttonRecipe = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
    focusRing,
    disabledState,
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border border-border text-secondary-foreground hover:border-border-strong hover:bg-surface",
        ghost: "text-subtle-foreground hover:bg-surface hover:text-strong-foreground",
        "icon-ghost":
          "rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        "destructive-outline":
          "border border-border text-destructive-text hover:border-destructive-border/50 hover:bg-destructive-surface/20",
        "destructive-ghost":
          "rounded-lg text-destructive-text hover:bg-destructive-surface/30 hover:text-destructive-emphasis",
        warning: "bg-warning text-warning-foreground hover:bg-warning-hover",
        // amber-100 hover text has no token; kept literal for parity with IconButton warning.
        "warning-ghost":
          "rounded-lg text-warning-text hover:bg-warning-border/30 hover:text-amber-100",
        glass: "bg-on-image/35 text-on-image-foreground backdrop-blur-sm hover:bg-on-image/50",
        // The card rail owns the shared glass background/border around these.
        overlay: "rounded-none text-on-image-foreground hover:bg-on-image-hover",
        raised:
          "border border-border-strong bg-secondary text-secondary-foreground shadow-lg shadow-black/40 hover:bg-border-strong hover:text-highlight",
        link: "rounded-none p-0 font-normal text-primary underline underline-offset-2 hover:text-primary-hover",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonRecipe> &
  VariantProps<typeof buttonSizeVariants>;

/**
 * Button classes for elements that can't use <Button> (e.g. a router Link styled as a button).
 * Merged with cn so variant radii/padding override the base predictably.
 */
function buttonVariants({
  variant,
  size = "md",
  className,
}: ButtonVariantProps & { className?: string } = {}) {
  return cn(buttonRecipe({ variant }), buttonSizeVariants({ size }), className);
}

type ButtonProps = ButtonPrimitive.Props & ButtonVariantProps & { className?: string };

function Button({ className, variant, size, role, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      // Always passed (even undefined) so it replaces Base UI's role="button" on non-native
      // elements: a link rendered with nativeButton={false} keeps its link role.
      // Pass role="button" yourself when rendering some other non-button element.
      role={role}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

export { Button, buttonSizeVariants, buttonVariants };
export type { ButtonProps };
