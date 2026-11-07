import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, XIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Field, FieldLabel } from "#components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "#components/input-group";

const meta = {
  title: "Primitives/InputGroup",
  component: InputGroup,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Add card" placeholder="Add card…" />
      <InputGroupAddon>
        <SearchIcon strokeWidth={1.75} />
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Addons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <InputGroup {...args}>
        <InputGroupAddon align="inline-start">
          <SearchIcon strokeWidth={1.75} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Inline start" placeholder="inline-start icon" />
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput aria-label="Inline end" placeholder="inline-end text" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>0 / 40</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput aria-label="With button" defaultValue="Thrasios" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" variant="icon-ghost" aria-label="Clear search">
            <XIcon strokeWidth={1.75} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupAddon align="block-start">
          <InputGroupText>block-start</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea aria-label="Block addons" rows={3} placeholder="Ask the judge…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>block-end</InputGroupText>
          <InputGroupButton variant="default" className="ml-auto">
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** The control keeps its own inputSize padding and type. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(["xs", "sm", "md"] as const).map((inputSize) => (
        <InputGroup {...args} key={inputSize}>
          <InputGroupAddon>
            <SearchIcon strokeWidth={1.75} />
          </InputGroupAddon>
          <InputGroupInput aria-label={inputSize} inputSize={inputSize} placeholder={inputSize} />
        </InputGroup>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <InputGroup {...args}>
        <InputGroupAddon>
          <SearchIcon strokeWidth={1.75} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Invalid" aria-invalid defaultValue="Not a card" />
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupAddon>
          <SearchIcon strokeWidth={1.75} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Disabled" disabled defaultValue="Disabled" />
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupAddon>
          <SearchIcon strokeWidth={1.75} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Read-only" readOnly defaultValue="Read-only" />
      </InputGroup>
    </div>
  ),
};

const onAdd = fn();

/** Keyboard focus rings the shell; Tab then reaches the addon button, which still clicks. */
export const KeyboardFocus: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <SearchIcon strokeWidth={1.75} />
      </InputGroupAddon>
      <InputGroupInput aria-label="Add card" placeholder="Add card…" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={onAdd}>Add</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    onAdd.mockClear();
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByLabelText("Add card")).toHaveFocus();
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Add" });
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onAdd).toHaveBeenCalledTimes(1);
    // End with the ring on the shell for the screenshot.
    await userEvent.tab({ shift: true });
    await expect(canvas.getByLabelText("Add card")).toHaveFocus();
  },
};

/** Clicking the addon (not a button in it) focuses the control. */
export const AddonFocusesControl: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Background URL" placeholder="example.com/art.jpg" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("https://"));
    const input = canvas.getByLabelText("Background URL");
    await expect(input).toHaveFocus();
    await userEvent.type(input, "art");
    await expect(input).toHaveValue("art");
  },
};

/** Inside a Field the label still connects to the grouped control. */
export const InField: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>Search cards</FieldLabel>
      <InputGroup {...args}>
        <InputGroupAddon>
          <SearchIcon strokeWidth={1.75} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Add card…" />
      </InputGroup>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Search cards"));
    await expect(canvas.getByLabelText("Search cards")).toHaveFocus();
  },
};
