import {
  Toggle as TogglePrimitive,
  ToggleGroup as ToggleGroupPrimitive,
  type ToggleGroupOptions,
  type ToggleGroupState,
} from "@ui-sdk/react/toggle";
import type { PartProps } from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import type * as React from "react";

import { toggleVariants } from "#components/toggle";
import { cn, type WithClassName } from "#lib/utils";

type ToggleVariantProps = VariantProps<typeof toggleVariants>;

const toggleGroupVariants = cva("", {
  variants: {
    variant: {
      outline: "flex gap-2 data-[orientation=vertical]:flex-col",
      accent: "flex gap-2 data-[orientation=vertical]:flex-col",
      // Equal-width segments, however many options there are.
      segmented:
        "grid auto-cols-fr grid-flow-col gap-2 rounded-2xl border border-border bg-surface p-1 data-[orientation=vertical]:grid-flow-row",
    },
  },
  defaultVariants: { variant: "outline" },
});

// Size stays undefined unless the group sets it, so items keep Toggle's per-variant default.
const ToggleGroupContext = createContext<ToggleVariantProps>({});

type ToggleGroupProps<Value extends string = string> = ToggleGroupOptions<Value> &
  WithClassName<
    Omit<
      PartProps<"div", ToggleGroupState<Value>>,
      "defaultValue" | "onChange" | "onSelect" | "children"
    >
  > &
  ToggleVariantProps & { children?: React.ReactNode };

/** Array-valued selection for single and `multiple` groups. Give it an accessible name. */
function ToggleGroup<Value extends string = string>({
  className,
  variant,
  size,
  children,
  ...props
}: ToggleGroupProps<Value>) {
  return (
    <ToggleGroupPrimitive<Value>
      className={cn(toggleGroupVariants({ variant }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

type ToggleGroupItemProps = WithClassName<React.ComponentProps<typeof TogglePrimitive>>;

/** A Toggle inside the group; give it a `value`. */
function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  const { variant, size } = useContext(ToggleGroupContext);
  return <TogglePrimitive className={toggleVariants({ variant, size, className })} {...props} />;
}

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants };
export type { ToggleGroupProps, ToggleGroupItemProps };
