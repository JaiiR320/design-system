import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Label } from "#components/label";
import { Textarea } from "#components/textarea";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  args: { "aria-label": "Description", placeholder: "Describe the issue in detail…", rows: 4 },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  args: { rows: 2 },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Textarea {...args} aria-label="Filled" defaultValue={"Agenda\nAction items"} />
      <Textarea {...args} aria-label="Invalid" aria-invalid defaultValue="Too short" />
      <Textarea {...args} aria-label="Disabled" disabled defaultValue="Disabled" />
      <Textarea {...args} aria-label="Read-only" readOnly defaultValue="Read-only value" />
    </div>
  ),
};

/** Export dialog: read-only, darker surface, brighter text, tall and vertically resizable. */
export const ExportPreview: Story = {
  render: (args) => (
    <Textarea
      {...args}
      aria-label="Export preview"
      readOnly
      className="min-h-80 resize-y bg-background text-strong-foreground"
      defaultValue={
        "# Quarterly report\n\n- Revenue up 12%\n- Two new hires\n- Launch plan approved"
      }
    />
  ),
};

/** Native onChange fires per keystroke and the label focuses the control. */
export const Typing: Story = {
  args: { onChange: fn() },
  render: (args) => (
    <div>
      <Label htmlFor="textarea-story-description">Description</Label>
      <Textarea
        {...args}
        id="textarea-story-description"
        aria-label={undefined}
        className="mt-2 resize-y"
      />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Description"));
    const textarea = canvas.getByLabelText("Description");
    await expect(textarea).toHaveFocus();
    await userEvent.type(textarea, "Launch plan");
    await expect(textarea).toHaveValue("Launch plan");
    await expect(args.onChange).toHaveBeenCalledTimes(11);
  },
};

/** Keyboard focus: cyan border plus the offset focus ring. */
export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText("Description")).toHaveFocus();
  },
};
