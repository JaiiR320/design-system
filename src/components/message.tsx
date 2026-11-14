import type * as React from "react";

import { cn } from "#lib/utils";

type MessageProps = React.ComponentProps<"div"> & {
  /** `end` puts the message on the trailing side, usually for the user's own turns. */
  align?: "start" | "end";
};

/** One turn in a conversation: optional avatar, then content with header and footer. */
function Message({ className, align = "start", ...props }: MessageProps) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message flex w-full min-w-0 gap-3 data-[align=end]:flex-row-reverse",
        className,
      )}
      {...props}
    />
  );
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-subtle-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** Column of a turn's parts. In an `end` message, each part hugs the trailing edge. */
function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 wrap-break-word group-data-[align=end]/message:items-end",
        className,
      )}
      {...props}
    />
  );
}

/** Filled surface for a turn's text, typically the user's. Agent replies usually sit bare. */
function MessageBubble({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-bubble"
      className={cn(
        "w-fit max-w-[80%] min-w-0 rounded-xl bg-surface px-4 py-2 text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Name, model or timestamp above the turn. */
function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn("flex min-w-0 items-center gap-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Actions (copy, retry) or metadata below the turn. */
function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn("flex min-w-0 items-center gap-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Message, MessageAvatar, MessageContent, MessageBubble, MessageHeader, MessageFooter };
export type { MessageProps };
