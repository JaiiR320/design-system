import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";

import { Input } from "#components/input";
import { Popover, PopoverContent } from "#components/popover";
import { focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// The Input owns focus while a controlled, nonmodal Popover anchored to it shows a
// horizontally scrolling row of result tiles. Dragging a tile onto a folder keeps the tiles
// mounted (the drag source must survive) but hides the popup so the folders are visible.

type Doc = { name: string; kind: string; fill: string };

// Flat fills stand in for thumbnails: deterministic, no network.
const docs: Doc[] = [
  { name: "Quarterly report", kind: "Report", fill: "#1d4ed8" },
  { name: "Design review", kind: "Slides", fill: "#57534e" },
  { name: "Launch plan", kind: "Doc", fill: "#0369a1" },
  { name: "Release notes", kind: "Doc", fill: "#3f3f46" },
  { name: "Research summary", kind: "Report", fill: "#1e3a8a" },
  { name: "Retro notes", kind: "Doc", fill: "#44403c" },
  { name: "Roadmap", kind: "Sheet", fill: "#450a0a" },
  { name: "Recruiting plan", kind: "Sheet", fill: "#292524" },
  { name: "Press kit", kind: "Folder", fill: "#312e81" },
];

const folders = ["Reports", "Designs", "Plans", "Notes"];

type SearchPopoverProps = { onAdd: (name: string, folder: string) => void };

function ResultTile({
  doc,
  onAdd,
  onDragChange,
}: {
  doc: Doc;
  onAdd: () => void;
  onDragChange: (dragging: boolean) => void;
}) {
  return (
    <button
      type="button"
      draggable
      aria-label={`Add ${doc.name}`}
      onClick={onAdd}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", doc.name);
        onDragChange(true);
      }}
      onDragEnd={() => onDragChange(false)}
      className={cn(
        "flex h-28 w-36 shrink-0 flex-col justify-between rounded-lg border border-border p-2 text-left transition hover:border-border-strong",
        focusRing,
      )}
      style={{ backgroundColor: doc.fill }}
    >
      <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] leading-tight text-white">
        {doc.name}
      </span>
      <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white/80">
        {doc.kind}
      </span>
    </button>
  );
}

function SearchPopover({ onAdd }: SearchPopoverProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overFolder, setOverFolder] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const results = term ? docs.filter((doc) => doc.name.toLowerCase().includes(term)) : [];

  const add = (name: string, folder: string) => {
    onAdd(name, folder);
    // Closing unmounts the drag source, so its dragend never arrives: end the drag here.
    setDragging(null);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-[900px] space-y-4">
      <div ref={anchorRef} className="w-[540px]">
        <Input
          ref={inputRef}
          aria-label="Add document"
          placeholder="Add document"
          autoComplete="off"
          value={query}
          // Focus never enters the popup, so its own Escape handling can't see the key.
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) setOpen(false);
          }}
          onValueChange={(value) => {
            setQuery(value);
            setOpen(value.trim().length > 0);
          }}
        />
      </div>
      <Popover
        open={open}
        onOpenChange={(next, details) => {
          // Pressing the anchored input is not "outside" for this popover.
          const target = details.event.target;
          if (target instanceof Node && anchorRef.current?.contains(target)) return;
          setOpen(next);
        }}
      >
        <PopoverContent
          anchor={anchorRef}
          align="start"
          initialFocus={false}
          finalFocus={false}
          aria-label="Search results"
          data-dragging={dragging ? "" : undefined}
          className="w-(--anchor-width) overflow-hidden p-0 data-dragging:pointer-events-none data-dragging:opacity-0"
        >
          {results.length > 0 ? (
            <section aria-label="Results" className="flex gap-3 overflow-x-auto p-4">
              {results.map((doc) => (
                <ResultTile
                  key={doc.name}
                  doc={doc}
                  onAdd={() => add(doc.name, "Unsorted")}
                  onDragChange={(next) => setDragging(next ? doc.name : null)}
                />
              ))}
            </section>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No documents match "{query.trim()}".
            </p>
          )}
        </PopoverContent>
      </Popover>
      <div className="grid grid-cols-4 gap-4">
        {folders.map((folder) => (
          <section
            key={folder}
            aria-label={`${folder} folder`}
            data-drop-target={dragging ? "" : undefined}
            data-over={overFolder === folder ? "" : undefined}
            onDragOver={(event) => {
              event.preventDefault();
              setOverFolder(folder);
            }}
            onDragLeave={() => setOverFolder(null)}
            onDrop={(event) => {
              event.preventDefault();
              setOverFolder(null);
              if (dragging) add(dragging, folder);
            }}
            className="h-56 rounded-xl border border-border bg-background p-3 data-drop-target:border-dashed data-drop-target:border-border-strong data-over:border-ring data-over:bg-info-surface/20"
          >
            <h3 className="text-sm font-semibold tracking-label text-strong-foreground uppercase">
              {folder}
            </h3>
            <p className="mt-16 text-center text-sm text-muted-foreground">Empty folder</p>
          </section>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Recipes/SearchPopover",
  component: SearchPopover,
  parameters: { layout: "padded" },
  args: { onAdd: fn() },
} satisfies Meta<typeof SearchPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: "Add document" })).toHaveValue(
      "",
    );
    await expect(body.queryByRole("dialog")).toBeNull();
  },
};

export const ResultsOpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add document" });
    await userEvent.click(input);
    await userEvent.keyboard("re");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    const results = within(popup).getByRole("region", { name: "Results" });
    // No focus theft: the popup opened without taking focus, typing continues.
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("re");
    await expect(within(results).getAllByRole("button")).toHaveLength(7);
    // The row overflows horizontally inside the input-width popup.
    await expect(results.scrollWidth).toBeGreaterThan(results.clientWidth);
    // Pressing the input again is not an outside press.
    await userEvent.click(input);
    await expect(popup).toBeVisible();
  },
};

export const NarrowsWhileTypingTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add document" });
    await userEvent.click(input);
    await userEvent.keyboard("Launch");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    await expect(input).toHaveFocus();
    await expect(within(popup).getAllByRole("button")).toHaveLength(1);
    await expect(within(popup).getByRole("button", { name: "Add Launch plan" })).toBeVisible();
  },
};

export const EscapeKeepsFocusTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add document" });
    await userEvent.click(input);
    await userEvent.keyboard("re");
    await body.findByRole("dialog", { name: "Search results" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("re");
  },
};

export const ClickResultAddsTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add document" });
    await userEvent.click(input);
    await userEvent.keyboard("Desi");
    await userEvent.click(await body.findByRole("button", { name: "Add Design review" }));
    await expect(args.onAdd).toHaveBeenCalledWith("Design review", "Unsorted");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
  },
};

export const DragHidesPopupTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Add document" });
    await userEvent.click(input);
    await userEvent.keyboard("re");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    const tile = within(popup).getByRole("button", { name: "Add Quarterly report" });

    // Simulated HTML5 drag: start on a tile, hover the Designs folder.
    fireEvent.dragStart(tile, { dataTransfer: new DataTransfer() });
    const designs = canvas.getByRole("region", { name: "Designs folder" });
    fireEvent.dragOver(designs);
    await waitFor(() => expect(popup).toHaveAttribute("data-dragging"));
    // Presentation hidden, but the popup and every tile stay mounted and open.
    await expect(getComputedStyle(popup).opacity).toBe("0");
    await expect(getComputedStyle(popup).pointerEvents).toBe("none");
    await expect(tile.isConnected).toBe(true);
    await expect(within(popup).getAllByRole("button")).toHaveLength(7);
    await expect(designs).toHaveAttribute("data-over");
    await expect(canvas.getByRole("region", { name: "Reports folder" })).toHaveAttribute(
      "data-drop-target",
    );
    await expect(args.onAdd).not.toHaveBeenCalled();
  },
};

export const DropAddsToFolderTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Add document" });
    await userEvent.click(input);
    await userEvent.keyboard("re");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    const tile = within(popup).getByRole("button", { name: "Add Release notes" });
    const notes = canvas.getByRole("region", { name: "Notes folder" });
    fireEvent.dragStart(tile, { dataTransfer: new DataTransfer() });
    fireEvent.dragOver(notes);
    // A real drop comes after React has rendered the drag; without the wait, onDrop reads stale state.
    await waitFor(() => expect(notes).toHaveAttribute("data-drop-target"));
    fireEvent.drop(notes);
    fireEvent.dragEnd(tile);
    await expect(args.onAdd).toHaveBeenCalledWith("Release notes", "Notes");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(notes).not.toHaveAttribute("data-drop-target");
    await expect(input).toHaveFocus();
  },
};
