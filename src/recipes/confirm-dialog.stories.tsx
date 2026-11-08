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
function DeleteDeckConfirm({ onConfirm }: ConfirmProps) {
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
      setError("Couldn't delete the deck. Check your connection and try again.");
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
          Delete deck
        </AlertDialogTrigger>
        {/* Base UI skips nested backdrops by default; forceRender dims a parent dialog too. */}
        <AlertDialogContent overlayProps={{ forceRender: true }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Atraxa Superfriends?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the deck and all 3 snapshots. This can't be undone.
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
          Atraxa Superfriends deleted.
        </p>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Recipes/ConfirmDialog",
  component: DeleteDeckConfirm,
  args: { onConfirm: fn(() => Promise.resolve()) },
} satisfies Meta<typeof DeleteDeckConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

async function openConfirm(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete deck" }));
  return body.findByRole("alertdialog", { name: "Delete Atraxa Superfriends?" });
}

/** Closed. Escape dismisses the open confirm and returns focus to the trigger. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Delete deck" });
    await openConfirm(canvasElement);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onConfirm).not.toHaveBeenCalled();
    trigger.blur();
  },
};

/** Title and description label the dialog; the safe Cancel gets focus first. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openConfirm(canvasElement);
    await expect(dialog).toHaveAccessibleDescription(
      "This will delete the deck and all 3 snapshots. This can't be undone.",
    );
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
    await expect(within(dialog).getByRole("button", { name: "Delete" })).toBeEnabled();
  },
};

/** While the request runs, both actions are disabled and Escape cannot dismiss the dialog. */
export const Pending: Story = {
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
export const Failed: Story = {
  args: { onConfirm: fn(() => Promise.reject(new Error("offline"))) },
  play: async ({ canvasElement, args }) => {
    const dialog = within(await openConfirm(canvasElement));
    await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
    await expect(await dialog.findByRole("alert")).toHaveTextContent("Couldn't delete the deck");
    await expect(dialog.getByRole("button", { name: "Try again" })).toBeEnabled();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

/** Success closes the dialog, returns focus to the trigger and reports the result. */
export const Confirmed: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dialog = within(await openConfirm(canvasElement));
    await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("status")).toHaveTextContent("Atraxa Superfriends deleted.");
    const trigger = canvas.getByRole("button", { name: "Delete deck" });
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.blur();
  },
};

/** The confirm opened from a deck actions dialog stacks above it; Escape closes only the top. */
export const FromDeckActions: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button />}>Deck actions</DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Atraxa Superfriends</DialogTitle>
        </DialogHeader>
        <DialogBody className="mt-5">
          <ItemGroup>
            <Item>
              <ItemContent>
                <ItemTitle>Export deck list</ItemTitle>
                <ItemDescription className="text-xs">Copy as text or download.</ItemDescription>
              </ItemContent>
            </Item>
            <Item variant="muted">
              <ItemContent>
                <ItemTitle>Danger zone</ItemTitle>
                <ItemDescription className="text-xs">
                  Remove the deck and its history.
                </ItemDescription>
              </ItemContent>
              <DeleteDeckConfirm onConfirm={args.onConfirm} />
            </Item>
          </ItemGroup>
        </DialogBody>
        <DialogFooter layout="stretch">
          <DialogClose render={<Button />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Deck actions" }));
    const actions = await body.findByRole("dialog", { name: "Atraxa Superfriends" });
    const deleteDeck = within(actions).getByRole("button", { name: "Delete deck" });
    await userEvent.click(deleteDeck);
    const confirm = await body.findByRole("alertdialog");
    // One z layer; the later portal paints above: the confirm follows the dialog, outside it.
    await expect(actions).not.toContainElement(confirm);
    await expect(
      actions.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(actions).toBeVisible();
    await expect(deleteDeck).toHaveFocus();

    // Reopen for the capture: confirm stacked over the actions dialog.
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        within(body.getByRole("alertdialog")).getByRole("button", { name: "Cancel" }),
      ).toHaveFocus(),
    );
  },
};
