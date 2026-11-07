import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Kbd, KbdGroup } from "#components/kbd";

const meta = {
  title: "Primitives/Kbd",
  component: Kbd,
  args: { children: "Esc" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Keys: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Kbd>Z</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>⌘</Kbd>
      <Kbd>Shift</Kbd>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Z</Kbd>
    </KbdGroup>
  ),
};

export const InText: Story = {
  render: () => (
    <p className="w-60 text-sm text-muted-foreground">
      Press{" "}
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Z</Kbd>
      </KbdGroup>{" "}
      to undo the last change, or <Kbd>Esc</Kbd> to close the dialog without saving.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const key = within(canvasElement).getByText("Esc");
    await expect(key.tagName).toBe("KBD");
    await expect(key).toHaveAttribute("data-slot", "kbd");
  },
};
