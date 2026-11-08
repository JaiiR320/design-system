import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDown, Redo2, Undo2 } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#components/tooltip";

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
      <TooltipTrigger render={<Button size="icon" aria-label="Undo" />}>
        <Undo2 className="size-4" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent>Undo</TooltipContent>
    </Tooltip>
  );
}

/** Hover or focus the button to show the tooltip. */
export const Default: Story = {
  render: () => <UndoTooltip />,
};

export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
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

export const KeyboardFocusTest: Story = {
  tags: ["!dev", "!autodocs"],
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

export const EscapeClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
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

function SidesGrid({ open }: { open?: boolean }) {
  return (
    <div className="grid w-[480px] grid-cols-2 place-items-center gap-y-24 py-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        // Separate providers: a shared one lets only one tooltip stay open.
        <TooltipProvider key={side}>
          <Tooltip defaultOpen={open}>
            <TooltipTrigger render={<Button size="icon" aria-label={`Tooltip ${side}`} />}>
              <Redo2 className="size-4" strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent side={side}>Side {side}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

/** One trigger per side. */
export const Sides: Story = {
  render: () => <SidesGrid />,
};

export const SidesTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SidesGrid open />,
};

// Base UI 1.9 tooltips are visual hints: no role="tooltip", no aria-describedby. Disabled
// buttons can't take focus, so a focusable group carries the name and describes itself with
// persistent sr-only text; the tooltip only repeats it for sighted users.
function DisabledRedo() {
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={<span tabIndex={0} />}
          role="group"
          aria-label="Redo"
          aria-describedby="redo-reason"
          className="inline-flex rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Button disabled size="icon" aria-label="Redo">
            <Redo2 className="size-4" strokeWidth={1.75} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Nothing to redo</TooltipContent>
      </Tooltip>
      <span id="redo-reason" className="sr-only">
        Nothing to redo
      </span>
    </>
  );
}

export const DisabledReason: Story = {
  render: () => <DisabledRedo />,
};

export const DisabledReasonTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DisabledRedo />,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("group", { name: "Redo" });
    await expect(group).toHaveAccessibleDescription("Nothing to redo");
    await userEvent.tab();
    await expect(group).toHaveFocus();
    const body = within(document.body);
    await waitFor(() =>
      expect(
        body.getByText("Nothing to redo", { selector: "[data-slot=tooltip-content]" }),
      ).toBeVisible(),
    );
  },
};

export const LongTextTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button size="icon" aria-label="Sort direction" />}>
        <ArrowDown className="size-4" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Sort direction toggles between ascending and descending order for the current grouping
      </TooltipContent>
    </Tooltip>
  ),
};
