import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDown, Redo2, Undo2 } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/tooltip";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  decorators: [
    (Story) => (
      // Room above the trigger so the default top side doesn't flip.
      <div className="p-12">
        <Story />
      </div>
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
  // In Chromatic the browser's real pointer rests on the page and closes a hover-opened tooltip.
  // KeyboardFocusTest captures the open tooltip there instead.
  parameters: { chromatic: { disableSnapshot: true } },
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
    // The content stays in the page, hidden, so it keeps describing its trigger.
    await waitFor(() =>
      expect(document.querySelector("[data-slot=tooltip-content]")).not.toBeVisible(),
    );
    await expect(trigger).toHaveFocus();
  },
};

function SidesGrid({ open }: { open?: boolean }) {
  return (
    <div className="grid w-[480px] grid-cols-2 place-items-center gap-y-24 py-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} defaultOpen={open}>
          <TooltipTrigger render={<Button size="icon" aria-label={`Tooltip ${side}`} />}>
            <Redo2 className="size-4" strokeWidth={1.75} />
          </TooltipTrigger>
          <TooltipContent side={side}>Side {side}</TooltipContent>
        </Tooltip>
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

// A disabled button stays focusable with `focusableWhenDisabled`, so it can host the tooltip
// that says why. The tooltip describes the button (role="tooltip", aria-describedby).
function DisabledRedo() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button disabled focusableWhenDisabled size="icon" aria-label="Redo" />}
      >
        <Redo2 className="size-4" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent>Nothing to redo</TooltipContent>
    </Tooltip>
  );
}

export const DisabledReason: Story = {
  render: () => <DisabledRedo />,
};

export const DisabledReasonTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DisabledRedo />,
  play: async ({ canvasElement }) => {
    const redo = within(canvasElement).getByRole("button", { name: "Redo" });
    await expect(redo).toHaveAttribute("aria-disabled", "true");
    await expect(redo).toHaveAccessibleDescription("Nothing to redo");
    await userEvent.tab();
    await expect(redo).toHaveFocus();
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
