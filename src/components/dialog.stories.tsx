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
    <DialogClose render={<Button variant="ghost" size="icon" aria-label="Close" />}>
      <X className="size-5" strokeWidth={1.75} />
    </DialogClose>
  );
}

// Form dialog: title, labelled input with initial focus, Cancel/Create footer.
function NewProjectDialog({ onOpenChange }: Pick<ComponentProps<typeof Dialog>, "onOpenChange">) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>New project</DialogTrigger>
      <DialogContent initialFocus={inputRef}>
        <DialogTitle>New project</DialogTitle>
        <form className="mt-5" onSubmit={(event) => event.preventDefault()}>
          <Label htmlFor="project-name">Project name</Label>
          <Input
            ref={inputRef}
            id="project-name"
            placeholder="Enter a project name"
            className="mt-2"
          />
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
  render: () => <NewProjectDialog />,
};

export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <NewProjectDialog />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "New project" }));
    const dialog = await body.findByRole("dialog", { name: "New project" });
    const input = within(dialog).getByRole("textbox", { name: "Project name" });
    await waitFor(() => expect(input).toHaveFocus());
    // Focus stays inside: Tab cycles Cancel -> Create -> back to the input.
    await userEvent.tab();
    await expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveFocus());
  },
};

export const EscapeClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { onOpenChange: fn() },
  render: (args) => <NewProjectDialog onOpenChange={args.onOpenChange} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "New project" });
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "New project" });
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

export const BackdropClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { onOpenChange: fn() },
  render: (args) => <NewProjectDialog onOpenChange={args.onOpenChange} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "New project" });
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "New project" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await userEvent.click(viewport);
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    await expect(trigger).toHaveFocus();
  },
};

type DemoProps = DialogContentProps & {
  /** Trigger label for the closed docs story; without one the dialog renders open. */
  trigger?: string;
};

// Generic dialogs open with focus on the popup itself, not the first button.
function DemoDialog({ trigger, ...props }: DemoProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog defaultOpen={!trigger}>
      {trigger ? <DialogTrigger render={<Button />}>{trigger}</DialogTrigger> : null}
      <DialogContent ref={popupRef} tabIndex={-1} initialFocus={popupRef} {...props} />
    </Dialog>
  );
}

type Size = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

function SizedDialog({ size, trigger }: { size: Size; trigger?: string }) {
  return (
    <DemoDialog size={size} trigger={trigger}>
      <DialogTitle>Size {size}</DialogTitle>
      <DialogDescription className="mt-1">
        The panel widens to max-w-{size}; padding and chrome stay the same.
      </DialogDescription>
      <DialogFooter>
        <DialogClose render={<Button />}>Close</DialogClose>
      </DialogFooter>
    </DemoDialog>
  );
}

/** One trigger per size. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map((size) => (
        <SizedDialog key={size} size={size} trigger={`Size ${size}`} />
      ))}
    </div>
  ),
};

export const SizeSmTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SizedDialog size="sm" />,
};
export const SizeLgTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SizedDialog size="lg" />,
};
export const SizeXlTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SizedDialog size="xl" />,
};
export const Size2xlTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SizedDialog size="2xl" />,
};
export const Size3xlTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SizedDialog size="3xl" />,
};
export const Size4xlTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <SizedDialog size="4xl" />,
};

// Form footers: end (default), stretch and between.
function FooterLayoutsDialog({ trigger }: { trigger?: string }) {
  return (
    <DemoDialog size="lg" trigger={trigger}>
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
    </DemoDialog>
  );
}

const exportText = [
  "title,project,owner,tag",
  "Quarterly report,Atlas,Ada Park,Shared",
  "Design review,Atlas,Sam Lee,Draft",
  "Launch plan,Borealis,Ada Park,Shared",
  "Budget notes,Borealis,Sam Lee,Archived",
  "Hiring plan,Cobalt,Ada Park,Draft",
  "Roadmap,Cobalt,Sam Lee,Shared",
].join("\n");

// Padding none, bordered header/footer bands, spaced body.
function DividedDialog({ trigger }: { trigger?: string }) {
  return (
    <DemoDialog size="2xl" padding="none" trigger={trigger}>
      <DialogHeader className="border-b px-6 py-5">
        <DialogTitle>Export documents</DialogTitle>
        <HeaderClose />
      </DialogHeader>
      <DialogBody className="space-y-5 px-6 py-5">
        <DialogDescription>Comma-separated values, one document per line.</DialogDescription>
        <textarea
          aria-label="Export"
          readOnly
          value={exportText}
          className="min-h-60 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-mono text-base text-strong-foreground outline-none"
        />
      </DialogBody>
      <DialogFooter layout="between" className="mt-0 border-t px-6 py-5">
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <Button variant="default" className="px-5 py-2.5">
          Copy to Clipboard
        </Button>
      </DialogFooter>
    </DemoDialog>
  );
}

const paragraphs = Array.from(
  { length: 24 },
  (_, index) =>
    `Version ${index + 1}: Ada Park updated the launch plan and moved two tasks from Atlas to Borealis.`,
);

// Taller than the viewport: the viewport scrolls, the page behind does not.
function LongContentDialog({ trigger }: { trigger?: string }) {
  return (
    <DemoDialog className="my-6" trigger={trigger}>
      <DialogTitle>Change log</DialogTitle>
      <DialogBody className="mt-4 space-y-3 text-sm text-secondary-foreground">
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button />}>Close</DialogClose>
      </DialogFooter>
    </DemoDialog>
  );
}

// Fixed-height column with a scrolling body under a fixed title; width set via className.
function ScrollingBodyDialog({ trigger }: { trigger?: string }) {
  return (
    <DemoDialog className="flex h-[736px] max-h-[85vh] max-w-[800px] flex-col" trigger={trigger}>
      <DialogHeader>
        <DialogTitle>Atlas activity</DialogTitle>
        <HeaderClose />
      </DialogHeader>
      <DialogBody className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {paragraphs.map((text) => (
          <div key={text} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm text-secondary-foreground">{text}</p>
          </div>
        ))}
      </DialogBody>
    </DemoDialog>
  );
}

const templates = Array.from({ length: 15 }, (_, index) => ({
  name: `Template ${String(index + 1).padStart(2, "0")}`,
  pages: (index % 4) + 1,
}));

// A chrome-free full-width picker over a darker blurred scrim, scrolling as one page:
// built from the ordinary parts, no special size.
function FullScreenPicker({ trigger }: { trigger?: string }) {
  return (
    <DemoDialog
      trigger={trigger}
      padding="none"
      className="mx-auto max-w-7xl rounded-none border-0 bg-transparent shadow-none"
      overlayProps={{ className: "bg-black/80 backdrop-blur-sm" }}
      viewportProps={{ className: "block px-4 py-5 sm:px-6" }}
    >
      <DialogHeader className="mb-5">
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-2xl">Choose a template</DialogTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,360px)_170px]">
            <div>
              <Label htmlFor="template-filter" className="font-semibold text-strong-foreground">
                Search templates
              </Label>
              <Input
                id="template-filter"
                inputSize="sm"
                placeholder="Filter by name"
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
        {templates.map(({ name, pages }) => (
          <div key={name} className="min-w-0">
            <div className="aspect-[3/4] rounded-xl bg-surface ring-1 ring-border-strong" />
            <div className="mt-2 flex justify-between px-1 text-sm text-strong-foreground">
              <span className="font-semibold">{name}</span>
              <span>{pages === 1 ? "1 page" : `${pages} pages`}</span>
            </div>
          </div>
        ))}
      </DialogBody>
    </DemoDialog>
  );
}

/** One trigger per layout recipe. */
export const Layouts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <FooterLayoutsDialog trigger="Footer layouts" />
      <DividedDialog trigger="Divided" />
      <LongContentDialog trigger="Long content" />
      <ScrollingBodyDialog trigger="Scrolling body" />
      <FullScreenPicker trigger="Full screen" />
    </div>
  ),
};

export const FooterLayoutsTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <FooterLayoutsDialog />,
};

export const DividedTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <DividedDialog />,
};

export const LongContentTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <LongContentDialog />,
  play: async () => {
    await body.findByRole("dialog", { name: "Change log" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  },
};

export const ScrollingBodyTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <ScrollingBodyDialog />,
  play: async () => {
    const dialog = await body.findByRole("dialog", { name: "Atlas activity" });
    const scroller = dialog.querySelector<HTMLElement>('[data-slot="dialog-body"]');
    if (!scroller) throw new Error("body missing");
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
  },
};

export const FullScreenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <FullScreenPicker />,
  play: async () => {
    await body.findByRole("dialog", { name: "Choose a template" });
    const viewport = document.querySelector<HTMLElement>('[data-slot="dialog-viewport"]');
    if (!viewport) throw new Error("viewport missing");
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  },
};

// The full-screen picker on a real 390x844 phone: two columns, no sideways scroll, viewport scrolls.
export const FullScreenMobileTest: Story = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "mobile" } },
  parameters: { chromatic: { modes: { mobile: { viewport: "mobile" } } } },
  render: () => <FullScreenPicker />,
  play: async () => {
    await expect(window.innerWidth).toBe(390);
    const dialog = await body.findByRole("dialog", { name: "Choose a template" });
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
