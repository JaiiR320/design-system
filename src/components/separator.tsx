import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "#lib/utils";

type SeparatorProps = Omit<SeparatorPrimitive.Props, "className"> & { className?: string };

// No margins: dividers set their own spacing (e.g. `mx-1 h-10`) or flex-1 in a caption row.
function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        orientation === "vertical" ? "h-full w-px shrink-0 bg-border" : "h-px w-full bg-border",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
