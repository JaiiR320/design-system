import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis } from "lucide-react";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#components/popover";

// Plain stand-ins for DeckDiff buttons and inputs (those are separate modules).
const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const outlineButton = `rounded-lg border border-border px-3 py-1.5 text-sm text-secondary-foreground transition hover:border-border-strong hover:bg-surface ${ring}`;
const primaryButton = `rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover ${ring}`;
const ghostIconButton = `inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-foreground ${ring}`;
const textInput =
  "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-faint-foreground focus:border-ring";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

function BasicPopover() {
  return (
    <Popover>
      <PopoverTrigger className={`ml-48 ${outlineButton}`}>Details</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Snapshot</PopoverTitle>
          <PopoverDescription>Saved before the last import.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export const Default: Story = {
  render: () => <BasicPopover />,
};

export const Open: Story = {
  render: () => <BasicPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Details" });
    await userEvent.click(trigger);
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: "Snapshot" });
    await expect(dialog).toHaveAccessibleDescription("Saved before the last import.");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const EscapeReturnsFocus: Story = {
  render: () => <BasicPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Details" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(document.body);
    await body.findByRole("dialog", { name: "Snapshot" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const OutsidePressCloses: Story = {
  render: () => <BasicPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    const body = within(document.body);
    await body.findByRole("dialog", { name: "Snapshot" });
    await userEvent.click(document.body);
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

export const Sides: Story = {
  render: () => (
    <div className="grid w-[720px] grid-cols-2 place-items-center gap-y-40 py-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side} defaultOpen>
          <PopoverTrigger className={outlineButton}>{side}</PopoverTrigger>
          <PopoverContent side={side} align="center" className="w-40">
            <PopoverTitle>Side {side}</PopoverTitle>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

// CategoryStack's rename: Field + Input + Cancel/Save in the same place as the old menu page.
function RenameCategory({ onRename }: { onRename: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("Ramp");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ml-56 flex w-40 items-center justify-between border-b border-border px-3 py-2">
      <span className="text-sm font-semibold tracking-label text-strong-foreground uppercase">
        Ramp
      </span>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft("Ramp");
        }}
      >
        <PopoverTrigger aria-label="Ramp actions" className={ghostIconButton}>
          <Ellipsis className="size-4" strokeWidth={1.75} />
        </PopoverTrigger>
        <PopoverContent initialFocus={inputRef} aria-label="Rename category">
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              onRename(draft);
              setOpen(false);
            }}
          >
            <label
              htmlFor="rename-ramp"
              className="block text-xs font-medium text-muted-foreground"
            >
              Rename category
            </label>
            <input
              ref={inputRef}
              id="rename-ramp"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={(event) => event.target.select()}
              className={textInput}
            />
            <div className="flex gap-2">
              <PopoverClose className={`flex-1 ${outlineButton}`}>Cancel</PopoverClose>
              <button type="submit" className={`flex-1 ${primaryButton}`}>
                Save
              </button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const RenameOpen: Story = {
  render: () => <RenameCategory onRename={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ramp actions" }));
    const body = within(document.body);
    const input = await body.findByLabelText("Rename category", { selector: "input" });
    await waitFor(() => expect(input).toHaveFocus());
  },
};

export const RenameTyping: Story = {
  render: () => <RenameCategory onRename={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Ramp actions" }));
    const body = within(document.body);
    const input = await body.findByLabelText("Rename category", { selector: "input" });
    await waitFor(() => expect(input).toHaveFocus());
    // Ordinary letters reach the input: no menu typeahead swallows them.
    await userEvent.keyboard("Mana rocks");
    await expect(input).toHaveValue("Mana rocks");
  },
};

const onRename = fn();

export const RenameSave: Story = {
  render: () => <RenameCategory onRename={onRename} />,
  play: async ({ canvasElement }) => {
    onRename.mockClear();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Ramp actions" });
    await userEvent.click(trigger);
    const body = within(document.body);
    const input = await body.findByLabelText("Rename category", { selector: "input" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("Lands{Enter}");
    await expect(onRename).toHaveBeenCalledWith("Lands");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

const results = [
  "Thrasios, Triton Hero",
  "Tymna the Weaver",
  "Thassa's Oracle",
  "Tymna",
  "Toxrill",
];

// EditorHeader search: programmatic popover anchored to the input wrapper, focus stays in the input.
function SearchResults() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="w-[540px]">
      <div ref={anchorRef}>
        <input
          aria-label="Add card"
          placeholder="Add card"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.length > 0);
          }}
          className={`${textInput} px-4 py-3 text-base`}
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
          aria-label="Search results"
          className="w-(--anchor-width) overflow-hidden p-0 shadow-black/40"
        >
          <section aria-label="Results" className="flex gap-3 overflow-x-auto p-4">
            {results.map((name) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                className={`aspect-[488/680] w-28 shrink-0 rounded-lg border border-border bg-gradient-to-b from-surface to-secondary ${ring}`}
              />
            ))}
          </section>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const SearchOpen: Story = {
  parameters: { layout: "padded" },
  render: () => <SearchResults />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Add card" });
    await userEvent.click(input);
    await userEvent.keyboard("Th");
    const body = within(document.body);
    const results = await body.findByRole("region", { name: "Results" });
    // Typing continues uninterrupted: the popup never takes focus.
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("Th");
    await userEvent.click(input);
    await expect(results).toBeVisible();
    // Keyboard focus can reach the results.
    await userEvent.tab();
    await expect(body.getByRole("button", { name: "Thrasios, Triton Hero" })).toHaveFocus();
    // Let the input's blur repaint settle before the snapshot.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  },
};
