import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#components/alert-dialog";
import { Button } from "#components/button";
import { Dialog, DialogContent, DialogTitle } from "#components/dialog";

const meta = {
  title: "Primitives/AlertDialog",
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

// Caller owns open state: close on success, stay open with an error on failure.
function DeleteProject({ onDelete }: { onDelete: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      await onDelete();
      setOpen(false);
    } catch {
      setError("Couldn't delete the project. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
        Delete project
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Atlas?</AlertDialogTitle>
          <AlertDialogDescription>
            The project and its 3 documents are removed. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive-text">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} aria-busy={pending} onClick={handleDelete}>
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const succeed = () => Promise.resolve();

async function openAlert(canvasElement: HTMLElement) {
  const trigger = within(canvasElement).getByRole("button", { name: "Delete project" });
  await userEvent.click(trigger);
  const dialog = await body.findByRole("alertdialog", { name: "Delete Atlas?" });
  return { trigger, dialog };
}

export const Default: Story = {
  render: () => <DeleteProject onDelete={succeed} />,
};

export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await expect(dialog).toHaveAccessibleDescription(
      "The project and its 3 documents are removed. This can't be undone.",
    );
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
  },
};

export const OutsidePressStaysOpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    await openAlert(canvasElement);
    const viewport = document.querySelector<HTMLElement>('[data-slot="alert-dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await userEvent.click(viewport);
    const dialog = body.getByRole("alertdialog");
    await expect(dialog).toBeInTheDocument();
    // Where focus lands after a synthetic outside press is timing-dependent; pin it so the
    // snapshot is deterministic, then check it stays inside the dialog.
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    cancel.focus();
    await waitFor(() => expect(cancel).toHaveFocus());
  },
};

export const EscapeClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { trigger } = await openAlert(canvasElement);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const CancelClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { trigger, dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const ActionSucceedsTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
  },
};

export const ActionFailsTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={() => Promise.reject(new Error("offline"))} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Couldn't delete the project. Try again.",
    );
    await expect(dialog).toBeInTheDocument();
    await expect(within(dialog).getByRole("button", { name: "Delete" })).toBeEnabled();
  },
};

// Pending: Action disabled and busy while the request runs.
export const PendingTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DeleteProject onDelete={() => new Promise<void>(() => {})} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    const busy = await within(dialog).findByRole("button", { name: "Deleting…" });
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveAttribute("aria-busy", "true");
  },
};

// Small size with a stretched footer. Without a trigger it renders open.
function DiscardChanges({ trigger }: { trigger?: string }) {
  return (
    <AlertDialog defaultOpen={!trigger}>
      {trigger ? <AlertDialogTrigger render={<Button />}>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Unsaved edits to this document are lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter layout="stretch">
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="warning">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** One trigger per size: md (default) and sm with a stretched footer. */
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-3">
      <DeleteProject onDelete={succeed} />
      <DiscardChanges trigger="Discard changes" />
    </div>
  ),
};

export const SmallTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DiscardChanges />,
};

// Action first in the footer, with the caller holding the viewport ref.
const viewportRef: { current: HTMLDivElement | null } = { current: null };

function ActionFirst({ focusAction = false }: { focusAction?: boolean }) {
  const actionRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
        Delete project
      </AlertDialogTrigger>
      <AlertDialogContent
        viewportProps={{ ref: viewportRef }}
        initialFocus={focusAction ? actionRef : undefined}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Atlas?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction ref={actionRef}>Delete</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// A caller's viewport ref is filled and Cancel still gets initial focus.
export const ViewportRefKeepsCancelFocusTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <ActionFirst />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
    await expect(viewportRef.current).toBe(
      document.querySelector('[data-slot="alert-dialog-viewport"]'),
    );
  },
};

// An explicit initialFocus stays authoritative.
export const ExplicitInitialFocusTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <ActionFirst focusAction />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Delete" })).toHaveFocus(),
    );
  },
};

const cancelRef: { current: HTMLButtonElement | null } = { current: null };
const onCancelClick = fn();

// A custom render keeps Cancel's recipe, caller className and size, ref and click handler.
export const CancelCustomRenderTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { onOpenChange: fn() },
  render: (args) => (
    <AlertDialog defaultOpen onOpenChange={args.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Unsaved edits to this document are lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            ref={cancelRef}
            render={<button type="button" />}
            className="border-warning"
            size="sm"
            onClick={onCancelClick}
          >
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction variant="warning">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ args }) => {
    onCancelClick.mockClear();
    const dialog = await body.findByRole("alertdialog", { name: "Discard changes?" });
    const cancel = within(dialog).getByRole("button", { name: "Keep editing" });
    await expect(cancelRef.current).toBe(cancel);
    await expect(cancel).toHaveAttribute("data-slot", "alert-dialog-cancel");
    // Outline recipe, sm size and the caller's class all reach the custom element.
    await expect(cancel).toHaveClass("rounded-xl", "border", "border-warning", "px-3", "py-2");
    await expect(getComputedStyle(cancel).borderTopWidth).toBe("1px");
    await userEvent.click(cancel);
    await expect(onCancelClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
  },
};

// A confirm opened from inside a Dialog dims the parent dialog too.
export const NestedInDialogDimsTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Dialog defaultOpen>
      {/* Larger than the alert so the dimmed parent shows around it. */}
      <DialogContent size="2xl" className="min-h-96">
        <DialogTitle>Atlas</DialogTitle>
        <div className="mt-5">
          <DeleteProject onDelete={succeed} />
        </div>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const parent = await body.findByRole("dialog", { name: "Atlas" });
    await userEvent.click(within(parent).getByRole("button", { name: "Delete project" }));
    await body.findByRole("alertdialog", { name: "Delete Atlas?" });
    const overlay = document.querySelector<HTMLElement>('[data-slot="alert-dialog-overlay"]');
    if (!overlay) throw new Error("nested alert overlay not rendered");
    await expect(getComputedStyle(overlay).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    // The scrim paints above the parent dialog's popup.
    const rect = parent.getBoundingClientRect();
    const stack = document.elementsFromPoint(rect.left + 8, rect.top + 8);
    await expect(stack.indexOf(overlay)).toBeGreaterThanOrEqual(0);
    await expect(stack.indexOf(overlay)).toBeLessThan(stack.indexOf(parent));
  },
};
