import { MenuContent, MenuContextTrigger, Menu as MenuPrimitive } from "@ui-sdk/react/menu";
import type * as React from "react";

import {
  DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubContent as ContextMenuSubContent,
  DropdownMenuSubTrigger as ContextMenuSubTrigger,
} from "#components/dropdown-menu";
import { popupSurface } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

// The same Menu as DropdownMenu, opened from an area instead of a button. Its items are
// DropdownMenu's, re-exported under ContextMenu names.
function ContextMenu(props: React.ComponentProps<typeof MenuPrimitive>) {
  return <MenuPrimitive {...props} />;
}

// Opens on right click, long press or Shift+F10 at the pointer; render it onto an existing element.
function ContextMenuTrigger(props: React.ComponentProps<typeof MenuContextTrigger>) {
  return <MenuContextTrigger {...props} />;
}

function ContextMenuContent({
  className,
  collisionPadding = 8,
  ...props
}: WithClassName<React.ComponentProps<typeof MenuContent>>) {
  return (
    <MenuContent
      collisionPadding={collisionPadding}
      className={cn(popupSurface, "max-h-(--available-height) w-56 overflow-y-auto", className)}
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
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
