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

// App-owned look layered on Badge with variant={null}: a numbered step marker.
const stepLook =
  "flex size-6 items-center justify-center rounded-full bg-secondary p-0 text-xs font-semibold text-muted-foreground data-selected:bg-primary data-selected:text-primary-foreground";

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
        <span className={rowLabel}>outline</span>
        <Badge variant="outline">Draft</Badge>
        <Badge variant="outline">12 items</Badge>
      </div>
    </div>
  ),
};

/** App-specific looks: `variant={null}` plus the app's own classes, here numbered step markers. */
export const CustomLook: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge variant={null} className={stepLook} />
      <Badge variant={null} className={stepLook} data-selected="">
        1
      </Badge>
      <Badge variant={null} className={stepLook} data-selected="">
        2
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
