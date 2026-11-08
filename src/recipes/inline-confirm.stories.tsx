import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Alert, AlertActions, AlertDescription } from "#components/alert";
import { Badge } from "#components/badge";
import { Button } from "#components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#components/item";
import { Separator } from "#components/separator";
import { Toggle } from "#components/toggle";

// Version history: Restore (or Delete) expands a confirm Alert inside the row instead of opening
// a dialog. Focus moves to the safe Cancel; Cancel collapses the row and returns focus to the
// button that opened it. Compare mode turns each row into one Toggle with no nested controls.

type Version = { id: string; label: string; savedAt: string };
type Pending = { id: string; kind: "restore" | "delete" } | null;

const versions: Version[] = [
  { id: "v2", label: "Tighten launch timeline", savedAt: "Nov 7, 2026, 01:00 AM" },
  { id: "v1", label: "First draft", savedAt: "Nov 7, 2026, 12:59 AM" },
];

type HistoryProps = {
  onRestore: (id: string) => void;
  onSaveVersion: () => void;
  onDelete: (id: string) => void;
};

function ConfirmAlert({
  kind,
  label,
  onCancel,
  onSaveVersion,
  onConfirm,
}: {
  kind: "restore" | "delete";
  label: string;
  onCancel: () => void;
  onSaveVersion: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);
  const restore = kind === "restore";

  return (
    <Alert
      role="alert"
      tone={restore ? "warning" : "destructive"}
      className="basis-full"
      aria-label={restore ? `Confirm restore ${label}` : `Confirm delete ${label}`}
    >
      <AlertDescription>
        {restore
          ? "Restoring this version will overwrite the current document."
          : `Deleting "${label}" cannot be undone.`}
      </AlertDescription>
      <AlertActions>
        <Button ref={cancelRef} size="xs" onClick={onCancel}>
          Cancel
        </Button>
        {restore ? (
          <>
            <Button size="xs" variant="default" onClick={onSaveVersion}>
              Save current
            </Button>
            <Button size="xs" variant="warning" onClick={onConfirm}>
              Restore
            </Button>
          </>
        ) : (
          <Button size="xs" variant="destructive" onClick={onConfirm}>
            Delete version
          </Button>
        )}
      </AlertActions>
    </Alert>
  );
}

function HistoryRow({
  version,
  pending,
  setPending,
  ...handlers
}: HistoryProps & {
  version: Version;
  pending: Pending;
  setPending: (next: Pending) => void;
}) {
  const restoreRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const kind = pending?.id === version.id ? pending.kind : null;

  const close = (restoreFocus: boolean) => {
    const target = kind === "delete" ? deleteRef : restoreRef;
    setPending(null);
    if (restoreFocus) target.current?.focus();
  };

  return (
    <Item className="flex-wrap">
      <ItemContent>
        <ItemTitle>{version.label}</ItemTitle>
        <ItemDescription className="mt-0.5">{version.savedAt}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          ref={deleteRef}
          size="icon-sm"
          variant="destructive-ghost"
          aria-label={`Delete ${version.label}`}
          aria-expanded={kind === "delete"}
          onClick={() => setPending({ id: version.id, kind: "delete" })}
        >
          <Trash2 strokeWidth={1.75} />
        </Button>
        <Button
          ref={restoreRef}
          aria-label={`Restore ${version.label}`}
          aria-expanded={kind === "restore"}
          onClick={() => setPending({ id: version.id, kind: "restore" })}
        >
          Restore
        </Button>
      </ItemActions>
      {kind && (
        <ConfirmAlert
          kind={kind}
          label={version.label}
          onCancel={() => close(true)}
          onSaveVersion={handlers.onSaveVersion}
          onConfirm={() => {
            if (kind === "restore") handlers.onRestore(version.id);
            else handlers.onDelete(version.id);
            close(true);
          }}
        />
      )}
    </Item>
  );
}

function VersionHistory(props: HistoryProps) {
  const [pending, setPending] = useState<Pending>(null);
  const [comparing, setComparing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <section aria-label="Version history" className="w-[880px] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Version history</h2>
          <p className="mt-1 text-sm text-muted-foreground">Launch plan, 2 versions</p>
        </div>
        <div className="flex gap-2">
          <Button
            aria-pressed={comparing}
            onClick={() => {
              setComparing(!comparing);
              setPending(null);
              setSelected([]);
            }}
          >
            {comparing ? "Exit compare" : "Compare"}
          </Button>
          {comparing && (
            <Button variant="default" disabled={selected.length !== 2}>
              Compare selected
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Separator className="flex-1" />1 autosave collapsed
        <Separator className="flex-1" />
      </div>
      {comparing ? (
        <ItemGroup role="group" aria-label="Versions to compare">
          {versions.map((version) => {
            const order = selected.indexOf(version.id) + 1;
            return (
              <Item
                key={version.id}
                render={
                  <Toggle
                    pressed={order > 0}
                    onPressedChange={(pressed) =>
                      setSelected((current) =>
                        pressed
                          ? [...current, version.id]
                          : current.filter((id) => id !== version.id),
                      )
                    }
                  />
                }
              >
                <div className="flex items-center gap-3">
                  <ItemMedia>
                    <Badge
                      variant={null}
                      className={stepLook}
                      data-selected={order > 0 ? "" : undefined}
                    >
                      {order > 0 ? order : ""}
                    </Badge>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{version.label}</ItemTitle>
                    <ItemDescription className="mt-0.5">{version.savedAt}</ItemDescription>
                  </ItemContent>
                </div>
              </Item>
            );
          })}
        </ItemGroup>
      ) : (
        <ItemGroup>
          {versions.map((version) => (
            <HistoryRow
              key={version.id}
              version={version}
              pending={pending}
              setPending={setPending}
              {...props}
            />
          ))}
        </ItemGroup>
      )}
    </section>
  );
}

const meta = {
  title: "Recipes/InlineConfirm",
  component: VersionHistory,
  parameters: { layout: "padded" },
  args: { onRestore: fn(), onSaveVersion: fn(), onDelete: fn() },
} satisfies Meta<typeof VersionHistory>;

// App-owned look layered on Badge with variant={null}: a numbered step marker.
const stepLook =
  "flex size-6 items-center justify-center rounded-full bg-secondary p-0 text-xs font-semibold text-muted-foreground data-selected:bg-primary data-selected:text-primary-foreground";

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RestoreConfirmTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restore = canvas.getByRole("button", { name: "Restore Tighten launch timeline" });
    await expect(restore).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(restore);
    const alert = canvas.getByRole("alert", { name: "Confirm restore Tighten launch timeline" });
    await expect(alert).toHaveTextContent("overwrite the current document");
    await expect(restore).toHaveAttribute("aria-expanded", "true");
    // The safe choice takes focus; the three actions follow in tab order.
    const scoped = within(alert);
    await expect(scoped.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    await expect(scoped.getByRole("button", { name: "Save current" })).toHaveFocus();
    await userEvent.tab();
    await expect(scoped.getByRole("button", { name: "Restore" })).toHaveFocus();
    // Only one row confirms at a time.
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
  },
};

export const CancelReturnsFocusTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restore = canvas.getByRole("button", { name: "Restore First draft" });
    restore.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(restore).toHaveFocus();
    await expect(restore).toHaveAttribute("aria-expanded", "false");
  },
};

export const RestoreTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const restore = canvas.getByRole("button", { name: "Restore Tighten launch timeline" });
    await userEvent.click(restore);
    const alert = within(canvas.getByRole("alert"));
    await userEvent.click(alert.getByRole("button", { name: "Save current" }));
    await expect(args.onSaveVersion).toHaveBeenCalledOnce();
    await userEvent.click(alert.getByRole("button", { name: "Restore" }));
    await expect(args.onRestore).toHaveBeenCalledWith("v2");
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(restore).toHaveFocus();
  },
};

export const DeleteConfirmTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Restore Tighten launch timeline" }));
    // Opening another row's confirm replaces the first.
    const remove = canvas.getByRole("button", { name: "Delete First draft" });
    await userEvent.click(remove);
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    const alert = canvas.getByRole("alert", { name: "Confirm delete First draft" });
    await expect(within(alert).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await expect(args.onDelete).not.toHaveBeenCalled();
  },
};

export const SelectionModeTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Restore First draft" }));
    await userEvent.click(canvas.getByRole("button", { name: "Compare" }));
    // Entering compare mode drops any open confirm.
    await expect(canvas.queryByRole("alert")).toBeNull();
    const group = canvas.getByRole("group", { name: "Versions to compare" });
    const rows = within(group).getAllByRole("button");
    await expect(rows).toHaveLength(2);
    for (const row of rows) {
      await expect(row).toHaveAttribute("aria-pressed", "false");
      // Each row is the only control: no Restore/Delete buttons nested inside.
      await expect(row.querySelector("button, a, input, [tabindex]")).toBeNull();
    }
    const compare = canvas.getByRole("button", { name: "Compare selected" });
    await expect(compare).toBeDisabled();
    await userEvent.click(rows[1]);
    await userEvent.click(rows[0]);
    await expect(rows[0]).toHaveAttribute("aria-pressed", "true");
    await expect(rows[0]).toHaveTextContent("2");
    await expect(rows[1]).toHaveTextContent("1");
    await expect(compare).toBeEnabled();
  },
};
