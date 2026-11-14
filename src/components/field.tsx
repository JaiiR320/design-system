import {
  FieldControl as FieldControlPrimitive,
  FieldDescription as FieldDescriptionPrimitive,
  FieldError as FieldErrorPrimitive,
  FieldGroup as FieldGroupPrimitive,
  FieldLabel as FieldLabelPrimitive,
  FieldLegend as FieldLegendPrimitive,
  Field as FieldPrimitive,
  FieldSet as FieldSetPrimitive,
} from "@ui-sdk/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn, type WithClassName } from "#lib/utils";

const fieldVariants = cva("", {
  variants: {
    orientation: {
      vertical: "flex flex-col gap-2",
      horizontal: "flex items-center justify-between gap-3",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

type FieldProps = WithClassName<React.ComponentProps<typeof FieldPrimitive>> &
  VariantProps<typeof fieldVariants>;

/**
 * One label + one control. UI SDK connects label, description and error to the control.
 * `invalid` shows the field as invalid now (a server or form-library error); leave it out to
 * show the browser's validation once a submit finds the control invalid.
 */
function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <FieldPrimitive
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

// Same type as Label (md); sm is the compact muted label.
const fieldLabelVariants = cva("block font-medium data-disabled:opacity-50", {
  variants: {
    size: {
      md: "text-sm text-subtle-foreground",
      sm: "text-xs text-muted-foreground",
    },
  },
  defaultVariants: { size: "md" },
});

type FieldLabelProps = WithClassName<React.ComponentProps<typeof FieldLabelPrimitive>> &
  VariantProps<typeof fieldLabelVariants>;

function FieldLabel({ className, size, ...props }: FieldLabelProps) {
  return <FieldLabelPrimitive className={cn(fieldLabelVariants({ size }), className)} {...props} />;
}

type FieldDescriptionProps = WithClassName<React.ComponentProps<typeof FieldDescriptionPrimitive>>;

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldDescriptionPrimitive
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

type FieldErrorProps = WithClassName<React.ComponentProps<typeof FieldErrorPrimitive>>;

/**
 * Shows while the field is invalid: by its `invalid` prop, or once a submit finds the control
 * invalid. Without children it shows the browser's message; `match` limits it to one problem.
 */
function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <FieldErrorPrimitive className={cn("text-xs text-destructive-text", className)} {...props} />
  );
}

type FieldControlProps = React.ComponentProps<typeof FieldControlPrimitive>;

/**
 * Unstyled: connects a control this system doesn't ship to the Field, e.g.
 * `<FieldControl render={<select />} />`. Input, Textarea, Select and Switch join a Field on their own.
 */
function FieldControl(props: FieldControlProps) {
  return <FieldControlPrimitive {...props} />;
}

function FieldGroup({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof FieldGroupPrimitive>>) {
  return <FieldGroupPrimitive className={cn("flex flex-col gap-4", className)} {...props} />;
}

/** A fieldset for grouped controls (e.g. a ToggleGroup named by FieldLegend). */
function FieldSet({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof FieldSetPrimitive>>) {
  return (
    <FieldSetPrimitive className={cn("min-w-0 space-y-2 border-0 p-0", className)} {...props} />
  );
}

type FieldLegendProps = WithClassName<React.ComponentProps<typeof FieldLegendPrimitive>> &
  VariantProps<typeof fieldLabelVariants>;

function FieldLegend({ className, size, ...props }: FieldLegendProps) {
  return (
    <FieldLegendPrimitive className={cn(fieldLabelVariants({ size }), className)} {...props} />
  );
}

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  fieldLabelVariants,
};
export type { FieldLabelProps, FieldProps };
