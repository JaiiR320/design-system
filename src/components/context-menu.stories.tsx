import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

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

const onNewCategory = fn();

const meta = {
  title: "Primitives/ContextMenu",
  component: ContextMenu,
  parameters: { layout: "padded" },
  args: { onOpenChange: fn() },
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger
        aria-label="Lane 1"
        className="flex h-80 w-[640px] items-center justify-center rounded-xl border border-dashed border-border-strong text-sm text-muted-foreground"
      >
        Right-click empty lane space
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Lane 1</ContextMenuLabel>
          <ContextMenuItem onClick={onNewCategory}>New category</ContextMenuItem>
          <ContextMenuItem disabled>Paste cards</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Sort lane by</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Mana value</ContextMenuItem>
            <ContextMenuItem>Name</ContextMenuItem>
            <ContextMenuItem>Price</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem variant="muted">Collapse lane</ContextMenuItem>
        <ContextMenuItem variant="destructive">Remove lane</ContextMenuItem>
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
export const RightClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await rightClick(canvas.getByLabelText("Lane 1"));
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(body.getByRole("group", { name: "Lane 1" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());

    // Reopen and choose an item with the keyboard; disabled Paste cards is focusable but inert.
    await rightClick(canvas.getByLabelText("Lane 1"));
    await body.findByRole("menu");
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "New category" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(body.getByRole("menuitem", { name: "Paste cards" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(onNewCategory).toHaveBeenCalledTimes(1);

    // Leave it open for the snapshot.
    await rightClick(canvas.getByLabelText("Lane 1"));
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
  },
};

/** Submenu opens with ArrowRight and on hover. */
export const OpenSubmenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await rightClick(canvas.getByLabelText("Lane 1"));
    const sortBy = await body.findByRole("menuitem", { name: "Sort lane by" });
    await userEvent.keyboard("s");
    await waitFor(() => expect(sortBy).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Mana value" })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await userEvent.hover(sortBy);
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
  },
};
