import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Input } from "#components/input";
import { Label } from "#components/label";

const meta = {
  title: "Primitives/Label",
  component: Label,
  args: { children: "Deck name" },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** DeckDiff's stacked field: label, then the control 8px below. */
export const WithInput: Story = {
  render: (args) => (
    <div>
      <Label {...args} htmlFor="label-story-deck-name" />
      <Input id="label-story-deck-name" className="mt-2" placeholder="Atraxa Superfriends" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Deck name"));
    await expect(canvas.getByLabelText("Deck name")).toHaveFocus();
  },
};

/** The native crop zoom range keeps a plain Label. */
export const WithRange: Story = {
  args: { children: "Zoom" },
  render: (args) => (
    <div>
      <Label {...args} htmlFor="label-story-zoom" />
      <input
        id="label-story-zoom"
        type="range"
        min={1}
        max={3}
        step={0.1}
        defaultValue={1.5}
        className="mt-2 w-full accent-cyan-400"
      />
    </div>
  ),
};
