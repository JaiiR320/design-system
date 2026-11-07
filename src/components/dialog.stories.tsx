import type { Meta, StoryObj } from "@storybook/react-vite";
import { X } from "lucide-react";
import { useRef, type ComponentProps } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from "#components/dialog";
import { Input } from "#components/input";
import { Label } from "#components/label";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

function HeaderClose() {
  return (
    <DialogClose render={<Button variant="icon-ghost" size="icon" aria-label="Close" />}>
      <X className="size-5" strokeWidth={1.75} />
    </DialogClose>
  );
}

// CreateDeckModal: title, labelled input with initial focus, Cancel/Create footer.
function NewDeckDialog({ onOpenChange }: Pick<ComponentProps<typeof Dialog>, "onOpenChange">) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>New Deck</DialogTrigger>
      <DialogContent initialFocus={inputRef}>
        <DialogTitle>New Deck</DialogTitle>
        <form className="mt-5" onSubmit={(event) => event.preventDefault()}>
          <Label htmlFor="deck-name">Deck name</Label>
          <Input ref={inputRef} id="deck-name" placeholder="Enter a deck name" className="mt-2" />
          <DialogFooter>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button type="submit" variant="default">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: () => <NewDeckDialog />,
};

export const Open: Story = {
  render: () => <NewDeckDialog />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "New Deck" }));
    const dialog = await body.findByRole("dialog", { name: "New Deck" });
    const input = within(dialog).getByRole("textbox", { name: "Deck name" });
    await waitFor(() => expect(input).toHaveFocus());
    // Focus stays inside: Tab cycles Cancel -> Create -> back to the input.
    await userEvent.tab();
    await expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveFocus());
  },
};

export const EscapeCloses: Story = {
  args: { onOpenChange: fn() },
  render: (args) => <NewDeckDialog onOpenChange={args.onOpenChange} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "New Deck" });
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "New Deck" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    await expect(trigger).toHaveFocus();
    // Scroll lock is released.
    await expect(document.documentElement.style.overflow).not.toBe("hidden");
    await expect(document.body.style.overflow).not.toBe("hidden");
  },
};

export const BackdropCloses: Story = {
  args: { onOpenChange: fn() },
  render: (args) => <NewDeckDialog onOpenChange={args.onOpenChange} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "New Deck" });
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "New Deck" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await userEvent.click(viewport);
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    await expect(trigger).toHaveFocus();
  },
};

// Generic dialogs open with focus on the popup itself, not the first button.
function OpenDialog(props: DialogContentProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog defaultOpen>
      <DialogContent ref={popupRef} tabIndex={-1} initialFocus={popupRef} {...props} />
    </Dialog>
  );
}

function SizedDialog({ size }: { size: "sm" | "lg" | "xl" | "2xl" | "3xl" | "4xl" }) {
  return (
    <OpenDialog size={size}>
      <DialogTitle>Size {size}</DialogTitle>
      <DialogDescription className="mt-1">
        The panel widens to max-w-{size}; padding and chrome stay the same.
      </DialogDescription>
      <DialogFooter>
        <DialogClose render={<Button />}>Close</DialogClose>
      </DialogFooter>
    </OpenDialog>
  );
}

export const SizeSm: Story = { render: () => <SizedDialog size="sm" /> };
export const SizeLg: Story = { render: () => <SizedDialog size="lg" /> };
export const SizeXl: Story = { render: () => <SizedDialog size="xl" /> };
export const Size2xl: Story = { render: () => <SizedDialog size="2xl" /> };
export const Size3xl: Story = { render: () => <SizedDialog size="3xl" /> };
export const Size4xl: Story = { render: () => <SizedDialog size="4xl" /> };

// Feedback-style form footers: end (default), stretch and between.
export const FooterLayouts: Story = {
  render: () => (
    <OpenDialog size="lg">
      <DialogHeader>
        <DialogTitle>Footer layouts</DialogTitle>
        <HeaderClose />
      </DialogHeader>
      <DialogBody className="space-y-6">
        <DialogFooter>
          <Button>Cancel</Button>
          <Button variant="default">Save</Button>
        </DialogFooter>
        <DialogFooter layout="stretch">
          <Button>Cancel</Button>
          <Button variant="default">Send</Button>
        </DialogFooter>
        <DialogFooter layout="between">
          <Button variant="ghost">Back</Button>
          <Button variant="default">Import</Button>
        </DialogFooter>
      </DialogBody>
    </OpenDialog>
  ),
};

const decklist = [
  "1 Ajani, Mentor of Heroes",
  "1 Anguished Unmaking",
  "1 Arcane Signet",
  "1 Atraxa, Praetors' Voice",
  "1 Beast Within",
  "1 Birds of Paradise",
  "1 Breeding Pool",
  "1 Chromatic Lantern",
  "1 Command Tower",
  "1 Counterspell",
].join("\n");

// ExportDeckModal: padding none, bordered header/footer bands, spaced body.
export const Divided: Story = {
  render: () => (
    <OpenDialog size="2xl" padding="none">
      <DialogHeader className="border-b px-6 py-5">
        <DialogTitle>Export Deck</DialogTitle>
        <HeaderClose />
      </DialogHeader>
      <DialogBody className="space-y-5 px-6 py-5">
        <DialogDescription>Plain-text decklist, one card per line.</DialogDescription>
        <textarea
          aria-label="Decklist"
          readOnly
          value={decklist}
          className="min-h-60 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-mono text-base text-strong-foreground outline-none"
        />
      </DialogBody>
      <DialogFooter layout="between" className="mt-0 border-t px-6 py-5">
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <Button variant="default" className="px-5 py-2.5">
          Copy to Clipboard
        </Button>
      </DialogFooter>
    </OpenDialog>
  ),
};

const paragraphs = Array.from(
  { length: 24 },
  (_, index) =>
    `Snapshot ${index + 1}: moved two lands to the sideboard and swapped the ramp package for cheaper rocks.`,
);

// Taller than the viewport: the viewport scrolls, the page behind does not.
export const LongContent: Story = {
  render: () => (
    <OpenDialog className="my-6">
      <DialogTitle>Change log</DialogTitle>
      <DialogBody className="mt-4 space-y-3 text-sm text-secondary-foreground">
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button />}>Close</DialogClose>
      </DialogFooter>
    </OpenDialog>
  ),
  play: async () => {
    await body.findByRole("dialog", { name: "Change log" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  },
};

// DeckActionsModal: fixed-height column with a scrolling body under a fixed title.
export const Settings: Story = {
  render: () => (
    <OpenDialog size="settings" className="flex h-[736px] max-h-[85vh] flex-col">
      <DialogHeader>
        <DialogTitle>Atraxa Superfriends</DialogTitle>
        <HeaderClose />
      </DialogHeader>
      <DialogBody className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {paragraphs.map((text) => (
          <div key={text} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm text-secondary-foreground">{text}</p>
          </div>
        ))}
      </DialogBody>
    </OpenDialog>
  ),
  play: async () => {
    const dialog = await body.findByRole("dialog", { name: "Atraxa Superfriends" });
    const scroller = dialog.querySelector<HTMLElement>('[data-slot="dialog-body"]');
    if (!scroller) throw new Error("body missing");
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
  },
};

const printings = [
  "SLD",
  "EOC",
  "CMM",
  "SLD",
  "2XM",
  "CM2",
  "C16",
  "PZ2",
  "A25",
  "M19",
  "M20",
  "MH1",
  "C20",
  "CMR",
  "40K",
];

// PrintingPickerModal: bare full-width page over a blurred scrim, scrolling as one.
function PrintingPicker() {
  return (
    <OpenDialog size="screen">
      <DialogHeader className="mb-5">
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-2xl">Select a printing</DialogTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,360px)_170px]">
            <div>
              <Label htmlFor="printing-filter" className="font-semibold text-strong-foreground">
                Search printings…
              </Label>
              <Input
                id="printing-filter"
                inputSize="xs"
                placeholder="Filter set name"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <DialogClose render={<Button variant="ghost" size="icon" aria-label="Close" />}>
          <X className="size-5" strokeWidth={1.75} />
        </DialogClose>
      </DialogHeader>
      <DialogBody className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {printings.map((code, index) => (
          <div key={`${code}-${index}`} className="min-w-0">
            <div className="aspect-[488/680] rounded-xl bg-surface ring-1 ring-border-strong" />
            <div className="mt-2 flex justify-between px-1 text-sm text-strong-foreground">
              <span className="font-semibold">{code}</span>
              <span>${(index + 1).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </DialogBody>
    </OpenDialog>
  );
}

export const Screen: Story = {
  render: () => <PrintingPicker />,
  play: async () => {
    await body.findByRole("dialog", { name: "Select a printing" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  },
};

// The printing picker on a real 390x844 phone: two columns, no sideways scroll, viewport scrolls.
export const ScreenMobile: Story = {
  globals: { viewport: { value: "mobile" } },
  render: () => <PrintingPicker />,
  play: async () => {
    await expect(window.innerWidth).toBe(390);
    const dialog = await body.findByRole("dialog", { name: "Select a printing" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    const grid = dialog.querySelector<HTMLElement>('[data-slot="dialog-body"]');
    if (!viewport || !grid) throw new Error("viewport or body missing");
    await expect(getComputedStyle(grid).gridTemplateColumns.split(" ")).toHaveLength(2);
    await expect(viewport.scrollWidth).toBe(viewport.clientWidth);
    await expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(390);
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    // The close button stays reachable on screen.
    const close = within(dialog).getByRole("button", { name: "Close" });
    const box = close.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    await expect(close.contains(hit)).toBe(true);
  },
};
