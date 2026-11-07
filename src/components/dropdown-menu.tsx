import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { VariantProps } from "class-variance-authority";
import { ChevronRightIcon } from "lucide-react";

import { menuItemVariants, menuLabel, menuSeparator, popupLayer, popupSurface } from "#lib/recipes";
import { cn } from "#lib/utils";

// Nonmodal by default: the page stays scrollable and clickable while open.
function DropdownMenu({ modal = false, ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root modal={modal} {...props} />;
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

type DropdownMenuContentProps = Omit<MenuPrimitive.Popup.Props, "className"> &
  Pick<
    MenuPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"
  > & {
    className?: string;
    portalProps?: MenuPrimitive.Portal.Props;
    positionerProps?: Omit<MenuPrimitive.Positioner.Props, "className"> & { className?: string };
  };

function DropdownMenuContent({
  className,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 8,
  portalProps,
  positionerProps,
  ...props
}: DropdownMenuContentProps) {
  const { className: positionerClassName, ...restPositionerProps } = positionerProps ?? {};
  return (
    <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...portalProps}>
      <MenuPrimitive.Positioner
        data-slot="dropdown-menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className={cn(popupLayer, positionerClassName)}
        {...restPositionerProps}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(popupSurface, "max-h-(--available-height) w-56 overflow-y-auto", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  variant,
  ...props
}: Omit<MenuPrimitive.Item.Props, "className"> &
  VariantProps<typeof menuItemVariants> & { className?: string }) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        menuItemVariants({ variant }),
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

// Must sit inside a DropdownMenuGroup, which it names.
function DropdownMenuLabel({
  className,
  ...props
}: Omit<MenuPrimitive.GroupLabel.Props, "className"> & { className?: string }) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn(menuLabel, className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: Omit<MenuPrimitive.Separator.Props, "className"> & { className?: string }) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  );
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: Omit<MenuPrimitive.SubmenuTrigger.Props, "className"> & { className?: string }) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        menuItemVariants(),
        "justify-between data-popup-open:bg-accent data-popup-open:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon
        data-slot="dropdown-menu-sub-trigger-icon"
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  side = "right",
  align = "start",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 8,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      className={cn("w-48", className)}
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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
