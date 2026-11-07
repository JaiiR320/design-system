import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "#components/field";
import { Input } from "#components/input";
import { Textarea } from "#components/textarea";

const meta = {
  title: "Primitives/Field",
  component: Field,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Deck name</FieldLabel>
      <Input placeholder="Enter a deck name" />
      <FieldDescription>Shown on the deck tile and in breadcrumbs.</FieldDescription>
    </Field>
  ),
};

export const LabelSizes: Story = {
  render: (args) => (
    <FieldGroup>
      <Field {...args}>
        <FieldLabel size="md">md label</FieldLabel>
        <Input placeholder="Default form field" />
      </Field>
      <Field {...args}>
        <FieldLabel size="sm">sm label</FieldLabel>
        <Input inputSize="xs" placeholder="Compact filter" />
      </Field>
    </FieldGroup>
  ),
};

export const Orientations: Story = {
  render: (args) => (
    <FieldGroup>
      <Field {...args} orientation="vertical">
        <FieldLabel>Vertical</FieldLabel>
        <Input inputSize="sm" placeholder="Label above" />
      </Field>
      <Field {...args} orientation="horizontal">
        <FieldLabel>Horizontal</FieldLabel>
        <Input inputSize="sm" className="w-48" placeholder="Label beside" />
      </Field>
    </FieldGroup>
  ),
};

export const States: Story = {
  render: (args) => (
    <FieldGroup>
      <Field {...args} invalid>
        <FieldLabel>Invalid</FieldLabel>
        <Input defaultValue="not-an-email" />
        {/* App-controlled errors need `match`: the `invalid` prop alone doesn't render FieldError. */}
        <FieldError match>Enter a valid email address.</FieldError>
      </Field>
      <Field {...args} disabled>
        <FieldLabel>Disabled</FieldLabel>
        <Input defaultValue="Atraxa Superfriends" />
        <FieldDescription>Renaming is unavailable while saving.</FieldDescription>
      </Field>
      <Field {...args}>
        <FieldLabel>Read-only</FieldLabel>
        <Input readOnly defaultValue="Initial build" />
      </Field>
    </FieldGroup>
  ),
};

/** DeckDiff's auth form: stacked fields 16px apart, label 8px above each control. */
export const FormGroup: Story = {
  render: (args) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field {...args}>
          <FieldLabel>Password</FieldLabel>
          <Input type="password" placeholder="At least 8 characters" />
        </Field>
        <Button type="submit" variant="default" className="w-full py-3">
          Sign in
        </Button>
      </FieldGroup>
    </form>
  ),
};

/** Label focuses the control; description is announced with it; native onChange fires. */
export const LabelFocusesControl: Story = {
  args: { onChange: fn() },
  render: ({ onChange, ...args }) => (
    <Field {...args}>
      <FieldLabel>Title</FieldLabel>
      <Input onChange={onChange} placeholder="Brief summary" />
      <FieldDescription>One line, shown in the issue list.</FieldDescription>
    </Field>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Title"));
    const input = canvas.getByLabelText("Title");
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription("One line, shown in the issue list.");
    await userEvent.type(input, "Crash");
    await expect(input).toHaveValue("Crash");
    await expect(args.onChange).toHaveBeenCalledTimes(5);
  },
};

/** Native `required` validated on blur after an edit: error appears, is announced, and marks the control. */
export const RequiredValidation: Story = {
  render: (args) => (
    <Field {...args} validationMode="onBlur">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" required placeholder="you@example.com" />
      <FieldError match="valueMissing">Email is required.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Email");
    await expect(input).toBeRequired();
    // Base UI reports valueMissing only once the value has been edited.
    await userEvent.type(input, "a");
    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    await expect(input).toHaveAccessibleDescription("Email is required.");
  },
};

/** Textarea joins the Field through FieldControl's render prop. */
export const TextareaControl: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Description</FieldLabel>
      <FieldControl
        render={<Textarea rows={5} placeholder="Describe the issue or feature in detail…" />}
      />
      <FieldDescription>Markdown is supported.</FieldDescription>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Description"));
    const textarea = canvas.getByLabelText("Description");
    await expect(textarea.tagName).toBe("TEXTAREA");
    await expect(textarea).toHaveFocus();
    await expect(textarea).toHaveAccessibleDescription("Markdown is supported.");
    await userEvent.type(textarea, "Steps");
    await expect(textarea).toHaveValue("Steps");
  },
};

/** Grouped controls are named by a native legend, not a single-control Field. */
export const FieldSetLegend: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Deck colors</FieldLegend>
      <div className="flex gap-2">
        {["White", "Blue", "Black", "Green"].map((color) => (
          <Button key={color} size="sm" aria-pressed={color === "Blue"}>
            {color}
          </Button>
        ))}
      </div>
    </FieldSet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Deck colors" })).toBeInTheDocument();
  },
};

export const LegendSizes: Story = {
  render: () => (
    <FieldGroup>
      <FieldSet>
        <FieldLegend size="md">md legend</FieldLegend>
        <Input inputSize="sm" aria-label="md legend control" />
      </FieldSet>
      <FieldSet>
        <FieldLegend size="sm">sm legend</FieldLegend>
        <Input inputSize="sm" aria-label="sm legend control" />
      </FieldSet>
    </FieldGroup>
  ),
};
