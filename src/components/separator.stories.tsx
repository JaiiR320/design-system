import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Separator } from "#components/separator";

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator");
    await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
  },
};

// Toolbar dividers: margins and height come from the call site.
export const Vertical: Story = {
  render: () => (
    <div className="flex items-center text-sm text-secondary-foreground">
      <span className="px-2">Undo</span>
      <Separator orientation="vertical" className="mx-1 h-10" />
      <span className="px-2">Import</span>
      <Separator orientation="vertical" className="mx-1 h-10" />
      <span className="px-2">Export</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const separators = within(canvasElement).getAllByRole("separator");
    await expect(separators).toHaveLength(2);
    await expect(separators[0]).toHaveAttribute("aria-orientation", "vertical");
  },
};

// A history caption: two flex-1 separators around text.
export const Caption: Story = {
  render: () => (
    <div className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
      <Separator className="flex-1" />
      <span className="shrink-0">2 older versions hidden</span>
      <Separator className="flex-1" />
    </div>
  ),
};
