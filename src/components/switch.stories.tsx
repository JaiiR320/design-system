import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Field, FieldLabel, FieldLegend, FieldSet } from "#components/field";
import { Switch, SwitchChip } from "#components/switch";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  args: { "aria-label": "Notifications", onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="grid w-fit grid-cols-[auto_auto] items-center gap-x-6 gap-y-4 text-sm text-subtle-foreground">
      <span>Off</span>
      <Switch aria-label="Off" />
      <span>On</span>
      <Switch aria-label="On" defaultChecked />
      <span>Disabled off</span>
      <Switch aria-label="Disabled off" disabled />
      <span>Disabled on</span>
      <Switch aria-label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const ChipStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <SwitchChip>Off</SwitchChip>
      <SwitchChip defaultChecked>On</SwitchChip>
      <SwitchChip disabled>Disabled off</SwitchChip>
      <SwitchChip disabled defaultChecked>
        Disabled on
      </SwitchChip>
    </div>
  ),
};

// Export modal options, as in DeckDiff (flex-wrap gap-3 above the preview).
function ExportOptions() {
  const [options, setOptions] = useState({
    quantity: true,
    addedOnly: false,
    groupByCategory: true,
    includeOutOfDeck: true,
  });
  const set = (key: keyof typeof options) => (checked: boolean) =>
    setOptions((current) => ({ ...current, [key]: checked }));

  return (
    <div className="flex w-[640px] flex-wrap gap-3">
      <SwitchChip checked={options.quantity} onCheckedChange={set("quantity")}>
        Quantity
      </SwitchChip>
      <SwitchChip checked={options.addedOnly} onCheckedChange={set("addedOnly")}>
        Added only
      </SwitchChip>
      <SwitchChip checked={options.groupByCategory} onCheckedChange={set("groupByCategory")}>
        Group by category
      </SwitchChip>
      <SwitchChip checked={options.includeOutOfDeck} onCheckedChange={set("includeOutOfDeck")}>
        Include out-of-deck
      </SwitchChip>
      <SwitchChip disabled>Separate sideboard</SwitchChip>
    </div>
  );
}

export const ExportChips: Story = {
  render: () => <ExportOptions />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addedOnly = canvas.getByRole("switch", { name: "Added only" });
    await expect(addedOnly).not.toBeChecked();
    // The whole pill is the click target, label included.
    await userEvent.click(canvas.getByText("Added only"));
    await expect(addedOnly).toBeChecked();
    await userEvent.click(addedOnly);
    await expect(addedOnly).not.toBeChecked();
  },
};

// A visible "On"/"Off" label still needs a stable contextual name.
export const ContextualName: Story = {
  render: () => {
    function Example() {
      const [checked, setChecked] = useState(true);
      return (
        <SwitchChip aria-label="Removed-card ghosts" checked={checked} onCheckedChange={setChecked}>
          {checked ? "On" : "Off"}
        </SwitchChip>
      );
    }
    return <Example />;
  },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole("switch", { name: "Removed-card ghosts" });
    await userEvent.click(chip);
    await expect(chip).not.toBeChecked();
    await expect(chip).toHaveAccessibleName("Removed-card ghosts");
  },
};

export const Keyboard: Story = {
  render: (args) => (
    <form aria-label="Preferences" className="flex items-center gap-3">
      <SwitchChip name="ramp" onCheckedChange={args.onCheckedChange}>
        Include Ramp in deck
      </SwitchChip>
    </form>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("switch", { name: "Include Ramp in deck" });
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(chip).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    // The hidden native input carries the form value when named.
    const input = canvasElement.querySelector<HTMLInputElement>('input[name="ramp"]');
    await waitFor(() => expect(input?.checked).toBe(true));
    await expect(new FormData(canvasElement.querySelector("form") ?? undefined).get("ramp")).toBe(
      "on",
    );
  },
};

export const DisabledStable: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Switch aria-label="Locked" disabled onCheckedChange={args.onCheckedChange} />
      <SwitchChip disabled defaultChecked onCheckedChange={args.onCheckedChange}>
        Hide Ramp
      </SwitchChip>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const locked = canvas.getByRole("switch", { name: "Locked" });
    const chip = canvas.getByRole("switch", { name: "Hide Ramp" });
    await userEvent.click(locked, { pointerEventsCheck: 0 });
    await userEvent.click(chip, { pointerEventsCheck: 0 });
    await expect(locked).not.toBeChecked();
    await expect(chip).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const FocusVisible: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch aria-label="Bare switch" defaultChecked />
      <SwitchChip>Hide Ramp</SwitchChip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("switch", { name: "Hide Ramp" })).toHaveFocus();
  },
};

/** A disabled fieldset disables every switch inside it, including one in a Field. */
export const FieldSetDisabled: Story = {
  render: (args) => (
    <FieldSet disabled>
      <FieldLegend>Export options</FieldLegend>
      <div className="flex flex-wrap items-center gap-3">
        <Switch aria-label="Bare switch" onCheckedChange={args.onCheckedChange} />
        <SwitchChip onCheckedChange={args.onCheckedChange}>Quantity</SwitchChip>
        <Field orientation="horizontal">
          <FieldLabel>Ghosts</FieldLabel>
          <Switch onCheckedChange={args.onCheckedChange} />
        </Field>
      </div>
    </FieldSet>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const switches = ["Bare switch", "Quantity", "Ghosts"].map((name) =>
      canvas.getByRole("switch", { name }),
    );
    for (const control of switches) {
      await expect(control).toBeDisabled();
      // Pointer: nothing under the switch receives the hit, and a forced click does nothing.
      const box = control.getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      await expect(control.contains(hit)).toBe(false);
      await userEvent.click(control, { pointerEventsCheck: 0 });
      // Keyboard: the switch can't take focus, so Space can't reach it.
      control.focus();
      await expect(control).not.toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(control).toHaveAttribute("aria-checked", "false");
    }
    await userEvent.click(canvas.getByText("Ghosts"));
    await userEvent.tab();
    await expect(document.body).toHaveFocus();
    await expect(switches[2]).toHaveAttribute("aria-checked", "false");
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
