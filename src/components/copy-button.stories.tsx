import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { CopyButton } from "#components/copy-button";

const meta = {
  title: "Primitives/CopyButton",
  component: CopyButton,
  args: { text: "pnpm add date-fns", "aria-label": "Copy command", onCopy: fn() },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

export const Default: Story = {};

// Children read the state: a text button that says what happened.
export const WithText: Story = {
  args: {
    "aria-label": undefined,
    variant: "outline",
    size: "sm",
    children: ({ copied, failed }) => (copied ? "Copied" : failed ? "Couldn't copy" : "Copy link"),
  },
};

/** Copying turns the icon into a check, announces "Copied", then resets after `resetAfter`. */
export const CopiesTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { resetAfter: 300 },
  play: async ({ args, canvasElement }) => {
    const writeText = fn(async (_text: string) => {});
    mockClipboard(writeText);
    const button = within(canvasElement).getByRole("button", { name: "Copy command" });
    await userEvent.click(button);
    await expect(writeText).toHaveBeenCalledWith("pnpm add date-fns");
    await waitFor(() => expect(button).toHaveAttribute("data-copied"));
    await expect(args.onCopy).toHaveBeenCalledWith("pnpm add date-fns");
    // The accessible name stays put; the announcement says what happened.
    await expect(button).toHaveAccessibleName("Copy command");
    await waitFor(() => expect(within(document.body).getByText("Copied")).toBeInTheDocument());
    await waitFor(() => expect(button).not.toHaveAttribute("data-copied"));
  },
};

/** Keyboard users copy with Enter or Space, like any button. */
export const KeyboardTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const writeText = fn(async (_text: string) => {});
    mockClipboard(writeText);
    const button = within(canvasElement).getByRole("button", { name: "Copy command" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    await userEvent.keyboard(" ");
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
  },
};

/** A blocked clipboard sets `data-failed` and announces it, instead of failing silently. */
export const FailsTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    variant: "outline",
    size: "sm",
    children: ({ failed }) => (failed ? "Couldn't copy" : "Copy"),
    "aria-label": undefined,
  },
  play: async ({ args, canvasElement }) => {
    mockClipboard(async () => {
      throw new DOMException("Blocked", "NotAllowedError");
    });
    const button = within(canvasElement).getByRole("button", { name: "Copy" });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-failed"));
    await expect(button).toHaveTextContent("Couldn't copy");
    await expect(button).not.toHaveAttribute("data-copied");
    await expect(args.onCopy).not.toHaveBeenCalled();
  },
};
