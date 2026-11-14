import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Message, MessageBubble, MessageContent } from "#components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "#components/message-scroller";

const meta = {
  title: "Primitives/MessageScroller",
  component: MessageScroller,
} satisfies Meta<typeof MessageScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

type Turn = { id: number; role: "user" | "agent"; text: string };

const seed: Turn[] = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  role: index % 2 === 0 ? "user" : "agent",
  text:
    index % 2 === 0
      ? `Question ${index / 2 + 1}: what changed in the parser?`
      : `Answer ${(index + 1) / 2}: the offset regex now accepts a colon, and invalid input throws a RangeError instead of returning null.`,
}));

function Turns({ turns }: { turns: Turn[] }) {
  return turns.map((turn) =>
    turn.role === "user" ? (
      <Message key={turn.id} align="end">
        <MessageContent>
          <MessageBubble>{turn.text}</MessageBubble>
        </MessageContent>
      </Message>
    ) : (
      <Message key={turn.id}>
        <MessageContent>
          <p className="leading-relaxed">{turn.text}</p>
        </MessageContent>
      </Message>
    ),
  );
}

// "Send" sits outside the scroller, so both share a provider; sending pins to the end.
function SendButton({ onSend }: { onSend: () => void }) {
  const { scrollToEnd } = useMessageScroller();
  return (
    <Button
      size="sm"
      onClick={() => {
        onSend();
        scrollToEnd({ behavior: "instant" });
      }}
    >
      Send
    </Button>
  );
}

function Conversation() {
  const [turns, setTurns] = useState(seed);
  const add = (role: Turn["role"]) =>
    setTurns((current) => [
      ...current,
      {
        id: current.length,
        role,
        text: `${role === "user" ? "Message" : "Reply"} ${current.length + 1}`,
      },
    ]);
  return (
    <MessageScrollerProvider>
      <div className="flex h-[420px] w-[560px] flex-col gap-3 text-sm">
        <MessageScroller className="flex-1 rounded-xl border border-border">
          <MessageScrollerViewport aria-label="Conversation">
            <MessageScrollerContent className="p-4">
              <Turns turns={turns} />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => add("agent")}>
            Agent replies
          </Button>
          <SendButton onSend={() => add("user")} />
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

function viewport(canvasElement: HTMLElement) {
  return within(canvasElement).getByRole("region", { name: "Conversation" }) as HTMLElement;
}

// The jump button stays mounted; UI SDK shows it with data-visible and makes it inert otherwise.
function jumpButton(canvasElement: HTMLElement) {
  return within(canvasElement).getByRole("button", { name: "Scroll to latest message" });
}

// A reader scrolling up: a wheel toward the start, then the scroll it causes.
function scrollToTop(element: HTMLElement) {
  element.dispatchEvent(new WheelEvent("wheel", { deltaY: -1000, bubbles: true }));
  element.scrollTop = 0;
  element.dispatchEvent(new Event("scroll"));
}

function distanceFromEnd(element: HTMLElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight;
}

// Opens at the newest message, and stays pinned once the web font has reflowed the messages.
export const Default: Story = {
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const element = viewport(canvasElement);
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 100));
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
    await expect(element.closest("[data-slot=scroll-area]")).toHaveAttribute("data-sticking");
    await waitFor(() => expect(jumpButton(canvasElement)).not.toHaveAttribute("data-visible"));
  },
};

// New content arrives while pinned: the conversation follows it.
export const FollowsNewMessages: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = viewport(canvasElement);
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
    await userEvent.click(canvas.getByRole("button", { name: "Agent replies" }));
    await userEvent.click(canvas.getByRole("button", { name: "Agent replies" }));
    await expect(canvas.getByText("Reply 12")).toBeVisible();
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
  },
};

// Scrolled up to read: new replies don't move the view, and the jump button appears.
export const KeepsPlaceWhenScrolledUp: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = viewport(canvasElement);
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
    scrollToTop(element);
    await userEvent.click(canvas.getByRole("button", { name: "Agent replies" }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect(element.scrollTop).toBe(0);
    await waitFor(() => expect(jumpButton(canvasElement)).toHaveAttribute("data-visible"));
  },
};

export const JumpToLatest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = viewport(canvasElement);
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
    scrollToTop(element);
    const button = jumpButton(canvasElement);
    await waitFor(() => expect(button).toHaveAttribute("data-visible"));
    await userEvent.click(button);
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
    await waitFor(() => expect(button).not.toHaveAttribute("data-visible"));
    // The button turns inert at the end; focus stays in the conversation, not on <body>.
    await expect(document.activeElement).not.toBe(document.body);
    // Pinned again: the next reply is followed.
    await userEvent.click(canvas.getByRole("button", { name: "Agent replies" }));
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
  },
};

// Sending from outside the scroller pins to the end even when scrolled up.
export const SendPinsToEnd: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = viewport(canvasElement);
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
    scrollToTop(element);
    // Send once the scroll-up has landed, as a reader would: the jump button shows by then.
    await waitFor(() => expect(jumpButton(canvasElement)).toHaveAttribute("data-visible"));
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(canvas.getByText("Message 11")).toBeVisible();
    await waitFor(() => expect(distanceFromEnd(element)).toBeLessThanOrEqual(2));
  },
};
