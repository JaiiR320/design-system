import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Input } from "#components/input";
import { Label } from "#components/label";

const meta = {
  title: "Primitives/Input",
  component: Input,
  args: { placeholder: "you@example.com", "aria-label": "Email" },
  argTypes: { inputSize: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} inputSize="sm" aria-label="Small" placeholder="sm: compact" />
      <Input {...args} inputSize="md" aria-label="Medium" placeholder="md: default" />
      <Input {...args} inputSize="lg" aria-label="Large" placeholder="lg: roomy form field" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} aria-label="Placeholder" />
      <Input {...args} aria-label="Filled" defaultValue="ada@example.com" />
      <Input {...args} aria-label="Read-only" readOnly defaultValue="Read-only value" />
      <Input {...args} aria-label="Invalid" aria-invalid defaultValue="not-an-email" />
      <Input {...args} aria-label="Disabled" disabled defaultValue="Disabled" />
      {/* Native `size` stays the HTML character-width attribute. */}
      <Input
        {...args}
        aria-label="Native size"
        size={12}
        className="w-auto self-start"
        placeholder="size=12"
      />
    </div>
  ),
};

/** Native onChange fires per keystroke and the label focuses the control. */
export const Typing: Story = {
  args: { onChange: fn() },
  render: (args) => (
    <div>
      <Label htmlFor="input-story-email">Email</Label>
      <Input
        {...args}
        id="input-story-email"
        aria-label={undefined}
        type="email"
        className="mt-2"
      />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Email"));
    const input = canvas.getByLabelText("Email");
    await expect(input).toHaveFocus();
    await userEvent.type(input, "ada.park@acme.io");
    await expect(input).toHaveValue("ada.park@acme.io");
    await expect(args.onChange).toHaveBeenCalledTimes(16);
  },
};

/** Keyboard focus: cyan border plus the offset focus ring. */
export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText("Email")).toHaveFocus();
  },
};

/** Inline form: separate-border Input + Button stay a flex row. */
export const InlineForm: Story = {
  render: (args) => (
    <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
      <Input {...args} inputSize="md" aria-label="Project name" defaultValue="Atlas" />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-cyan-400 px-3 py-2 text-sm font-medium text-cyan-950"
      >
        Save
      </button>
    </form>
  ),
};
