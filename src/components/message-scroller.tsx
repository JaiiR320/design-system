import {
  createScrollAreaController,
  ScrollAreaContent,
  ScrollAreaScrollToEnd,
} from "@ui-sdk/react/scroll-area";
import { ArrowDown } from "lucide-react";
import { createContext, use, useEffect, useMemo, useRef, useState } from "react";
import type * as React from "react";

import { Button, type ButtonProps } from "#components/button";
import { ScrollArea, ScrollAreaViewport, ScrollBar } from "#components/scroll-area";
import { cn, type WithClassName } from "#lib/utils";

/*
 * A conversation that stays pinned to its newest message while replies stream in: UI SDK's
 * ScrollArea with `stickToEnd`. Scrolling up unpins it, so the reader keeps their place;
 * scrolling back to the end, the button or `scrollToEnd()` pins it again. Compose:
 *
 *   <MessageScroller className="flex-1">
 *     <MessageScrollerViewport aria-label="Conversation">
 *       <MessageScrollerContent>{messages}</MessageScrollerContent>
 *     </MessageScrollerViewport>
 *     <MessageScrollerButton />
 *   </MessageScroller>
 *
 * Code outside the scroller (a prompt input that pins on send) reaches the same scroller when
 * both sit inside a `MessageScrollerProvider`. Style from the root's `data-at-end` and `data-sticking`.
 */

type ScrollAreaController = ReturnType<typeof createScrollAreaController>;

type MessageScrollerState = {
  /** Scroll to the newest content and pin there. Smooth unless the user prefers reduced motion. */
  scrollToEnd: (options?: { behavior?: "instant" | "smooth" }) => void;
  /** Whether the newest content is in view now. Call it from handlers, not during render. */
  isAtEnd: () => boolean;
};

const MessageScrollerContext = createContext<ScrollAreaController | null>(null);

function MessageScrollerProvider({ children }: { children: React.ReactNode }) {
  const [controller] = useState(createScrollAreaController);
  return <MessageScrollerContext value={controller}>{children}</MessageScrollerContext>;
}

/** `scrollToEnd` and `isAtEnd` for the nearest scroller or provider. */
function useMessageScroller(): MessageScrollerState {
  const controller = use(MessageScrollerContext);
  if (!controller) throw new Error("useMessageScroller must be inside MessageScroller");
  return useMemo(
    () => ({
      scrollToEnd: (options) => controller.scrollToEnd({ behavior: "smooth", ...options }),
      isAtEnd: () => controller.isAtEnd(),
    }),
    [controller],
  );
}

type MessageScrollerProps = Omit<React.ComponentProps<typeof ScrollArea>, "children"> & {
  children?: React.ReactNode;
};

function MessageScrollerRoot({ className, children, ...props }: MessageScrollerProps) {
  const controller = use(MessageScrollerContext) ?? undefined;
  const root = useRef<HTMLDivElement>(null);
  // UI SDK can let go of the end with no reader input: its first pin can land a pixel short of a
  // sub-pixel content height, and a late web font that shrinks the messages clamps the scroll.
  // Until the reader first scrolls or presses in the conversation, pin again when that happens.
  const touched = useRef(false);
  const touch = () => {
    touched.current = true;
  };
  useEffect(() => {
    const element = root.current;
    if (!element || !controller) return;
    const observer = new MutationObserver(() => {
      if (touched.current || element.hasAttribute("data-sticking")) return;
      controller.scrollToEnd({ behavior: "instant" });
    });
    observer.observe(element, { attributes: true, attributeFilter: ["data-sticking"] });
    return () => observer.disconnect();
  }, [controller]);
  return (
    <ScrollArea
      ref={root}
      stickToEnd
      controller={controller}
      className={cn("relative flex min-h-0 flex-col", className)}
      onWheelCapture={touch}
      onTouchStartCapture={touch}
      onPointerDownCapture={touch}
      onKeyDownCapture={touch}
      {...props}
    >
      {children}
      <ScrollBar />
    </ScrollArea>
  );
}

/** Root. Give it a height (`h-full`, `flex-1`); it adds the vertical scrollbar itself. */
function MessageScroller(props: MessageScrollerProps) {
  const context = use(MessageScrollerContext);
  return context ? (
    <MessageScrollerRoot {...props} />
  ) : (
    <MessageScrollerProvider>
      <MessageScrollerRoot {...props} />
    </MessageScrollerProvider>
  );
}

/**
 * The scrolling element: a focusable region, so the conversation scrolls by keyboard.
 * Give it an `aria-label`.
 */
function MessageScrollerViewport({
  tabIndex = 0,
  role = "region",
  ...props
}: React.ComponentProps<typeof ScrollAreaViewport>) {
  return <ScrollAreaViewport tabIndex={tabIndex} role={role} {...props} />;
}

/** Column of messages. Its growth is what keeps the scroller pinned. */
function MessageScrollerContent({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof ScrollAreaContent>>) {
  return (
    <ScrollAreaContent className={cn("flex min-h-full flex-col gap-6", className)} {...props} />
  );
}

/** Jumps to the newest message. Shows (`data-visible`) only while the end is out of view. */
function MessageScrollerButton({
  className,
  children,
  variant = "outline",
  size = "icon-sm",
  ...props
}: Omit<ButtonProps, "children"> & { children?: React.ReactNode }) {
  return (
    <ScrollAreaScrollToEnd
      render={<Button variant={variant} size={size} {...props} />}
      aria-label="Scroll to latest message"
      className={cn(
        "absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background shadow-raised transition-opacity not-data-visible:pointer-events-none not-data-visible:opacity-0 motion-reduce:transition-none",
        className,
      )}
    >
      {children ?? <ArrowDown />}
    </ScrollAreaScrollToEnd>
  );
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerButton,
  useMessageScroller,
};
export type { MessageScrollerState };
