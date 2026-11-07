import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { disabledState, focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// DeckDiff's 44x24 track; the thumb sits 4px in when off and slides to 20px when on.
const thumbClassName =
  "pointer-events-none block h-5 w-5 rounded-full bg-white transition-transform motion-reduce:transition-none data-unchecked:translate-x-1 data-checked:translate-x-5";

// A native <button> root (not Base UI's default span) so a disabled <fieldset> disables it.
type SwitchProps = Omit<SwitchPrimitive.Root.Props, "className"> & { className?: string };

function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-secondary transition data-checked:bg-ring/80 motion-reduce:transition-none",
        focusRing,
        disabledState,
        className,
      )}
      nativeButton
      render={<button type="button" />}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={thumbClassName} />
    </SwitchPrimitive.Root>
  );
}

type SwitchChipProps = SwitchProps;

/** A whole clickable pill: one switch root wrapping the track and its visible label. */
function SwitchChip({ className, children, ...props }: SwitchChipProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch-chip"
      className={cn(
        "group/switch inline-flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2 text-secondary-foreground transition not-data-checked:hover:border-border-strong not-data-checked:hover:bg-secondary data-checked:border-selected-border data-checked:bg-selected data-checked:text-selected-foreground motion-reduce:transition-none",
        focusRing,
        disabledState,
        className,
      )}
      nativeButton
      render={<button type="button" />}
      {...props}
    >
      <span
        data-slot="switch-track"
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-secondary transition group-data-checked/switch:bg-ring/80 motion-reduce:transition-none"
      >
        <SwitchPrimitive.Thumb data-slot="switch-thumb" className={thumbClassName} />
      </span>
      <span data-slot="switch-label">{children}</span>
    </SwitchPrimitive.Root>
  );
}

export { Switch, SwitchChip };
export type { SwitchProps, SwitchChipProps };
