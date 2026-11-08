import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { buttonSizeVariants } from "#components/button";
import { Toggle } from "#components/toggle";
import { cn } from "#lib/utils";

const meta = {
  title: "Primitives/Toggle",
  component: Toggle,
  args: { children: "Show archived", onPressedChange: fn() },
} satisfies Meta<typeof Toggle>;

// App-owned look layered on Toggle with variant={null}: a label-color swatch that lights up when pressed.
const swatchLook =
  "size-10 rounded-full border border-border bg-background p-0 opacity-30 grayscale not-data-pressed:hover:border-border-strong not-data-pressed:hover:opacity-60 data-pressed:border-white/40 data-pressed:opacity-100 data-pressed:grayscale-0 data-pressed:shadow-[0_0_18px_rgb(34_211_238/0.14)]";

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
      <Toggle variant="accent" size="icon-sm" aria-label="Bold off">
        <Bold strokeWidth={1.75} />
      </Toggle>
      <Toggle variant="accent" size="icon-sm" aria-label="Bold on" defaultPressed>
        <Bold strokeWidth={1.75} />
      </Toggle>
      <Toggle variant="accent" size="icon-sm" aria-label="Bold disabled" disabled>
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

      <span>custom look (variant=null)</span>
      <Toggle variant={null} className={swatchLook} aria-label="Add Sky">
        <ColorDot />
      </Toggle>
      <Toggle variant={null} className={swatchLook} aria-label="Remove Sky" defaultPressed>
        <ColorDot />
      </Toggle>
      <Toggle variant={null} className={swatchLook} aria-label="Sky unavailable" disabled>
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
  // Sizes come from Button's size recipe, so the two can't drift.
  play: async ({ canvasElement }) => {
    const sizes = [
      "xs",
      "sm",
      "md",
      "lg",
      "none",
      "icon-xs",
      "icon-sm",
      "icon",
      "icon-lg",
    ] as const;
    for (const size of sizes) {
      const toggle = within(canvasElement).getByRole("button", { name: size });
      for (const name of buttonSizeVariants({ size }).split(" ").filter(Boolean)) {
        await expect(toggle).toHaveClass(name);
      }
    }
  },
};

// A CSS dot stands in for a label color.
function ColorDot({ className = "bg-sky-400" }: { className?: string }) {
  return <span aria-hidden className={cn("size-7 rounded-full", className)} />;
}

const colors = [
  { label: "Amber", dot: "bg-amber-100" },
  { label: "Sky", dot: "bg-sky-400" },
  { label: "Slate", dot: "bg-zinc-500" },
  { label: "Red", dot: "bg-red-500" },
  { label: "Emerald", dot: "bg-emerald-500" },
];

// Static: toggling one of these glowing neighbours repaints only part of the
// overlapping blur, which is not pixel-stable. Interaction lives in CustomLookKeyboard.
export const LabelColors: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState(["Amber", "Sky", "Slate", "Emerald"]);
      return (
        <div role="group" aria-label="Label colors" className="flex shrink-0 gap-2">
          {colors.map(({ label, dot }) => {
            const isSelected = selected.includes(label);
            return (
              <Toggle
                key={label}
                variant={null}
                className={swatchLook}
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

// An icon toggle whose name follows its state.
export const ChangesOnlyToggle: Story = {
  render: () => {
    function Example() {
      const [changesOnly, setChangesOnly] = useState(false);
      const label = changesOnly ? "Show all items" : "Show changes only";
      return (
        <Toggle
          variant="accent"
          size="icon-sm"
          className="relative"
          aria-label={label}
          title={label}
          pressed={changesOnly}
          onPressedChange={setChangesOnly}
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
    await userEvent.click(canvas.getByRole("button", { name: "Show changes only" }));
    await expect(canvas.getByRole("button", { name: "Show all items" })).toHaveAttribute(
      "data-pressed",
    );
  },
};

export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Show archived" });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).toHaveBeenCalledTimes(2);
  },
};

export const DisabledStableTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { disabled: true, defaultPressed: true },
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Show archived" });
    await userEvent.click(toggle, { pointerEventsCheck: 0 });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const CustomLookKeyboard: Story = {
  render: (args) => (
    <Toggle
      variant={null}
      className={swatchLook}
      aria-label="Sky"
      onPressedChange={args.onPressedChange}
    >
      <ColorDot />
    </Toggle>
  ),
  play: async ({ args, canvasElement }) => {
    const sky = within(canvasElement).getByRole("button", { name: "Sky" });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(sky).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledWith(true, expect.anything());
  },
};
