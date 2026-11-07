import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDown, Redo2, Undo2 } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#components/tooltip";

// Plain stand-in for DeckDiff's bordered icon button (Button is a separate module).
const iconButton =
  "inline-flex size-9 items-center justify-center rounded-lg border border-border text-subtle-foreground transition hover:border-border-strong hover:bg-surface hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        {/* Room above the trigger so the default top side doesn't flip. */}
        <div className="p-12">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

function UndoTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger aria-label="Undo" className={iconButton}>
        <Undo2 className="size-4" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent>Undo</TooltipContent>
    </Tooltip>
  );
}

export const Default: Story = {
  render: () => <UndoTooltip />,
};

export const Open: Story = {
  render: () => <UndoTooltip />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Undo" }));
    const body = within(document.body);
    await waitFor(() =>
      expect(body.getByText("Undo", { selector: "[data-slot=tooltip-content]" })).toBeVisible(),
    );
  },
};

export const KeyboardFocus: Story = {
  render: () => <UndoTooltip />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Undo" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const body = within(document.body);
    await waitFor(() =>
      expect(body.getByText("Undo", { selector: "[data-slot=tooltip-content]" })).toBeVisible(),
    );
  },
};

export const EscapeCloses: Story = {
  render: () => <UndoTooltip />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Undo" });
    await userEvent.tab();
    const body = within(document.body);
    await waitFor(() =>
      expect(body.getByText("Undo", { selector: "[data-slot=tooltip-content]" })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector("[data-slot=tooltip-content]")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const Sides: Story = {
  render: () => (
    <div className="grid w-[480px] grid-cols-2 place-items-center gap-y-24 py-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        // Separate providers: a shared one lets only one tooltip stay open.
        <TooltipProvider key={side}>
          <Tooltip defaultOpen>
            <TooltipTrigger aria-label={`Tooltip ${side}`} className={iconButton}>
              <Redo2 className="size-4" strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent side={side}>Side {side}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  ),
};

// Disabled buttons can't take focus, so the reason lives on a focusable wrapper.
export const DisabledReason: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} />}
        aria-label="Redo unavailable: nothing to redo"
        className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <button type="button" disabled aria-label="Redo" className={iconButton}>
          <Redo2 className="size-4" strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent>Nothing to redo</TooltipContent>
    </Tooltip>
  ),
  play: async () => {
    await userEvent.tab();
    const body = within(document.body);
    await waitFor(() => expect(body.getByText("Nothing to redo")).toBeVisible());
  },
};

export const LongText: Story = {
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger aria-label="Sort direction" className={iconButton}>
        <ArrowDown className="size-4" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Sort direction toggles between ascending and descending order for the current grouping
      </TooltipContent>
    </Tooltip>
  ),
};
