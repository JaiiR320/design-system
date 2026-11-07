import { cva } from "class-variance-authority";

// Class recipes shared by several components. Component-specific recipes stay in their file.

/** Visible keyboard focus for interactive parts. Mouse focus stays quiet. */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Native `disabled` and Base UI `data-disabled` look the same. */
export const disabledState =
  "disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50";

/** Floating panel chrome for menus, select lists and popovers. */
export const popupSurface =
  "rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl shadow-black/50 outline-none";

/** Base UI Positioner layer; nested popups stack by portal order within it. */
export const popupLayer = "z-(--z-overlay)";

/** Rows inside menus and select lists; Base UI marks the active row with data-highlighted. */
export const menuItemVariants = cva(
  `flex w-full cursor-default items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition outline-none select-none ${disabledState}`,
  {
    variants: {
      variant: {
        default:
          "text-secondary-foreground data-highlighted:bg-accent data-highlighted:text-foreground",
        muted:
          "text-muted-foreground data-highlighted:bg-accent data-highlighted:text-secondary-foreground",
        destructive: "text-destructive-text data-highlighted:bg-destructive-surface/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const menuLabel = "px-3 py-1 text-xs font-medium text-muted-foreground";

export const menuSeparator = "my-1 h-px bg-border";
