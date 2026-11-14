import { createParts } from "@ui-sdk/react/primitive";
import { Check, Copy } from "lucide-react";
import type * as React from "react";

import { buttonVariants, type ButtonVariantProps } from "#components/button";
import { copyButton } from "#lib/copy-button";
import type { WithClassName } from "#lib/utils";

const parts = createParts(copyButton, { root: "button" });

type CopyButtonProps = WithClassName<React.ComponentProps<typeof parts.Root>> & ButtonVariantProps;

/**
 * Copies `text` and announces "Copied" to screen readers. `data-copied` (or `data-failed`) stays
 * on for `resetAfter` ms. Without children it shows a copy icon that turns into a check; name it
 * with `aria-label`.
 */
function CopyButton({
  className,
  variant = "ghost",
  size = "icon-sm",
  children = ({ copied }) => (copied ? <Check /> : <Copy />),
  ...props
}: CopyButtonProps) {
  return (
    <parts.Root className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </parts.Root>
  );
}

export { CopyButton };
export type { CopyButtonProps };
