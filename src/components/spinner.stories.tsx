import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Spinner } from "#components/spinner";

const meta = {
  title: "Primitives/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-subtle-foreground">
      <Spinner />
      <Spinner className="size-5" />
      <Spinner className="size-5 text-primary" />
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading printings"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Spinner />
      Loading printings
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Loading printings" })).toBeInTheDocument();
    const spinner = canvasElement.querySelector("[data-slot=spinner]");
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
  },
};
