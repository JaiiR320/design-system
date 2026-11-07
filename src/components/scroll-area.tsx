import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cva } from "class-variance-authority";

import { focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// Compound parts: compose Root > Viewport + ScrollBar(s) + Corner explicitly.

type WithStringClassName<Props> = Omit<Props, "className"> & { className?: string };

function ScrollArea({ className, ...props }: WithStringClassName<ScrollAreaPrimitive.Root.Props>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative min-h-0 min-w-0", className)}
      {...props}
    />
  );
}

/** The scrolling element. Give it `tabIndex={0}` and a label when it holds no focusable content. */
function ScrollAreaViewport({
  className,
  ...props
}: WithStringClassName<ScrollAreaPrimitive.Viewport.Props>) {
  return (
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className={cn("size-full rounded-[inherit]", focusRing, className)}
      {...props}
    />
  );
}

const scrollBarVariants = cva("flex touch-none p-px select-none", {
  variants: {
    orientation: {
      vertical: "w-2.5",
      horizontal: "h-2.5 flex-col",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: WithStringClassName<ScrollAreaPrimitive.Scrollbar.Props>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(scrollBarVariants({ orientation }), className)}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="flex-1 rounded-full bg-border-strong"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

function ScrollAreaCorner(props: ScrollAreaPrimitive.Corner.Props) {
  return <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" {...props} />;
}

export { ScrollArea, ScrollAreaViewport, ScrollBar, ScrollAreaCorner };
