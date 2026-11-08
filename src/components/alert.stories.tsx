import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { X } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Alert, AlertActions, AlertDescription, AlertTitle } from "#components/alert";
import { focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  args: { children: "Changes are saved automatically." },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stand-ins for the Button primitive so these stories don't depend on another module.
const secondaryButton = cn(
  focusRing,
  "inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:border-border-strong hover:bg-surface",
);
const primaryButton =
  "inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover";
const warningButton =
  "inline-flex items-center justify-center rounded-lg bg-warning px-3 py-1.5 text-sm font-medium text-warning-foreground hover:bg-warning-hover";

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="destructive">Could not load this project.</Alert>
      <Alert tone="warning">Restoring this version will overwrite your current draft.</Alert>
      <Alert tone="info">Select two versions to compare them.</Alert>
      <Alert tone="success">Thanks! Your feedback was sent.</Alert>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert size="default">Default: rounded-xl, px-4 py-3.</Alert>
      <Alert size="sm">Small: rounded-lg, px-3 py-2.</Alert>
      <Alert size="panel">Panel: rounded-xl, p-4.</Alert>
    </div>
  ),
};

// Import warnings: a section with a heading, dismiss button and list copy.
export const WithTitle: Story = {
  render: () => (
    <Alert tone="warning" size="panel" render={<section aria-labelledby="warnings-title" />}>
      <div className="flex items-start justify-between gap-4">
        <AlertTitle id="warnings-title">Warnings</AlertTitle>
        <button
          type="button"
          aria-label="Dismiss warnings"
          className="rounded-lg p-1 text-warning-text hover:bg-warning-border/30 hover:text-warning-muted-foreground"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>
      <AlertDescription className="mt-3">
        <ul className="space-y-2 text-sm text-warning-muted-foreground/90">
          <li>
            <span className="font-medium">Row 4:</span> Ada Prak{" "}
            <span className="text-warning-text">Person not found</span>
          </li>
          <li>
            <span className="font-medium">Row 9:</span> Sam Lee{" "}
            <span className="text-warning-text">Already invited</span>
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", { name: "Warnings" });
    await expect(section.tagName).toBe("SECTION");
    await expect(section).toHaveAttribute("data-slot", "alert");
  },
};

export const RenderAsParagraph: Story = {
  render: () => (
    <Alert tone="destructive" render={<p />}>
      Could not reach the server.
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector("[data-slot=alert]");
    await expect(alert?.tagName).toBe("P");
  },
};

function InlineRestoreConfirm() {
  const [pending, setPending] = useState(false);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus moves to Cancel when the confirm is revealed; Cancel hands it back to Restore.
  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Revise launch plan</p>
          <p className="mt-1 text-xs text-muted-foreground">Nov 7, 2026, 01:00 AM</p>
        </div>
        <button
          ref={restoreRef}
          type="button"
          className={secondaryButton}
          onClick={() => setPending(true)}
        >
          Restore
        </button>
      </div>
      {pending ? (
        <Alert tone="warning" size="panel" role="alert">
          <AlertDescription>
            Restoring this version will overwrite your current draft.
          </AlertDescription>
          <AlertActions>
            <button
              type="button"
              className={secondaryButton}
              ref={cancelRef}
              onClick={() => {
                setPending(false);
                restoreRef.current?.focus();
              }}
            >
              Cancel
            </button>
            <button type="button" className={primaryButton}>
              Save Version
            </button>
            <button type="button" className={warningButton}>
              Restore Anyway
            </button>
          </AlertActions>
        </Alert>
      ) : null}
    </div>
  );
}

export const InlineConfirm: Story = {
  render: () => <InlineRestoreConfirm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Restore" }));
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("overwrite your current draft");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus());

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.queryByRole("alert")).toBeNull());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Restore" })).toHaveFocus());

    // Re-open so the snapshot captures the revealed confirm.
    await userEvent.keyboard("{Enter}");
    await canvas.findByRole("alert");
  },
};

export const NarrowWrapping: Story = {
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Alert tone="destructive" size="panel">
      <AlertTitle>Delete project?</AlertTitle>
      <AlertDescription className="mt-1">
        This will delete the project and all 3 snapshots.
      </AlertDescription>
      <AlertActions>
        <button type="button" className={secondaryButton}>
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground"
        >
          Delete
        </button>
        <button type="button" className={secondaryButton}>
          Move to Archive
        </button>
      </AlertActions>
    </Alert>
  ),
};
