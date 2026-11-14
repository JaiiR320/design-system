import { Input as InputPrimitive } from "@ui-sdk/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { disabledState, focusRing } from "#lib/recipes";
import { cn, type WithClassName } from "#lib/utils";

// Shared by Textarea: bordered control chrome, mouse focus recolors the border,
// keyboard focus adds the ring.
const inputVariants = cva(
  `w-full min-w-0 rounded-xl border border-input bg-surface text-foreground transition placeholder:text-faint-foreground focus:border-ring motion-reduce:transition-none aria-invalid:border-destructive-text aria-invalid:ring-destructive-text/30 ${focusRing} ${disabledState}`,
  {
    variants: {
      // Named inputSize so native `size` stays the numeric HTML attribute.
      // Heights line up with Button: sm/md are as tall as Button sm/md, lg as Button lg.
      inputSize: {
        sm: "px-3 py-2",
        md: "px-4 py-2",
        lg: "px-4 py-3",
      },
    },
    defaultVariants: { inputSize: "md" },
  },
);

type InputProps = WithClassName<React.ComponentProps<typeof InputPrimitive>> &
  VariantProps<typeof inputVariants>;

function Input({ className, inputSize, ...props }: InputProps) {
  return <InputPrimitive className={cn(inputVariants({ inputSize }), className)} {...props} />;
}

export { Input, inputVariants };
export type { InputProps };
