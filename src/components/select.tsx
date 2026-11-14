import {
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectGroupLabel,
  SelectItemIndicator,
  SelectItem as SelectItemPrimitive,
  SelectItemText,
  Select as SelectPrimitive,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
} from "@ui-sdk/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import {
  disabledState,
  focusRing,
  menuItemVariants,
  menuLabel,
  menuSeparator,
  popupSurface,
} from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

// Direct alias keeps UI SDK's generic Select signature. It joins a Field and submits with `name`.
const Select = SelectPrimitive;

function SelectTrigger({
  className,
  children,
  ...props
}: WithClassName<Omit<React.ComponentProps<typeof SelectTriggerPrimitive>, "children">> & {
  children?: React.ReactNode;
}) {
  return (
    <SelectTriggerPrimitive
      className={cn(
        "relative flex w-full items-center rounded-xl border border-input bg-surface px-3 py-2.5 pr-10 text-left text-secondary-foreground transition select-none hover:border-border-strong focus:border-ring motion-reduce:transition-none data-placeholder:text-muted-foreground aria-invalid:border-destructive-text aria-invalid:ring-destructive-text/30",
        focusRing,
        disabledState,
        className,
      )}
      {...props}
    >
      {children}
      {/* right-[11px]: 12px from the outer edge once the 1px border is counted. */}
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[11px] size-4 -translate-y-1/2 text-subtle-foreground"
        strokeWidth={1.75}
      />
    </SelectTriggerPrimitive>
  );
}

function SelectValue({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SelectValuePrimitive>>) {
  return <SelectValuePrimitive className={cn("min-w-0 flex-1 truncate", className)} {...props} />;
}

type SelectContentProps = WithClassName<React.ComponentProps<typeof SelectContentPrimitive>>;

// Renders in the browser's top layer, at least as wide as the trigger; scrolls when taller
// than the room below it.
function SelectContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}: SelectContentProps) {
  return (
    <SelectContentPrimitive
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        popupSurface,
        "max-h-(--available-height) w-max max-w-(--available-width) min-w-(--anchor-width) scroll-py-2 overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: WithClassName<Omit<React.ComponentProps<typeof SelectItemPrimitive>, "children">> & {
  children?: React.ReactNode;
}) {
  return (
    <SelectItemPrimitive className={cn(menuItemVariants(), "relative pr-8", className)} {...props}>
      <SelectItemText className="min-w-0 flex-1 truncate">{children}</SelectItemText>
      <SelectItemIndicator className="pointer-events-none absolute right-3 flex items-center justify-center">
        <CheckIcon className="size-4" strokeWidth={1.75} />
      </SelectItemIndicator>
    </SelectItemPrimitive>
  );
}

function SelectGroup({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SelectGroupPrimitive>>) {
  return <SelectGroupPrimitive className={cn("scroll-my-2", className)} {...props} />;
}

/** Names a SelectGroup. (UI SDK's own SelectLabel names the whole select; use FieldLabel.) */
function SelectLabel({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SelectGroupLabel>>) {
  return <SelectGroupLabel className={cn(menuLabel, className)} {...props} />;
}

function SelectSeparator({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SelectSeparatorPrimitive>>) {
  return <SelectSeparatorPrimitive className={cn(menuSeparator, className)} {...props} />;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
export type { SelectContentProps };
