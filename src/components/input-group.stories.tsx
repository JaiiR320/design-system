import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, XIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Field, FieldControl, FieldDescription, FieldLabel } from "#components/field";
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
      <InputGroupInput aria-label="Add member" placeholder="Add member…" />
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
        <InputGroupInput aria-label="With button" defaultValue="Ada Park" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" variant="ghost" aria-label="Clear search">
            <XIcon strokeWidth={1.75} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupAddon align="block-start">
          <InputGroupText>block-start</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea aria-label="Block addons" rows={3} placeholder="Leave a comment…" />
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
      {(["sm", "md", "lg"] as const).map((inputSize) => (
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
        <InputGroupInput aria-label="Invalid" aria-invalid defaultValue="Not a member" />
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
      <InputGroupInput aria-label="Add member" placeholder="Add member…" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={onAdd}>Add</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    onAdd.mockClear();
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByLabelText("Add member")).toHaveFocus();
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Add" });
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onAdd).toHaveBeenCalledTimes(1);
    // End with the ring on the shell for the screenshot.
    await userEvent.tab({ shift: true });
    await expect(canvas.getByLabelText("Add member")).toHaveFocus();
  },
};

/** Clicking the addon (not a button in it) focuses the control. */
export const AddonFocusesControl: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Cover URL" placeholder="example.com/cover.png" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("https://"));
    const input = canvas.getByLabelText("Cover URL");
    await expect(input).toHaveFocus();
    await userEvent.type(input, "cover");
    await expect(input).toHaveValue("cover");
  },
};

/** Inside a Field the label still connects to the grouped control. */
export const InField: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>Search documents</FieldLabel>
      <InputGroup {...args}>
        <InputGroupAddon>
          <SearchIcon strokeWidth={1.75} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" />
      </InputGroup>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Search documents"));
    await expect(canvas.getByLabelText("Search documents")).toHaveFocus();
  },
};

const onAddonClick = fn();

/** A consumer onClick still focuses the control; links in an addon keep their own focus. */
export const AddonClickHandlerTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon onClick={onAddonClick}>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Image URL" placeholder="example.com/cover.png" />
      <InputGroupAddon align="inline-end">
        <a href="#image-url-help" className="text-xs underline">
          Help
        </a>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    onAddonClick.mockClear();
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Image URL");
    await userEvent.click(canvas.getByText("https://"));
    await expect(onAddonClick).toHaveBeenCalledTimes(1);
    await expect(input).toHaveFocus();
    const link = canvas.getByRole("link", { name: "Help" });
    // Cancel the link's navigation only after React (and the addon) handled the click.
    const stayOnPage = (event: Event) => event.preventDefault();
    document.addEventListener("click", stayOnPage);
    await userEvent.click(link);
    document.removeEventListener("click", stayOnPage);
    await expect(link).toHaveFocus();
    await userEvent.click(canvas.getByText("https://"));
    await expect(input).toHaveFocus();
  },
};

/** The documented textarea composition: FieldControl renders InputGroupTextarea. */
export const FieldControlTextarea: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {[
        { label: "Notes", description: "Markdown is supported." },
        { label: "Invalid notes", invalid: true },
        { label: "Disabled notes", disabled: true },
      ].map(({ label, description, ...state }) => (
        <Field key={label} {...state}>
          <FieldLabel>{label}</FieldLabel>
          <InputGroup {...args}>
            <FieldControl render={<InputGroupTextarea rows={2} placeholder="Add a note…" />} />
            <InputGroupAddon align="block-end">
              <InputGroupText>{label} · 0 / 200</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText("Notes");
    const shell = (label: string) =>
      canvas.getByLabelText(label).closest<HTMLElement>("[data-slot=input-group]")!;
    const style = (label: string) => getComputedStyle(shell(label));
    await expect(textarea.tagName).toBe("TEXTAREA");
    await expect(textarea).toHaveAccessibleDescription("Markdown is supported.");
    // Invalid recolors the shell border; disabled dims the shell.
    await expect(canvas.getByLabelText("Invalid notes")).toHaveAttribute("aria-invalid", "true");
    await expect(style("Invalid notes").borderTopColor).not.toBe(style("Notes").borderTopColor);
    await expect(canvas.getByLabelText("Disabled notes")).toBeDisabled();
    await expect(style("Disabled notes").opacity).toBe("0.5");
    await expect(style("Notes").opacity).toBe("1");
    // Clicking the addon focuses the textarea.
    await userEvent.click(canvas.getByText("Notes · 0 / 200"));
    await expect(textarea).toHaveFocus();
    // Keyboard focus rings the shell; the textarea itself draws none.
    textarea.blur();
    await expect(style("Notes").boxShadow).toBe("none");
    await userEvent.tab();
    await expect(textarea).toHaveFocus();
    await expect(textarea.matches(":focus-visible")).toBe(true);
    await expect(style("Notes").boxShadow).not.toBe("none");
  },
};
