import { ChevronRight } from "lucide-react";
import type * as React from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#components/collapsible";
import { cn } from "#lib/utils";

/**
 * One shape for every agent step: reasoning, tool calls, plan items, searches. A `TraceLine`
 * is plain text; wrap it in a trigger (`TraceCollapsibleTrigger`, a dialog or popover trigger)
 * or a link to make it interactive. Lines inherit font size; set `text-*` on `Trace`.
 */
function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        // A link or overlay trigger wrapping a line gets the line's shape and the focus ring.
        "*:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-md *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none",
        "*:has-[>[data-slot=trace-line]]:focus-visible:ring-2 *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50 *:has-[>[data-slot=trace-line]]:focus-visible:ring-offset-2 *:has-[>[data-slot=trace-line]]:focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
}

type TraceStatus = "running" | "error" | "pending";

type TraceLineProps = React.ComponentProps<"span"> & {
  /**
   * Omit when the step is done. Status shows through color and motion only, so also say it
   * in the title: "Running tests", "Failed to run lint", "Run the build".
   */
  status?: TraceStatus;
};

function TraceLine({ className, status, ...props }: TraceLineProps) {
  return (
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-muted-foreground transition-colors motion-reduce:transition-none",
        "in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground",
        "data-[status=error]:text-destructive-text data-[status=error]:in-[a:hover,button:hover]:text-destructive-muted-foreground",
        "data-[status=pending]:text-faint-foreground",
        "data-[status=running]:text-subtle-foreground data-[status=running]:*:data-[slot=trace-title]:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

/** Decorative. Before the title it names the action; after the title it is an indicator. */
function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** One line that truncates; pulses while its line is running. */
function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-title"
      className={cn("min-w-0 truncate motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

/** Secondary text after the title: counts, durations. Doesn't truncate. */
function TraceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-description"
      className={cn("shrink-0 text-faint-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/**
 * A step that opens to show its detail. To open while streaming and still let the user
 * close it: `const [open, setOpen] = useState<boolean>()`, then
 * `open={open ?? running} onOpenChange={setOpen}`.
 */
function TraceCollapsible({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, "className"> & { className?: string }) {
  return <Collapsible className={cn("flex w-full min-w-0 flex-col", className)} {...props} />;
}

/** Wraps a `TraceLine` and appends a chevron that turns when open. */
function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleTrigger>, "children" | "className"> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group/trace-trigger flex w-fit max-w-full min-w-0 items-center gap-1 rounded-md text-left text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none has-data-[status=error]:text-destructive-text",
        className,
      )}
      {...props}
    >
      {children}
      <TraceIcon className="transition-transform group-data-open/trace-trigger:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none">
        <ChevronRight />
      </TraceIcon>
    </CollapsibleTrigger>
  );
}

/**
 * Detail under a step, set off by a rule that lines up with the step's icon. Nest a `Trace`
 * for sub-steps, or a `CodeBlock` for output. `keepMounted` keeps nested open state.
 */
function TraceCollapsibleContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleContent>, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <CollapsibleContent
      className="h-(--collapsible-panel-height) min-w-0 overflow-hidden transition-[height] motion-reduce:transition-none data-ending-style:h-0 data-starting-style:h-0"
      {...props}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        className={cn(
          "mt-2 mb-1 ml-[calc(--spacing(2)-0.5px)] min-w-0 border-l border-border pr-1 pl-4 leading-relaxed wrap-break-word text-muted-foreground",
          className,
        )}
      >
        {children}
      </div>
    </CollapsibleContent>
  );
}

export {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
};
export type { TraceLineProps, TraceStatus };
