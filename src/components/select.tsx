import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import {
  disabledState,
  focusRing,
  menuItemVariants,
  menuLabel,
  menuSeparator,
  popupLayer,
  popupSurface,
} from "#lib/recipes";
import { cn } from "#lib/utils";

// Direct alias keeps Base UI's generic `<Value, Multiple>` Root signature.
const Select = SelectPrimitive.Root;

type WithClassName<Props> = Omit<Props, "className"> & { className?: string };

function SelectTrigger({
  className,
  children,
  ...props
}: WithClassName<SelectPrimitive.Trigger.Props>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "relative flex w-full items-center rounded-xl border border-input bg-surface px-3 py-2.5 pr-10 text-left text-sm text-secondary-foreground transition select-none hover:border-border-strong focus:border-ring motion-reduce:transition-none data-placeholder:text-muted-foreground aria-invalid:border-destructive-text aria-invalid:ring-destructive-text/30",
        focusRing,
        disabledState,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 text-subtle-foreground"
      >
        <ChevronDownIcon className="size-4" strokeWidth={1.75} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({ className, ...props }: WithClassName<SelectPrimitive.Value.Props>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("min-w-0 flex-1 truncate", className)}
      {...props}
    />
  );
}

type SelectContentProps = WithClassName<SelectPrimitive.Popup.Props> &
  Pick<
    SelectPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "alignItemWithTrigger"
  > & {
    portalProps?: SelectPrimitive.Portal.Props;
    positionerProps?: WithClassName<SelectPrimitive.Positioner.Props>;
  };

function SelectContent({
  className,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 8,
  alignItemWithTrigger = false,
  portalProps,
  positionerProps,
  ...props
}: SelectContentProps) {
  const { className: positionerClassName, ...restPositionerProps } = positionerProps ?? {};
  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        alignItemWithTrigger={alignItemWithTrigger}
        className={cn(popupLayer, positionerClassName)}
        {...restPositionerProps}
      >
        {/* The List scrolls (Base UI tracks it for scroll arrows); the Popup only clips. */}
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            popupSurface,
            "relative flex max-h-(--available-height) w-(--anchor-width) flex-col overflow-hidden p-0",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            data-slot="select-scroll-up-arrow"
            className="absolute inset-x-0 top-0 z-10 flex h-6 cursor-default items-center justify-center bg-popover text-muted-foreground"
          >
            <ChevronUpIcon className="size-4" strokeWidth={1.75} />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List
            data-slot="select-list"
            className="min-h-0 flex-1 scroll-py-2 overflow-y-auto p-2 outline-none"
          >
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow
            data-slot="select-scroll-down-arrow"
            className="absolute inset-x-0 bottom-0 z-10 flex h-6 cursor-default items-center justify-center bg-popover text-muted-foreground"
          >
            <ChevronDownIcon className="size-4" strokeWidth={1.75} />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: WithClassName<SelectPrimitive.Item.Props>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(menuItemVariants(), "relative pr-8", className)}
      {...props}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text" className="min-w-0 flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="pointer-events-none absolute right-3 flex items-center justify-center"
      >
        <CheckIcon className="size-4" strokeWidth={1.75} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectGroup({ className, ...props }: WithClassName<SelectPrimitive.Group.Props>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-2", className)}
      {...props}
    />
  );
}

function SelectLabel({ className, ...props }: WithClassName<SelectPrimitive.GroupLabel.Props>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(menuLabel, className)}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: WithClassName<SelectPrimitive.Separator.Props>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(menuSeparator, className)}
      {...props}
    />
  );
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
