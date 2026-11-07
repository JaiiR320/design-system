import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";

import { Input } from "#components/input";
import { Popover, PopoverContent } from "#components/popover";
import { focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

// EditorHeader "Add card": the Input owns focus while a controlled, nonmodal Popover anchored
// to it shows a horizontally scrolling row of card tiles. Dragging a tile onto a lane keeps
// the tiles mounted (the drag source must survive) but hides the popup so lanes are visible.

type Card = { name: string; type: string; art: string };

// CSS-gradient stand-ins for card art: deterministic, no network.
const cards: Card[] = [
  { name: "Thrasios, Triton Hero", type: "Legendary Creature", art: "#1d4ed8, #0e7490" },
  { name: "Tymna the Weaver", type: "Legendary Creature", art: "#f5f5f4, #57534e" },
  { name: "Thassa's Oracle", type: "Creature", art: "#0369a1, #082f49" },
  { name: "Thought Vessel", type: "Artifact", art: "#a1a1aa, #3f3f46" },
  { name: "Thrummingbird", type: "Creature", art: "#38bdf8, #1e3a8a" },
  { name: "Thran Dynamo", type: "Artifact", art: "#d6d3d1, #44403c" },
  { name: "Through the Breach", type: "Instant", art: "#dc2626, #450a0a" },
  { name: "Thespian's Stage", type: "Land", art: "#a8a29e, #292524" },
  { name: "Arcane Signet", type: "Artifact", art: "#c4b5fd, #312e81" },
];

const lanes = ["Ramp", "Commander", "Sideboard", "Lands"];

type AddCardSearchProps = { onAdd: (name: string, lane: string) => void };

function CardTile({
  card,
  onAdd,
  onDragChange,
}: {
  card: Card;
  onAdd: () => void;
  onDragChange: (dragging: boolean) => void;
}) {
  return (
    <button
      type="button"
      draggable
      aria-label={`Add ${card.name}`}
      onClick={onAdd}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.name);
        onDragChange(true);
      }}
      onDragEnd={() => onDragChange(false)}
      className={cn(
        "flex aspect-[488/680] w-32 shrink-0 flex-col justify-between rounded-lg border border-border p-2 text-left transition hover:border-border-strong",
        focusRing,
      )}
      style={{ backgroundImage: `linear-gradient(160deg, ${card.art})` }}
    >
      <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] leading-tight text-white">
        {card.name}
      </span>
      <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white/80">
        {card.type}
      </span>
    </button>
  );
}

function AddCardSearch({ onAdd }: AddCardSearchProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overLane, setOverLane] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const results = term ? cards.filter((card) => card.name.toLowerCase().includes(term)) : [];

  const add = (name: string, lane: string) => {
    onAdd(name, lane);
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
          aria-label="Add card"
          placeholder="Add card"
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
              {results.map((card) => (
                <CardTile
                  key={card.name}
                  card={card}
                  onAdd={() => add(card.name, "Mainboard")}
                  onDragChange={(next) => setDragging(next ? card.name : null)}
                />
              ))}
            </section>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No cards match "{query.trim()}".</p>
          )}
        </PopoverContent>
      </Popover>
      <div className="grid grid-cols-4 gap-4">
        {lanes.map((lane) => (
          <section
            key={lane}
            aria-label={`${lane} lane`}
            data-drop-target={dragging ? "" : undefined}
            data-over={overLane === lane ? "" : undefined}
            onDragOver={(event) => {
              event.preventDefault();
              setOverLane(lane);
            }}
            onDragLeave={() => setOverLane(null)}
            onDrop={(event) => {
              event.preventDefault();
              setOverLane(null);
              if (dragging) add(dragging, lane);
            }}
            className="h-56 rounded-xl border border-border bg-background p-3 data-drop-target:border-dashed data-drop-target:border-border-strong data-over:border-ring data-over:bg-info-surface/20"
          >
            <h3 className="text-sm font-semibold tracking-label text-strong-foreground uppercase">
              {lane}
            </h3>
            <p className="mt-16 text-center text-sm text-muted-foreground">Empty stack</p>
          </section>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Recipes/SearchResults",
  component: AddCardSearch,
  parameters: { layout: "padded" },
  args: { onAdd: fn() },
} satisfies Meta<typeof AddCardSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: "Add card" })).toHaveValue("");
    await expect(body.queryByRole("dialog")).toBeNull();
  },
};

export const ResultsOpen: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Th");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    const results = within(popup).getByRole("region", { name: "Results" });
    // No focus theft: the popup opened without taking focus, typing continues.
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("Th");
    await expect(within(results).getAllByRole("button")).toHaveLength(8);
    // The row overflows horizontally inside the input-width popup.
    await expect(results.scrollWidth).toBeGreaterThan(results.clientWidth);
    // Pressing the input again is not an outside press.
    await userEvent.click(input);
    await expect(popup).toBeVisible();
  },
};

export const NarrowsWhileTyping: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Thrasios");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    await expect(input).toHaveFocus();
    await expect(within(popup).getAllByRole("button")).toHaveLength(1);
    await expect(
      within(popup).getByRole("button", { name: "Add Thrasios, Triton Hero" }),
    ).toBeVisible();
  },
};

export const EscapeKeepsFocus: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Th");
    await body.findByRole("dialog", { name: "Search results" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("Th");
  },
};

export const ClickTileAdds: Story = {
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Tym");
    await userEvent.click(await body.findByRole("button", { name: "Add Tymna the Weaver" }));
    await expect(args.onAdd).toHaveBeenCalledWith("Tymna the Weaver", "Mainboard");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
  },
};

export const DragHidesPopup: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Th");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    const tile = within(popup).getByRole("button", { name: "Add Thrasios, Triton Hero" });

    // Simulated HTML5 drag: start on a tile, hover the Commander lane.
    fireEvent.dragStart(tile, { dataTransfer: new DataTransfer() });
    const commander = canvas.getByRole("region", { name: "Commander lane" });
    fireEvent.dragOver(commander);
    await waitFor(() => expect(popup).toHaveAttribute("data-dragging"));
    // Presentation hidden, but the popup and every tile stay mounted and open.
    await expect(getComputedStyle(popup).opacity).toBe("0");
    await expect(getComputedStyle(popup).pointerEvents).toBe("none");
    await expect(tile.isConnected).toBe(true);
    await expect(within(popup).getAllByRole("button")).toHaveLength(8);
    await expect(commander).toHaveAttribute("data-over");
    await expect(canvas.getByRole("region", { name: "Ramp lane" })).toHaveAttribute(
      "data-drop-target",
    );
    await expect(args.onAdd).not.toHaveBeenCalled();
  },
};

export const DropAddsToLane: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Th");
    const popup = await body.findByRole("dialog", { name: "Search results" });
    const tile = within(popup).getByRole("button", { name: "Add Thran Dynamo" });
    const ramp = canvas.getByRole("region", { name: "Ramp lane" });
    fireEvent.dragStart(tile, { dataTransfer: new DataTransfer() });
    fireEvent.dragOver(ramp);
    fireEvent.drop(ramp);
    fireEvent.dragEnd(tile);
    await expect(args.onAdd).toHaveBeenCalledWith("Thran Dynamo", "Ramp");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(ramp).not.toHaveAttribute("data-drop-target");
    await expect(input).toHaveFocus();
  },
};
