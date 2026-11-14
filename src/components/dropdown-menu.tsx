import {
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  Menu as MenuPrimitive,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import type { VariantProps } from "class-variance-authority";
import { ChevronRightIcon } from "lucide-react";
import type * as React from "react";

import { menuItemVariants, menuLabel, menuSeparator, popupSurface } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

const menuContentClassName = cn(popupSurface, "max-h-(--available-height) w-56 overflow-y-auto");

// Nonmodal by default: the page stays scrollable and clickable while open.
// Handle `onAction(value)` here, or `onSelect` on an item; a returned Promise keeps it pending.
function DropdownMenu({ modal = false, ...props }: React.ComponentProps<typeof MenuPrimitive>) {
  return <MenuPrimitive modal={modal} {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof MenuTrigger>) {
  return <MenuTrigger {...props} />;
}

type DropdownMenuContentProps = WithClassName<React.ComponentProps<typeof MenuContent>>;

// Renders in the browser's top layer, anchored to its trigger; flips and shifts to stay in view.
function DropdownMenuContent({
  className,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(menuContentClassName, className)}
      {...props}
    />
  );
}

type DropdownMenuItemProps = WithClassName<React.ComponentProps<typeof MenuItem>> &
  VariantProps<typeof menuItemVariants>;

function DropdownMenuItem({ className, variant, ...props }: DropdownMenuItemProps) {
  return (
    <MenuItem
      destructive={variant === "destructive" || undefined}
      className={cn(
        menuItemVariants({ variant }),
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuGroup(props: React.ComponentProps<typeof MenuGroup>) {
  return <MenuGroup {...props} />;
}

// Must sit inside a DropdownMenuGroup, which it names.
function DropdownMenuLabel({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuGroupLabel>>) {
  return <MenuGroupLabel className={cn(menuLabel, className)} {...props} />;
}

function DropdownMenuSeparator({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuSeparator>>) {
  return <MenuSeparator className={cn(menuSeparator, className)} {...props} />;
}

function DropdownMenuSub(props: React.ComponentProps<typeof MenuSub>) {
  return <MenuSub {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: WithClassName<Omit<React.ComponentProps<typeof MenuSubTrigger>, "children">> & {
  children?: React.ReactNode;
}) {
  return (
    <MenuSubTrigger
      className={cn(
        menuItemVariants(),
        "justify-between data-open:bg-accent data-open:text-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon
        className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </MenuSubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuSubContent>>) {
  return (
    <MenuSubContent
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      // A submenu flips to the other side when there's no room but doesn't slide back on
      // screen; capping it at the room it has keeps a phone-width submenu in view.
      className={cn(menuContentClassName, "w-48 max-w-(--available-width)", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
export type { DropdownMenuContentProps, DropdownMenuItemProps };
