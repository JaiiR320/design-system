import {
  Slider as SliderPrimitive,
  SliderControl as SliderControlPrimitive,
  SliderIndicator as SliderIndicatorPrimitive,
  SliderThumb as SliderThumbPrimitive,
  SliderTrack as SliderTrackPrimitive,
  SliderValue as SliderValuePrimitive,
} from "@ui-sdk/react/slider";
import type * as React from "react";

import { disabledState } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

/**
 * UI SDK's Slider: one thumb for a number, or one `SliderThumb` per value (with `index`) for a
 * range. Name a single thumb with a `FieldLabel` in a `Field` or `aria-label` on the thumb.
 */
function Slider({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SliderPrimitive>>) {
  return (
    <SliderPrimitive
      className={cn(
        "flex w-full flex-col gap-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:items-center",
        disabledState,
        className,
      )}
      {...props}
    />
  );
}

/** The formatted value (a range joined with an en dash), for beside the label. */
function SliderValue({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SliderValuePrimitive>>) {
  return (
    <SliderValuePrimitive
      className={cn("text-xs text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** Where presses land: the nearest thumb jumps there and starts a drag. */
function SliderControl({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SliderControlPrimitive>>) {
  return (
    <SliderControlPrimitive
      className={cn(
        "relative flex w-full touch-none items-center py-2 select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-32 data-[orientation=vertical]:w-auto data-[orientation=vertical]:justify-center data-[orientation=vertical]:px-2 data-[orientation=vertical]:py-0",
        className,
      )}
      {...props}
    />
  );
}

function SliderTrack({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SliderTrackPrimitive>>) {
  return (
    <SliderTrackPrimitive
      className={cn(
        "relative h-1.5 w-full rounded-full bg-secondary data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        className,
      )}
      {...props}
    />
  );
}

/** Fills the track up to the thumb, or between the first and last thumb of a range. */
function SliderIndicator({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SliderIndicatorPrimitive>>) {
  return (
    <SliderIndicatorPrimitive
      className={cn(
        "rounded-full bg-ring/80 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
        className,
      )}
      {...props}
    />
  );
}

/** What gets dragged. Its hidden range input takes focus, so the ring follows `:focus-visible`. */
function SliderThumb({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof SliderThumbPrimitive>>) {
  return (
    <SliderThumbPrimitive
      className={cn(
        "block size-4 rounded-full border border-border-strong bg-white shadow-md shadow-black/40 transition-shadow outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue };
