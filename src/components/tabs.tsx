import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { disabledState, focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

type TabsProps = Omit<TabsPrimitive.Root.Props, "className"> & { className?: string };

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />;
}

type TabsListProps = Omit<TabsPrimitive.List.Props, "className"> & { className?: string };

// Arrows move focus only; Enter/Space activates, so focus never triggers app state changes.
function TabsList({ className, activateOnFocus = false, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      activateOnFocus={activateOnFocus}
      className={cn("flex", className)}
      {...props}
    />
  );
}

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, "className"> & { className?: string };

// Underline lives on the active tab itself (2px border); no indicator element.
// Styled for horizontal tabs only: a vertical TabsList needs its own className.
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "px-5 py-3 text-muted-foreground transition not-data-active:hover:text-secondary-foreground data-active:border-b-2 data-active:border-primary data-active:text-primary motion-reduce:transition-none",
        focusRing,
        disabledState,
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, "className"> & { className?: string };

// Base UI makes the active panel a tab stop (tabindex=0), so it needs the same visible ring.
function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel data-slot="tabs-content" className={cn(focusRing, className)} {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
