import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Button, type ButtonProps } from "#components/button";
import { Input, type InputProps } from "#components/input";
import { Textarea } from "#components/textarea";
import { cn } from "#lib/utils";

/**
 * One bordered shell around a borderless control and its addons. The shell shows the
 * control's focus border/ring, invalid border and disabled dimming.
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "relative flex w-full min-w-0 items-center rounded-xl border border-input bg-surface transition motion-reduce:transition-none",
        "has-[[data-slot=input-group-control]:focus]:border-ring",
        "has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-offset-2 has-[[data-slot=input-group-control]:focus-visible]:ring-offset-background",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive-text",
        "has-[[data-slot=input-group-control]:disabled]:opacity-50",
        // Block addons stack the group vertically.
        "has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:items-stretch has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:items-stretch",
        // The addon's padding is the gap on its side of the control.
        "has-[>[data-align=inline-start]]:*:data-[slot=input-group-control]:pl-0 has-[>[data-align=inline-end]]:*:data-[slot=input-group-control]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex cursor-text items-center gap-2 px-3 text-sm text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first",
        "inline-end": "order-last",
        "block-start": "order-first w-full justify-start px-4 pt-3",
        "block-end": "order-last w-full justify-start px-4 pb-3",
      },
    },
    defaultVariants: { align: "inline-start" },
  },
);

type InputGroupAddonProps = React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants>;

function InputGroupAddon({ className, align = "inline-start", ...props }: InputGroupAddonProps) {
  return (
    // Pointer convenience only: clicking the addon's text/icon focuses the control.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("button")) return;
        event.currentTarget.parentElement
          ?.querySelector<HTMLElement>("[data-slot=input-group-control]")
          ?.focus();
      }}
      {...props}
    />
  );
}

/** Button inside an addon: Button xs, ghost unless the caller picks a variant. */
function InputGroupButton({ variant = "ghost", size = "xs", ...props }: ButtonProps) {
  return <Button data-slot="input-group-button" variant={variant} size={size} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// The shell draws border, background, radius and ring; the control keeps padding and type.
// Disabled dimming also moves to the shell so it isn't applied twice.
const controlReset =
  "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 data-disabled:opacity-100";

function InputGroupInput({ className, ...props }: InputProps) {
  return (
    <Input data-slot="input-group-control" className={cn(controlReset, className)} {...props} />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(controlReset, "resize-none", className)}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
