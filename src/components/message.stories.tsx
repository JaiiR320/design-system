import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bot, Copy, RotateCcw } from "lucide-react";
import { expect, within } from "storybook/test";

import { Button } from "#components/button";
import {
  Message,
  MessageAvatar,
  MessageBubble,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "#components/message";

const meta = {
  title: "Primitives/Message",
  component: Message,
  decorators: [
    (Story) => (
      <div className="flex w-[640px] flex-col gap-6 text-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

// The user's turn in a bubble on the trailing side; the agent's reply bare, with actions.
export const Default: Story = {
  render: () => (
    <>
      <Message align="end">
        <MessageContent>
          <MessageBubble>Why does parseDate return null for 2026-11-10T09:00+05:30?</MessageBubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <p className="leading-relaxed">
            The regex only accepts offsets written as <code>+0530</code>, without a colon. I changed
            it to accept both forms and added a test.
          </p>
          <MessageFooter>
            <Button variant="ghost" size="icon-sm" aria-label="Copy">
              <Copy />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Retry">
              <RotateCcw />
            </Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Copy" })).toBeVisible();
  },
};

// Avatar and header for multi-agent or named threads.
export const WithAvatarAndHeader: Story = {
  render: () => (
    <Message>
      <MessageAvatar>
        <Bot />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span className="text-strong-foreground">Reviewer</span>
          <span>09:41</span>
        </MessageHeader>
        <p className="leading-relaxed">Looks good. One nit: name the regex.</p>
      </MessageContent>
    </Message>
  ),
};

// Long user text wraps inside the bubble at 80% of the row.
export const LongBubble: Story = {
  render: () => (
    <Message align="end">
      <MessageContent>
        <MessageBubble>
          Refactor the date helpers so every parser returns a Result instead of throwing, keep the
          public names, and update the call sites in the importer and the scheduler.
        </MessageBubble>
        <MessageFooter>Edited</MessageFooter>
      </MessageContent>
    </Message>
  ),
};
