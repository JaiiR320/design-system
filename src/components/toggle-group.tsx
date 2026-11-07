import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";

import { toggleVariants } from "#components/toggle";
import { cn } from "#lib/utils";

type ToggleVariantProps = VariantProps<typeof toggleVariants>;

const toggleGroupVariants = cva("", {
  variants: {
    variant: {
      outline: "flex gap-2",
      accent: "flex gap-2",
      segmented: "grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-1",
      round: "flex shrink-0 gap-2",
    },
  },
  defaultVariants: { variant: "outline" },
});

// Size stays undefined unless the group sets it, so items keep Toggle's per-variant default.
const ToggleGroupContext = createContext<ToggleVariantProps>({});

type ToggleGroupProps<Value extends string = string> = Omit<
  ToggleGroupPrimitive.Props<Value>,
  "className"
> &
  ToggleVariantProps & { className?: string };

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
      data-slot="toggle-group"
      className={cn(toggleGroupVariants({ variant }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

type ToggleGroupItemProps<Value extends string = string> = Omit<
  TogglePrimitive.Props<Value>,
  "className"
> & { className?: string };

function ToggleGroupItem<Value extends string = string>({
  className,
  ...props
}: ToggleGroupItemProps<Value>) {
  const { variant, size } = useContext(ToggleGroupContext);
  return (
    <TogglePrimitive<Value>
      data-slot="toggle-group-item"
      className={toggleVariants({ variant, size, className })}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants };
export type { ToggleGroupProps, ToggleGroupItemProps };
