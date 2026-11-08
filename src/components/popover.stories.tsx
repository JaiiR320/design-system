import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis } from "lucide-react";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Dialog, DialogContent, DialogTitle } from "#components/dialog";
import { Input } from "#components/input";
import { Label } from "#components/label";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#components/popover";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

function BasicPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button className="ml-48" />}>Details</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Quarterly report</PopoverTitle>
          <PopoverDescription>Last edited by Ada Park on March 4, 2026.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export const Default: Story = {
  render: () => <BasicPopover />,
};

export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <BasicPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Details" });
    await userEvent.click(trigger);
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: "Quarterly report" });
    await expect(dialog).toHaveAccessibleDescription("Last edited by Ada Park on March 4, 2026.");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const EscapeReturnsFocusTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <BasicPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Details" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(document.body);
    await body.findByRole("dialog", { name: "Quarterly report" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const OutsidePressClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <BasicPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    const body = within(document.body);
    await body.findByRole("dialog", { name: "Quarterly report" });
    await userEvent.click(document.body);
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

function SidesGrid({ open }: { open?: boolean }) {
  return (
    <div className="grid w-[720px] grid-cols-2 place-items-center gap-y-40 py-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side} defaultOpen={open}>
          <PopoverTrigger render={<Button />}>{side}</PopoverTrigger>
          <PopoverContent side={side} align="center" className="w-40">
            <PopoverTitle>Side {side}</PopoverTitle>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

/** One trigger per side. */
export const Sides: Story = {
  render: () => <SidesGrid />,
};

export const SidesTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SidesGrid open />,
};

// Inline rename: Label + Input + Cancel/Save anchored to the folder's actions button.
function RenameFolder({ onRename }: { onRename: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("Drafts");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ml-56 flex w-40 items-center justify-between border-b border-border px-3 py-2">
      <span className="text-sm font-semibold tracking-label text-strong-foreground uppercase">
        Drafts
      </span>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft("Drafts");
        }}
      >
        <PopoverTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="Drafts actions" />}
        >
          <Ellipsis className="size-4" strokeWidth={1.75} />
        </PopoverTrigger>
        <PopoverContent initialFocus={inputRef} aria-label="Rename folder">
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              onRename(draft);
              setOpen(false);
            }}
          >
            <Label htmlFor="rename-folder" className="text-xs text-muted-foreground">
              Rename folder
            </Label>
            <Input
              ref={inputRef}
              id="rename-folder"
              inputSize="sm"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={(event) => event.target.select()}
            />
            <div className="flex gap-2">
              <PopoverClose render={<Button size="sm" className="flex-1" />}>Cancel</PopoverClose>
              <Button type="submit" variant="default" size="sm" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const Rename: Story = {
  render: () => <RenameFolder onRename={fn()} />,
};

export const RenameOpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <RenameFolder onRename={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Drafts actions" }));
    const body = within(document.body);
    const input = await body.findByLabelText("Rename folder", { selector: "input" });
    await waitFor(() => expect(input).toHaveFocus());
  },
};

export const RenameTypingTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <RenameFolder onRename={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Drafts actions" }));
    const body = within(document.body);
    const input = await body.findByLabelText("Rename folder", { selector: "input" });
    await waitFor(() => expect(input).toHaveFocus());
    // Ordinary letters reach the input: no menu typeahead swallows them.
    await userEvent.keyboard("Shared drafts");
    await expect(input).toHaveValue("Shared drafts");
  },
};

const onRename = fn();

export const RenameSaveTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <RenameFolder onRename={onRename} />,
  play: async ({ canvasElement }) => {
    onRename.mockClear();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Drafts actions" });
    await userEvent.click(trigger);
    const body = within(document.body);
    const input = await body.findByLabelText("Rename folder", { selector: "input" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("Reports{Enter}");
    await expect(onRename).toHaveBeenCalledWith("Reports");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

const results = ["Launch plan", "Launch checklist", "Launch budget", "Launch retro", "Launch FAQ"];

// Search-as-you-type: programmatic popover anchored to the input wrapper, focus stays in the input.
function SearchResults() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="w-[540px]">
      <div ref={anchorRef}>
        <Input
          aria-label="Search documents"
          placeholder="Search documents"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.length > 0);
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
          aria-label="Search results"
          className="w-(--anchor-width) overflow-hidden p-0 shadow-black/40"
        >
          <section aria-label="Results" className="flex gap-3 overflow-x-auto p-4">
            {results.map((name) => (
              <Button key={name} className="h-24 w-28 shrink-0 items-end justify-start text-left">
                {name}
              </Button>
            ))}
          </section>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Type in the input to open the results. */
export const Search: Story = {
  parameters: { layout: "padded" },
  render: () => <SearchResults />,
};

export const SearchTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
  render: () => <SearchResults />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search documents" });
    await userEvent.click(input);
    await userEvent.keyboard("La");
    const body = within(document.body);
    const results = await body.findByRole("region", { name: "Results" });
    // Typing continues uninterrupted: the popup never takes focus.
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("La");
    await userEvent.click(input);
    await expect(results).toBeVisible();
    // Keyboard focus can reach the results.
    await userEvent.tab();
    await expect(body.getByRole("button", { name: "Launch plan" })).toHaveFocus();
    // Let the input's blur repaint settle before the snapshot.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  },
};

/** A positioner class extends the overlay layer: the popover paints above its Dialog. */
export const InDialogWithPositionerClassTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Dialog defaultOpen>
      <DialogContent size="sm">
        <DialogTitle>Project settings</DialogTitle>
        <Popover>
          <PopoverTrigger render={<Button className="mt-4" />}>Details</PopoverTrigger>
          <PopoverContent align="start" positionerProps={{ className: "mt-1" }}>
            <PopoverHeader>
              <PopoverTitle>Quarterly report</PopoverTitle>
              <PopoverDescription>
                Last edited by Ada Park. Restoring an older version replaces the current one.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const body = within(document.body);
    await userEvent.click(await body.findByRole("button", { name: "Details" }));
    const popup = await body.findByRole("dialog", { name: "Quarterly report" });
    await waitFor(() => expect(popup).toBeVisible());
    const positioner = popup.closest("[data-slot='popover-positioner']");
    await expect(positioner).toHaveClass("mt-1");
    // Hit test the lower half of the popover, which overlaps the dialog's bottom edge and backdrop.
    const rect = popup.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.bottom - 8);
    await expect(popup.contains(hit)).toBe(true);
    await expect(getComputedStyle(positioner as Element).zIndex).toBe("1100");
  },
};
