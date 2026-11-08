import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Alert } from "#components/alert";
import { Button } from "#components/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#components/dialog";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "#components/item";

type ConfirmProps = { onConfirm: () => Promise<void> };

/**
 * Plain composition, no promise-based confirm service: the caller owns open, pending and error
 * state, closes on success and stays open with an error on failure.
 */
function DeleteDocumentConfirm({ onConfirm }: ConfirmProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
      setDeleted(true);
    } catch {
      setError("Couldn't delete the document. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          // Keep the dialog up while the request is in flight.
          if (pending) return;
          setOpen(next);
          if (next) setError(null);
        }}
      >
        <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
          <Trash2 strokeWidth={1.75} />
          Delete document
        </AlertDialogTrigger>
        {/* Base UI skips nested backdrops by default; forceRender dims a parent dialog too. */}
        <AlertDialogContent overlayProps={{ forceRender: true }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Launch plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the document and all 3 versions. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <Alert role="alert" tone="destructive" size="sm" className="mt-4">
              {error}
            </Alert>
          ) : null}
          <AlertDialogFooter layout="stretch">
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={pending} aria-busy={pending} onClick={handleDelete}>
              {pending ? "Deleting…" : error ? "Try again" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {deleted ? (
        <p role="status" className="text-sm text-muted-foreground">
          Launch plan deleted.
        </p>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Recipes/ConfirmDialog",
  component: DeleteDocumentConfirm,
  args: { onConfirm: fn(() => Promise.resolve()) },
} satisfies Meta<typeof DeleteDocumentConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

async function openConfirm(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete document" }));
  return body.findByRole("alertdialog", { name: "Delete Launch plan?" });
}

export const Default: Story = {};

/** Escape dismisses the open confirm and returns focus to the trigger. */
export const EscapeClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Delete document" });
    await openConfirm(canvasElement);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onConfirm).not.toHaveBeenCalled();
    trigger.blur();
  },
};
/** Title and description label the dialog; the safe Cancel gets focus first. */
export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const dialog = await openConfirm(canvasElement);
    await expect(dialog).toHaveAccessibleDescription(
      "This will delete the document and all 3 versions. This can't be undone.",
    );
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
    await expect(within(dialog).getByRole("button", { name: "Delete" })).toBeEnabled();
  },
};

/** While the request runs, both actions are disabled and Escape cannot dismiss the dialog. */
export const PendingTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { onConfirm: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const dialog = within(await openConfirm(canvasElement));
    await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
    const action = await dialog.findByRole("button", { name: "Deleting…" });
    await expect(action).toBeDisabled();
    await expect(action).toHaveAttribute("aria-busy", "true");
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(body.getByRole("alertdialog")).toBeVisible();
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

/** A failed request keeps the dialog open with an announced error and a retry. */
export const FailedTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { onConfirm: fn(() => Promise.reject(new Error("offline"))) },
  play: async ({ canvasElement, args }) => {
    const dialog = within(await openConfirm(canvasElement));
    await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
    await expect(await dialog.findByRole("alert")).toHaveTextContent(
      "Couldn't delete the document",
    );
    await expect(dialog.getByRole("button", { name: "Try again" })).toBeEnabled();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

/** Success closes the dialog, returns focus to the trigger and reports the result. */
export const ConfirmedTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dialog = within(await openConfirm(canvasElement));
    await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent("Launch plan deleted.");
    const trigger = canvas.getByRole("button", { name: "Delete document" });
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.blur();
  },
};

/** Closed: a document details dialog whose danger zone hosts the same confirm. */
export const NestedInDialog: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button />}>Document details</DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Launch plan</DialogTitle>
        </DialogHeader>
        <DialogBody className="mt-5">
          <ItemGroup>
            <Item>
              <ItemContent>
                <ItemTitle>Export</ItemTitle>
                <ItemDescription className="text-xs">Download as PDF or Markdown.</ItemDescription>
              </ItemContent>
            </Item>
            <Item variant="muted">
              <ItemContent>
                <ItemTitle>Danger zone</ItemTitle>
                <ItemDescription className="text-xs">
                  Remove the document and its history.
                </ItemDescription>
              </ItemContent>
              <DeleteDocumentConfirm onConfirm={args.onConfirm} />
            </Item>
          </ItemGroup>
        </DialogBody>
        <DialogFooter layout="stretch">
          <DialogClose render={<Button />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** The confirm opened from the details dialog stacks above it; Escape closes only the top. */
export const NestedInDialogTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: NestedInDialog.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Document details" }));
    const details = await body.findByRole("dialog", { name: "Launch plan" });
    const deleteDocument = within(details).getByRole("button", { name: "Delete document" });
    await userEvent.click(deleteDocument);
    const confirm = await body.findByRole("alertdialog");
    // One z layer; the later portal paints above: the confirm follows the dialog, outside it.
    await expect(details).not.toContainElement(confirm);
    await expect(
      details.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(details).toBeVisible();
    await expect(deleteDocument).toHaveFocus();

    // Reopen for the capture: confirm stacked over the details dialog.
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        within(body.getByRole("alertdialog")).getByRole("button", { name: "Cancel" }),
      ).toHaveFocus(),
    );
  },
};
