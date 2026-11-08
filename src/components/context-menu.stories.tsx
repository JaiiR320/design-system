import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Dialog, DialogContent, DialogTitle } from "#components/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "#components/context-menu";

const onNewDocument = fn();

const meta = {
  title: "Primitives/ContextMenu",
  component: ContextMenu,
  parameters: { layout: "padded" },
  args: { onOpenChange: fn() },
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger
        aria-label="Atlas board"
        className="flex h-80 w-[640px] items-center justify-center rounded-xl border border-dashed border-border-strong text-sm text-muted-foreground"
      >
        Right-click empty board space
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Atlas board</ContextMenuLabel>
          <ContextMenuItem onClick={onNewDocument}>New document</ContextMenuItem>
          <ContextMenuItem disabled>Paste</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Sort by</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Name</ContextMenuItem>
            <ContextMenuItem>Date modified</ContextMenuItem>
            <ContextMenuItem>Owner</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem variant="muted">Collapse all</ContextMenuItem>
        <ContextMenuItem variant="destructive">Archive all</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

async function rightClick(target: HTMLElement) {
  // Fixed point inside the trigger so the pointer-anchored menu lands deterministically.
  const rect = target.getBoundingClientRect();
  await userEvent.pointer({
    keys: "[MouseRight]",
    target,
    coords: { clientX: rect.left + 120, clientY: rect.top + 40 },
  });
}

/** Real right click opens the menu at the pointer; arrows move, Escape closes. */
export const RightClickTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await rightClick(canvas.getByLabelText("Atlas board"));
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(body.getByRole("group", { name: "Atlas board" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());

    // Reopen and choose an item with the keyboard; disabled Paste is focusable but inert.
    await rightClick(canvas.getByLabelText("Atlas board"));
    const menu = await body.findByRole("menu");
    // Base UI focuses the popup after opening; navigating before that would race it.
    await waitFor(() => expect(menu).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "New document" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(body.getByRole("menuitem", { name: "Paste" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(onNewDocument).toHaveBeenCalledTimes(1);

    // Leave it open for the snapshot.
    await rightClick(canvas.getByLabelText("Atlas board"));
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
  },
};

/** Submenu opens with ArrowRight and on hover. */
export const SubmenuTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await rightClick(canvas.getByLabelText("Atlas board"));
    const sortBy = await body.findByRole("menuitem", { name: "Sort by" });
    // Let the menu take its opening focus before typing, or typeahead races it.
    await waitFor(() => expect(body.getByRole("menu")).toHaveFocus());
    await userEvent.keyboard("s");
    await waitFor(() => expect(sortBy).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Name" })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await userEvent.hover(sortBy);
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
  },
};

/** A positioner class extends the overlay layer: the menu paints above its Dialog. */
export const InDialogWithPositionerClassTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent size="sm">
        <DialogTitle>Project settings</DialogTitle>
        <ContextMenu {...args}>
          <ContextMenuTrigger
            aria-label="Atlas board"
            className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-border-strong text-sm text-muted-foreground"
          >
            Right-click empty board space
          </ContextMenuTrigger>
          <ContextMenuContent positionerProps={{ className: "ml-1" }}>
            <ContextMenuItem>New document</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuItem>Collapse all</ContextMenuItem>
            <ContextMenuItem>Refresh</ContextMenuItem>
            <ContextMenuItem variant="destructive">Archive all</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const body = within(document.body);
    await rightClick(await body.findByLabelText("Atlas board"));
    const menu = await body.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    const positioner = menu.closest("[data-slot='context-menu-positioner']");
    await expect(positioner).toHaveClass("ml-1");
    // Hit test the lower half of the menu, which overlaps the dialog's bottom edge and backdrop.
    const rect = menu.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.bottom - 8);
    await expect(menu.contains(hit)).toBe(true);
    await expect(getComputedStyle(positioner as Element).zIndex).toBe("1100");
  },
};
