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

// History tab: Load (or Delete) expands a confirm Alert inside the row instead of opening a
// dialog. Focus moves to the safe Cancel; Cancel collapses the row and returns focus to the
// button that opened it. Compare mode turns each row into one Toggle with no nested controls.

type Save = { id: string; label: string; savedAt: string };
type Pending = { id: string; kind: "load" | "delete" } | null;

const saves: Save[] = [
  { id: "s2", label: "Swap Karn for Birds", savedAt: "Nov 7, 2026, 01:00 AM" },
  { id: "s1", label: "Initial build", savedAt: "Nov 7, 2026, 12:59 AM" },
];

type HistoryProps = {
  onLoad: (id: string) => void;
  onSaveSnapshot: () => void;
  onDelete: (id: string) => void;
};

function ConfirmAlert({
  kind,
  label,
  onCancel,
  onSaveSnapshot,
  onConfirm,
}: {
  kind: "load" | "delete";
  label: string;
  onCancel: () => void;
  onSaveSnapshot: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);
  const load = kind === "load";

  return (
    <Alert
      role="alert"
      tone={load ? "warning" : "destructive"}
      className="basis-full"
      aria-label={load ? `Confirm load ${label}` : `Confirm delete ${label}`}
    >
      <AlertDescription>
        {load
          ? "Loading this snapshot will overwrite your current live deck."
          : `Deleting "${label}" cannot be undone.`}
      </AlertDescription>
      <AlertActions>
        <Button ref={cancelRef} size="xs" onClick={onCancel}>
          Cancel
        </Button>
        {load ? (
          <>
            <Button size="xs" variant="default" onClick={onSaveSnapshot}>
              Save Snapshot
            </Button>
            <Button size="xs" variant="warning" onClick={onConfirm}>
              Load Anyways
            </Button>
          </>
        ) : (
          <Button size="xs" variant="destructive" onClick={onConfirm}>
            Delete Snapshot
          </Button>
        )}
      </AlertActions>
    </Alert>
  );
}

function HistoryRow({
  save,
  pending,
  setPending,
  ...handlers
}: HistoryProps & {
  save: Save;
  pending: Pending;
  setPending: (next: Pending) => void;
}) {
  const loadRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const kind = pending?.id === save.id ? pending.kind : null;

  const close = (restoreFocus: boolean) => {
    const target = kind === "delete" ? deleteRef : loadRef;
    setPending(null);
    if (restoreFocus) target.current?.focus();
  };

  return (
    <Item className="flex-wrap">
      <ItemContent>
        <ItemTitle>{save.label}</ItemTitle>
        <ItemDescription className="mt-0.5">{save.savedAt}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          ref={deleteRef}
          size="icon-sm"
          variant="destructive-ghost"
          aria-label={`Delete ${save.label}`}
          aria-expanded={kind === "delete"}
          onClick={() => setPending({ id: save.id, kind: "delete" })}
        >
          <Trash2 strokeWidth={1.75} />
        </Button>
        <Button
          ref={loadRef}
          aria-label={`Load ${save.label}`}
          aria-expanded={kind === "load"}
          onClick={() => setPending({ id: save.id, kind: "load" })}
        >
          Load
        </Button>
      </ItemActions>
      {kind && (
        <ConfirmAlert
          kind={kind}
          label={save.label}
          onCancel={() => close(true)}
          onSaveSnapshot={handlers.onSaveSnapshot}
          onConfirm={() => {
            if (kind === "load") handlers.onLoad(save.id);
            else handlers.onDelete(save.id);
            close(true);
          }}
        />
      )}
    </Item>
  );
}

function SnapshotHistory(props: HistoryProps) {
  const [pending, setPending] = useState<Pending>(null);
  const [comparing, setComparing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <section aria-label="Snapshot history" className="w-[880px] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Snapshot History</h2>
          <p className="mt-1 text-sm text-muted-foreground">2 snapshots</p>
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
            {comparing ? "Exit Compare" : "Compare"}
          </Button>
          {comparing && (
            <Button variant="default" disabled={selected.length !== 2}>
              Compare Selected
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Separator className="flex-1" />1 unnamed save collapsed
        <Separator className="flex-1" />
      </div>
      {comparing ? (
        <ItemGroup role="group" aria-label="Snapshots to compare">
          {saves.map((save) => {
            const order = selected.indexOf(save.id) + 1;
            return (
              <Item
                key={save.id}
                render={
                  <Toggle
                    pressed={order > 0}
                    onPressedChange={(pressed) =>
                      setSelected((current) =>
                        pressed ? [...current, save.id] : current.filter((id) => id !== save.id),
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
                    <ItemTitle>{save.label}</ItemTitle>
                    <ItemDescription className="mt-0.5">{save.savedAt}</ItemDescription>
                  </ItemContent>
                </div>
              </Item>
            );
          })}
        </ItemGroup>
      ) : (
        <ItemGroup>
          {saves.map((save) => (
            <HistoryRow
              key={save.id}
              save={save}
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
  component: SnapshotHistory,
  parameters: { layout: "padded" },
  args: { onLoad: fn(), onSaveSnapshot: fn(), onDelete: fn() },
} satisfies Meta<typeof SnapshotHistory>;

// App-owned look layered on Badge with variant={null}: a numbered step marker.
const stepLook =
  "flex size-6 items-center justify-center rounded-full bg-secondary p-0 text-xs font-semibold text-muted-foreground data-selected:bg-primary data-selected:text-primary-foreground";

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoadConfirmRevealed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const load = canvas.getByRole("button", { name: "Load Swap Karn for Birds" });
    await expect(load).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(load);
    const alert = canvas.getByRole("alert", { name: "Confirm load Swap Karn for Birds" });
    await expect(alert).toHaveTextContent("overwrite your current live deck");
    await expect(load).toHaveAttribute("aria-expanded", "true");
    // The safe choice takes focus; the three actions follow in tab order.
    const scoped = within(alert);
    await expect(scoped.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    await expect(scoped.getByRole("button", { name: "Save Snapshot" })).toHaveFocus();
    await userEvent.tab();
    await expect(scoped.getByRole("button", { name: "Load Anyways" })).toHaveFocus();
    // Only one row confirms at a time.
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
  },
};

export const CancelRestoresLoad: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const load = canvas.getByRole("button", { name: "Load Initial build" });
    load.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(load).toHaveFocus();
    await expect(load).toHaveAttribute("aria-expanded", "false");
  },
};

export const LoadAnyways: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const load = canvas.getByRole("button", { name: "Load Swap Karn for Birds" });
    await userEvent.click(load);
    await userEvent.click(canvas.getByRole("button", { name: "Save Snapshot" }));
    await expect(args.onSaveSnapshot).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Load Anyways" }));
    await expect(args.onLoad).toHaveBeenCalledWith("s2");
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(load).toHaveFocus();
  },
};

export const DeleteConfirmRevealed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Load Swap Karn for Birds" }));
    // Opening another row's confirm replaces the first.
    const remove = canvas.getByRole("button", { name: "Delete Initial build" });
    await userEvent.click(remove);
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    const alert = canvas.getByRole("alert", { name: "Confirm delete Initial build" });
    await expect(within(alert).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await expect(args.onDelete).not.toHaveBeenCalled();
  },
};

export const SelectionMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Load Initial build" }));
    await userEvent.click(canvas.getByRole("button", { name: "Compare" }));
    // Entering compare mode drops any open confirm.
    await expect(canvas.queryByRole("alert")).toBeNull();
    const group = canvas.getByRole("group", { name: "Snapshots to compare" });
    const rows = within(group).getAllByRole("button");
    await expect(rows).toHaveLength(2);
    for (const row of rows) {
      await expect(row).toHaveAttribute("aria-pressed", "false");
      // Each row is the only control: no Load/Delete buttons nested inside.
      await expect(row.querySelector("button, a, input, [tabindex]")).toBeNull();
    }
    const compare = canvas.getByRole("button", { name: "Compare Selected" });
    await expect(compare).toBeDisabled();
    await userEvent.click(rows[1]);
    await userEvent.click(rows[0]);
    await expect(rows[0]).toHaveAttribute("aria-pressed", "true");
    await expect(rows[0]).toHaveTextContent("2");
    await expect(rows[1]).toHaveTextContent("1");
    await expect(compare).toBeEnabled();
  },
};
