import { Switch as SwitchPrimitive, SwitchThumb } from "@ui-sdk/react/switch";
import type * as React from "react";

import { disabledState, focusRing } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

// 44x24 track; the thumb sits 4px in when off and slides to 20px when on.
const thumbClassName =
  "pointer-events-none block h-5 w-5 rounded-full bg-white transition-transform motion-reduce:transition-none data-unchecked:translate-x-1 data-checked:translate-x-5";

// UI SDK renders a native button (role="switch") and a hidden checkbox that submits with the form.
type SwitchProps = WithClassName<React.ComponentProps<typeof SwitchPrimitive>>;

function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-secondary transition data-checked:bg-ring/80 motion-reduce:transition-none",
        focusRing,
        disabledState,
        className,
      )}
      {...props}
    >
      <SwitchThumb className={thumbClassName} />
    </SwitchPrimitive>
  );
}

type SwitchChipProps = Omit<SwitchProps, "children"> & { children?: React.ReactNode };

/** A whole clickable pill: one switch root wrapping the track and its visible label. */
function SwitchChip({ className, children, ...props }: SwitchChipProps) {
  return (
    <SwitchPrimitive
      data-chip=""
      className={cn(
        "group/switch inline-flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2 text-secondary-foreground transition not-data-checked:hover:border-border-strong not-data-checked:hover:bg-secondary data-checked:border-selected-border data-checked:bg-selected data-checked:text-selected-foreground motion-reduce:transition-none",
        focusRing,
        disabledState,
        className,
      )}
      {...props}
    >
      <span
        data-switch-track=""
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-secondary transition group-data-checked/switch:bg-ring/80 motion-reduce:transition-none"
      >
        <SwitchThumb className={thumbClassName} />
      </span>
      <span data-switch-label="">{children}</span>
    </SwitchPrimitive>
  );
}

export { Switch, SwitchChip };
export type { SwitchProps, SwitchChipProps };
