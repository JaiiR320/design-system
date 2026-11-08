import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { isValidElement } from "react";

import { disabledState, focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

/**
 * Size axis on its own so Toggle can reuse it: `cn(toggleBase, toggleVariant, buttonSizeVariants({ size }))`.
 * Sizes only set padding/dimensions; radius belongs to the variant (or the caller's className).
 * No default: callers pick the size (Button defaults to `md`).
 */
const buttonSizeVariants = cva("", {
  variants: {
    size: {
      xs: "px-3 py-1.5",
      sm: "px-3 py-2",
      md: "px-4 py-2",
      lg: "px-4 py-3",
      "icon-xs": "size-5 p-0",
      "icon-sm": "size-7 p-0",
      icon: "p-2.5",
      "icon-lg": "size-12 p-0",
      none: "p-0",
    },
  },
});

const buttonRecipe = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl transition motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
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
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        "destructive-outline":
          "border border-border text-destructive-text hover:border-destructive-border/50 hover:bg-destructive-surface/20",
        "destructive-ghost":
          "text-destructive-text hover:bg-destructive-surface/30 hover:text-destructive-emphasis",
        warning: "bg-warning text-warning-foreground hover:bg-warning-hover",
        link: "rounded-none p-0 text-primary underline underline-offset-2 hover:text-primary-hover",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

// `variant={null}` keeps only the structural, focus and disabled classes, so an app can
// layer its own look through className without fighting a built-in variant.
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

type KeyEvent = Parameters<NonNullable<ButtonProps["onKeyDown"]>>[0];

// Base UI gives links rendered with nativeButton={false} button keys: it blocks Space's
// page scroll and clicks on keyup. A real link only activates on Enter (left to the
// browser), so Space is handed back to the browser. Disabled links stay blocked by Base UI.
function keepLinkSpace(event: KeyEvent) {
  const target = event.currentTarget;
  if (event.key === " " && event.target === target && target.matches("a[href]")) {
    event.preventBaseUIHandler();
  }
}

function Button({ className, variant, size, render, onKeyDown, onKeyUp, ...props }: ButtonProps) {
  // An <a href> keeps its link role; any other non-native element keeps Base UI's role="button".
  const isLink =
    isValidElement<{ href?: string }>(render) && render.type === "a" && Boolean(render.props.href);
  return (
    <ButtonPrimitive
      data-slot="button"
      render={render}
      className={buttonVariants({ variant, size, className })}
      {...(isLink && { role: undefined })}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        keepLinkSpace(event);
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        keepLinkSpace(event);
      }}
    />
  );
}

export { Button, buttonSizeVariants, buttonVariants };
export type { ButtonProps };
