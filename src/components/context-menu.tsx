import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type { VariantProps } from "class-variance-authority";
import { ChevronRightIcon } from "lucide-react";

import { menuItemVariants, menuLabel, menuSeparator, popupLayer, popupSurface } from "#lib/recipes";
import { cn } from "#lib/utils";

// Base UI 1.9.0's ContextMenu.Root has no `modal` prop: it is always modal while open.
function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root {...props} />;
}

// Opens on right click or long press at the pointer; render it onto an existing element.
function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

function ContextMenuPortal(props: ContextMenuPrimitive.Portal.Props) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

type ContextMenuContentProps = Omit<ContextMenuPrimitive.Popup.Props, "className"> &
  Pick<
    ContextMenuPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"
  > & {
    className?: string;
    portalProps?: ContextMenuPrimitive.Portal.Props;
    positionerProps?: ContextMenuPrimitive.Positioner.Props;
  };

function ContextMenuContent({
  className,
  side = "right",
  align = "start",
  sideOffset = 0,
  alignOffset = 0,
  collisionPadding = 8,
  portalProps,
  positionerProps,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...portalProps}>
      <ContextMenuPrimitive.Positioner
        data-slot="context-menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className={popupLayer}
        {...positionerProps}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(popupSurface, "max-h-(--available-height) w-56 overflow-y-auto", className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  variant,
  ...props
}: Omit<ContextMenuPrimitive.Item.Props, "className"> &
  VariantProps<typeof menuItemVariants> & { className?: string }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      className={cn(
        menuItemVariants({ variant }),
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

// Must sit inside a ContextMenuGroup, which it names.
function ContextMenuLabel({
  className,
  ...props
}: Omit<ContextMenuPrimitive.GroupLabel.Props, "className"> & { className?: string }) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      className={cn(menuLabel, className)}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: Omit<ContextMenuPrimitive.Separator.Props, "className"> & { className?: string }) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  );
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot {...props} />;
}

function ContextMenuSubTrigger({
  className,
  children,
  ...props
}: Omit<ContextMenuPrimitive.SubmenuTrigger.Props, "className"> & { className?: string }) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      className={cn(
        menuItemVariants(),
        "justify-between data-popup-open:bg-accent data-popup-open:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon
        data-slot="context-menu-sub-trigger-icon"
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({
  className,
  side = "right",
  align = "start",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 8,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
