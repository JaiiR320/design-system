import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#lib/utils";

const fieldVariants = cva("", {
  variants: {
    orientation: {
      vertical: "flex flex-col gap-2",
      horizontal: "flex items-center justify-between gap-3",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

type FieldProps = Omit<FieldPrimitive.Root.Props, "className"> &
  VariantProps<typeof fieldVariants> & { className?: string };

/** One label + one control. Base UI connects label, description and error to the control. */
function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
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

type FieldLabelProps = Omit<FieldPrimitive.Label.Props, "className"> &
  VariantProps<typeof fieldLabelVariants> & { className?: string };

function FieldLabel({ className, size, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(fieldLabelVariants({ size }), className)}
      {...props}
    />
  );
}

type FieldDescriptionProps = Omit<FieldPrimitive.Description.Props, "className"> & {
  className?: string;
};

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

type FieldErrorProps = Omit<FieldPrimitive.Error.Props, "className"> & { className?: string };

/**
 * Shown when native/`validate` validation fails. Base UI ignores Field's `invalid` prop here,
 * so render app-controlled errors conditionally with `match`: `{error && <FieldError match>…}`.
 */
function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("text-xs text-destructive-text", className)}
      {...props}
    />
  );
}

type FieldControlProps = FieldPrimitive.Control.Props;

/**
 * Unstyled: connects a non-Base-UI control to the Field, e.g.
 * `<FieldControl render={<Textarea />} />`. Input already integrates; don't wrap it.
 */
function FieldControl(props: FieldControlProps) {
  return <FieldPrimitive.Control data-slot="field-control" {...props} />;
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field-group" className={cn("flex flex-col gap-4", className)} {...props} />
  );
}

/** Native fieldset for grouped controls (e.g. a ToggleGroup named by FieldLegend). */
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("min-w-0 space-y-2 border-0 p-0", className)}
      {...props}
    />
  );
}

type FieldLegendProps = React.ComponentProps<"legend"> & VariantProps<typeof fieldLabelVariants>;

function FieldLegend({ className, size, ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(fieldLabelVariants({ size }), className)}
      {...props}
    />
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
