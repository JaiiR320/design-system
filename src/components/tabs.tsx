import {
  TabsList as TabsListPrimitive,
  TabsPanel,
  Tabs as TabsPrimitive,
  TabsTab,
} from "@ui-sdk/react/tabs";
import type * as React from "react";

import { disabledState, focusRing } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

type TabsProps = WithClassName<React.ComponentProps<typeof TabsPrimitive>>;

// Arrows move focus only; Enter/Space activates, so focus never triggers app state changes.
function Tabs({ activation = "manual", ...props }: TabsProps) {
  return <TabsPrimitive activation={activation} {...props} />;
}

type TabsListProps = WithClassName<React.ComponentProps<typeof TabsListPrimitive>>;

function TabsList({ className, ...props }: TabsListProps) {
  return <TabsListPrimitive className={cn("flex", className)} {...props} />;
}

type TabsTriggerProps = WithClassName<React.ComponentProps<typeof TabsTab>>;

// Underline lives on the selected tab itself (2px border); no indicator element.
// Styled for horizontal tabs only: a vertical TabsList needs its own className.
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsTab
      className={cn(
        "px-5 py-3 text-muted-foreground transition not-data-selected:hover:text-secondary-foreground data-selected:border-b-2 data-selected:border-primary data-selected:text-primary motion-reduce:transition-none",
        focusRing,
        disabledState,
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = WithClassName<React.ComponentProps<typeof TabsPanel>>;

// The selected panel is a tab stop, so it needs the same visible ring.
function TabsContent({ className, ...props }: TabsContentProps) {
  return <TabsPanel className={cn(focusRing, className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
