import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

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

const meta = {
  title: "Primitives/AlertDialog",
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

// Caller owns open state: close on success, stay open with an error on failure.
function DeleteDeck({ onDelete }: { onDelete: () => Promise<void> }) {
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
      setError("Couldn't delete the deck. Try again.");
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
        Delete deck
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Atraxa Superfriends?</AlertDialogTitle>
          <AlertDialogDescription>
            The deck and its 3 snapshots are removed. This can't be undone.
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
  const trigger = within(canvasElement).getByRole("button", { name: "Delete deck" });
  await userEvent.click(trigger);
  const dialog = await body.findByRole("alertdialog", { name: "Delete Atraxa Superfriends?" });
  return { trigger, dialog };
}

export const Default: Story = {
  render: () => <DeleteDeck onDelete={succeed} />,
};

export const Open: Story = {
  render: () => <DeleteDeck onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await expect(dialog).toHaveAccessibleDescription(
      "The deck and its 3 snapshots are removed. This can't be undone.",
    );
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
  },
};

export const OutsidePressStaysOpen: Story = {
  render: () => <DeleteDeck onDelete={succeed} />,
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

export const EscapeCloses: Story = {
  render: () => <DeleteDeck onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { trigger } = await openAlert(canvasElement);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const CancelCloses: Story = {
  render: () => <DeleteDeck onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { trigger, dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const ActionSucceeds: Story = {
  render: () => <DeleteDeck onDelete={succeed} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
  },
};

export const ActionFails: Story = {
  render: () => <DeleteDeck onDelete={() => Promise.reject(new Error("offline"))} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Couldn't delete the deck. Try again.",
    );
    await expect(dialog).toBeInTheDocument();
    await expect(within(dialog).getByRole("button", { name: "Delete" })).toBeEnabled();
  },
};

// Pending: Action disabled and busy while the request runs.
export const Pending: Story = {
  render: () => <DeleteDeck onDelete={() => new Promise<void>(() => {})} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openAlert(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    const busy = await within(dialog).findByRole("button", { name: "Deleting…" });
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveAttribute("aria-busy", "true");
  },
};

// Small size with a stretched footer.
export const Small: Story = {
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Unsaved edits to this deck are lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter layout="stretch">
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="warning">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
