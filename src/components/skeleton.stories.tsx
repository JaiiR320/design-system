import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Skeleton } from "#components/skeleton";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  args: { className: "h-4 w-48" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Skeletons are decorative; the labelled parent announces the loading state.
export const LoadingRow: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading snapshots"
      className="flex w-96 items-center justify-between gap-3 rounded-xl border border-border p-4"
    >
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-9 w-16 rounded-xl" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", { name: "Loading snapshots" });
    for (const skeleton of status.querySelectorAll("[data-slot=skeleton]")) {
      await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    }
  },
};

export const CardGrid: Story = {
  render: () => (
    <div role="status" aria-label="Loading printings" className="grid grid-cols-4 gap-3">
      {["a", "b", "c", "d"].map((key) => (
        <Skeleton key={key} className="aspect-[5/7] w-32 rounded-xl" />
      ))}
    </div>
  ),
};
