import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Bug, Italic, Lightbulb, Underline } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { ToggleGroup, ToggleGroupItem } from "#components/toggle-group";
import { cn } from "#lib/utils";

const meta = {
  title: "Primitives/ToggleGroup",
  component: ToggleGroup,
  args: { "aria-label": "Text style", onValueChange: fn() },
} satisfies Meta<typeof ToggleGroup>;

// App-owned look layered on Toggle with variant={null}: a color swatch that lights up when pressed.
const swatchLook =
  "size-10 rounded-full border border-border bg-background p-0 opacity-30 grayscale not-data-pressed:hover:border-border-strong not-data-pressed:hover:opacity-60 data-pressed:border-white/40 data-pressed:opacity-100 data-pressed:grayscale-0 data-pressed:shadow-[0_0_18px_rgb(34_211_238/0.14)]";

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Mana symbols stay in DeckDiff; a CSS dot stands in for them here.
function ColorDot({ className }: { className: string }) {
  return <span aria-hidden className={cn("size-7 rounded-full", className)} />;
}

const colors = [
  { label: "White", dot: "bg-amber-100" },
  { label: "Blue", dot: "bg-sky-400" },
  { label: "Black", dot: "bg-zinc-500" },
  { label: "Red", dot: "bg-red-500" },
  { label: "Green", dot: "bg-emerald-500" },
];

// Each variant with its default item size, plus an explicit group size and a disabled group.
export const Variants: Story = {
  render: () => (
    <div className="grid w-fit grid-cols-[auto_auto] items-center gap-x-6 gap-y-4 text-sm text-subtle-foreground">
      <span>outline</span>
      <ToggleGroup aria-label="Outline" defaultValue={["bug"]}>
        <ToggleGroupItem value="bug">Bug</ToggleGroupItem>
        <ToggleGroupItem value="feature">Feature</ToggleGroupItem>
      </ToggleGroup>

      <span>accent</span>
      <ToggleGroup
        aria-label="Accent"
        variant="accent"
        size="icon-sm"
        multiple
        defaultValue={["bold"]}
      >
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold strokeWidth={1.75} />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic strokeWidth={1.75} />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline strokeWidth={1.75} />
        </ToggleGroupItem>
      </ToggleGroup>

      <span>segmented</span>
      <ToggleGroup aria-label="Segmented" variant="segmented" defaultValue={["sign-up"]}>
        <ToggleGroupItem value="sign-in">Sign in</ToggleGroupItem>
        <ToggleGroupItem value="sign-up">Sign up</ToggleGroupItem>
      </ToggleGroup>

      <span>segmented, three options</span>
      <ToggleGroup aria-label="View" variant="segmented" defaultValue={["week"]}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>

      <span>custom look (variant=null)</span>
      <ToggleGroup
        aria-label="Colors"
        variant={null}
        className="flex shrink-0 gap-2"
        multiple
        defaultValue={["White", "Blue", "Black", "Green"]}
      >
        {colors.map(({ label, dot }) => (
          <ToggleGroupItem key={label} value={label} aria-label={label} className={swatchLook}>
            <ColorDot className={dot} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <span>outline size=xs</span>
      <ToggleGroup aria-label="Outline xs" size="xs" defaultValue={["bug"]}>
        <ToggleGroupItem value="bug">Bug</ToggleGroupItem>
        <ToggleGroupItem value="feature">Feature</ToggleGroupItem>
      </ToggleGroup>

      <span>disabled</span>
      <ToggleGroup aria-label="Disabled" disabled defaultValue={["bug"]}>
        <ToggleGroupItem value="bug">Bug</ToggleGroupItem>
        <ToggleGroupItem value="feature">Feature</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

type Mode = "sign-in" | "sign-up";

// Auth mode: single selection; the handler ignores the empty array so one segment stays pressed.
export const AuthMode: Story = {
  render: () => {
    function Example() {
      const [mode, setMode] = useState<Mode>("sign-up");
      return (
        <div className="w-[382px]">
          <ToggleGroup<Mode>
            aria-label="Authentication mode"
            variant="segmented"
            value={[mode]}
            onValueChange={(value) => {
              if (value[0]) setMode(value[0]);
            }}
          >
            <ToggleGroupItem<Mode> value="sign-in">Sign in</ToggleGroupItem>
            <ToggleGroupItem<Mode> value="sign-up">Sign up</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );
    }
    return <Example />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const signIn = canvas.getByRole("button", { name: "Sign in" });
    const signUp = canvas.getByRole("button", { name: "Sign up" });
    await userEvent.click(signIn);
    await expect(signIn).toHaveAttribute("aria-pressed", "true");
    await expect(signUp).toHaveAttribute("aria-pressed", "false");
    // Pressing the active segment again must not leave the group empty.
    await userEvent.click(signIn);
    await expect(signIn).toHaveAttribute("aria-pressed", "true");
  },
};

// Feedback type: outline items stretched with flex-1 and Feedback's own inactive fill.
// Static: un-pressing a translucent selected item repaints its corners non-deterministically
// in Chromium; single-selection interaction is covered by AuthMode.
const feedbackOff =
  "flex-1 not-data-pressed:bg-surface not-data-pressed:text-subtle-foreground not-data-pressed:hover:text-strong-foreground";

export const FeedbackType: Story = {
  render: () => {
    function Example() {
      const [type, setType] = useState("bug");
      return (
        <div className="w-[398px]">
          <ToggleGroup
            aria-label="Issue type"
            value={[type]}
            onValueChange={(value) => {
              if (value[0]) setType(value[0]);
            }}
          >
            <ToggleGroupItem value="bug" className={feedbackOff}>
              <Bug className="size-4" strokeWidth={1.75} />
              Bug Report
            </ToggleGroupItem>
            <ToggleGroupItem value="feature" className={feedbackOff}>
              <Lightbulb className="size-4" strokeWidth={1.75} />
              Feature Request
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      );
    }
    return <Example />;
  },
};

// Multiple selection with roving focus: one tab stop, arrows move, Space toggles.
export const MultipleKeyboard: Story = {
  args: { multiple: true, defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args} variant="accent" size="icon-sm">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold strokeWidth={1.75} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic strokeWidth={1.75} />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline strokeWidth={1.75} />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    const underline = canvas.getByRole("button", { name: "Underline" });
    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(italic).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["bold", "italic"],
      expect.anything(),
    );
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(bold).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(underline).toHaveFocus();
  },
};

export const DisabledStable: Story = {
  args: { disabled: true, defaultValue: ["bold"] },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const italic = within(canvasElement).getByRole("button", { name: "Italic" });
    await userEvent.click(italic, { pointerEventsCheck: 0 });
    await expect(italic).toHaveAttribute("aria-pressed", "false");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
