import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Toggle } from "#components/toggle";
import { cn } from "#lib/utils";

const meta = {
  title: "Primitives/Toggle",
  component: Toggle,
  args: { children: "Show prices", onPressedChange: fn() },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Each variant at its default size: off, pressed, disabled.
export const Variants: Story = {
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(3,auto)] items-center gap-x-6 gap-y-4 text-sm text-subtle-foreground">
      <span />
      <span>Off</span>
      <span>Pressed</span>
      <span>Disabled</span>

      <span>outline</span>
      <Toggle variant="outline">Bug</Toggle>
      <Toggle variant="outline" defaultPressed>
        Bug
      </Toggle>
      <Toggle variant="outline" disabled>
        Bug
      </Toggle>

      <span>accent</span>
      <Toggle variant="accent" aria-label="Bold off">
        <Bold strokeWidth={1.75} />
      </Toggle>
      <Toggle variant="accent" aria-label="Bold on" defaultPressed>
        <Bold strokeWidth={1.75} />
      </Toggle>
      <Toggle variant="accent" aria-label="Bold disabled" disabled>
        <Bold strokeWidth={1.75} />
      </Toggle>

      <span>segmented</span>
      <Toggle variant="segmented">Sign in</Toggle>
      <Toggle variant="segmented" defaultPressed>
        Sign in
      </Toggle>
      <Toggle variant="segmented" disabled>
        Sign in
      </Toggle>

      <span>round</span>
      <Toggle variant="round" aria-label="Add Blue">
        <ColorDot />
      </Toggle>
      <Toggle variant="round" aria-label="Remove Blue" defaultPressed>
        <ColorDot />
      </Toggle>
      <Toggle variant="round" aria-label="Blue unavailable" disabled>
        <ColorDot />
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <Toggle size="xs">xs</Toggle>
        <Toggle size="sm">sm</Toggle>
        <Toggle size="md">md</Toggle>
        <Toggle size="lg">lg</Toggle>
        <Toggle size="none">none</Toggle>
      </div>
      <div className="flex items-center gap-3">
        <Toggle size="icon-xs" aria-label="icon-xs">
          <Plus className="size-3" strokeWidth={1.75} />
        </Toggle>
        <Toggle size="icon-sm" aria-label="icon-sm">
          <Plus strokeWidth={1.75} />
        </Toggle>
        <Toggle size="icon" aria-label="icon">
          <Plus strokeWidth={1.75} />
        </Toggle>
        <Toggle size="icon-lg" aria-label="icon-lg">
          <Plus strokeWidth={1.75} />
        </Toggle>
      </div>
    </div>
  ),
};

// Mana symbols stay in DeckDiff; a CSS dot stands in for them here.
function ColorDot({ className = "bg-sky-400" }: { className?: string }) {
  return <span aria-hidden className={cn("size-7 rounded-full", className)} />;
}

const colors = [
  { label: "White", dot: "bg-amber-100" },
  { label: "Blue", dot: "bg-sky-400" },
  { label: "Black", dot: "bg-zinc-500" },
  { label: "Red", dot: "bg-red-500" },
  { label: "Green", dot: "bg-emerald-500" },
];

// Static: toggling one of these glowing neighbours repaints only part of the
// overlapping blur, which is not pixel-stable. Interaction lives in RoundKeyboard.
export const DeckColors: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState(["White", "Blue", "Black", "Green"]);
      return (
        <div role="group" aria-label="Deck colors" className="flex shrink-0 gap-2">
          {colors.map(({ label, dot }) => {
            const isSelected = selected.includes(label);
            return (
              <Toggle
                key={label}
                variant="round"
                aria-label={`${isSelected ? "Remove" : "Add"} ${label}`}
                pressed={isSelected}
                onPressedChange={(pressed) =>
                  setSelected((current) =>
                    pressed ? [...current, label] : current.filter((c) => c !== label),
                  )
                }
              >
                <ColorDot className={dot} />
              </Toggle>
            );
          })}
        </div>
      );
    }
    return <Example />;
  },
};

// The editor's "Show differences only" toggle.
export const DiffToggle: Story = {
  render: () => {
    function Example() {
      const [diffOnly, setDiffOnly] = useState(false);
      const label = diffOnly ? "Show all cards" : "Show differences only";
      return (
        <Toggle
          variant="accent"
          className="relative"
          aria-label={label}
          title={label}
          pressed={diffOnly}
          onPressedChange={setDiffOnly}
        >
          <Minus className="size-3.5 translate-y-[2px]" strokeWidth={2} />
          <Plus className="absolute size-3.5 -translate-y-[2px]" strokeWidth={2} />
        </Toggle>
      );
    }
    return <Example />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show differences only" }));
    await expect(canvas.getByRole("button", { name: "Show all cards" })).toHaveAttribute(
      "data-pressed",
    );
  },
};

export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Show prices" });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).toHaveBeenCalledTimes(2);
  },
};

export const DisabledStable: Story = {
  args: { disabled: true, defaultPressed: true },
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Show prices" });
    await userEvent.click(toggle, { pointerEventsCheck: 0 });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const RoundKeyboard: Story = {
  render: (args) => (
    <Toggle variant="round" aria-label="Blue" onPressedChange={args.onPressedChange}>
      <ColorDot />
    </Toggle>
  ),
  play: async ({ args, canvasElement }) => {
    const blue = within(canvasElement).getByRole("button", { name: "Blue" });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(blue).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledWith(true, expect.anything());
  },
};
