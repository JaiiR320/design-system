import {
  CollapsiblePanel,
  Collapsible as CollapsiblePrimitive,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "@ui-sdk/react/collapsible";
import type * as React from "react";

// Behaviour only: no default styles or animations, callers own the layout.
// The panel exposes `--collapsible-panel-height` for a height transition.

function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive>) {
  return <CollapsiblePrimitive {...props} />;
}

function CollapsibleTrigger(props: React.ComponentProps<typeof CollapsibleTriggerPrimitive>) {
  return <CollapsibleTriggerPrimitive {...props} />;
}

function CollapsibleContent(props: React.ComponentProps<typeof CollapsiblePanel>) {
  return <CollapsiblePanel {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
