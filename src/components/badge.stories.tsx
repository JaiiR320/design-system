import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Badge } from "#components/badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  args: { children: "3 snapshots" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const rowLabel = "w-20 text-xs text-muted-foreground";

export const Variants: Story = {
  render: () => (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <span className={rowLabel}>neutral</span>
        <Badge>3 snapshots</Badge>
        <Badge>1 snapshot</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className={rowLabel}>order</span>
        <Badge variant="order" />
        <Badge variant="order" data-selected="">
          1
        </Badge>
        <Badge variant="order" data-selected="">
          2
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className={rowLabel}>selected</span>
        <Badge variant="selected" className="w-48">
          Current
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className={rowLabel}>outline</span>
        <Badge variant="outline">Drop to move here</Badge>
      </div>
    </div>
  ),
};

// The printing ribbon is positioned locally over a card image placeholder.
export const SelectedRibbon: Story = {
  render: () => (
    <div className="relative h-64 w-44 rounded-xl border border-border-strong bg-secondary">
      <Badge variant="selected" className="absolute inset-x-3 top-3 z-10">
        Current
      </Badge>
    </div>
  ),
};

export const RenderAsLink: Story = {
  render: () => <Badge render={<a href="#history" />}>3 snapshots</Badge>,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "3 snapshots" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "#history");
    await expect(link).toHaveAttribute("data-slot", "badge");
  },
};

export const NarrowWrapping: Story = {
  render: () => (
    <div className="flex w-56 flex-wrap gap-2 rounded-lg border border-border p-3">
      <Badge>3 snapshots</Badge>
      <Badge>12 cards</Badge>
      <Badge>Commander</Badge>
      <Badge>Sideboard</Badge>
    </div>
  ),
};
