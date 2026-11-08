import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Dialog, DialogContent, DialogTitle } from "#components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#components/dropdown-menu";

const folders = [
  "Atlas",
  "Borealis",
  "Cobalt",
  "Drafts",
  "Shared",
  "Archived",
  "Personal",
  "Templates",
  "Inbox",
  "Reports",
  "Notes",
];

const meta = {
  title: "Primitives/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  // Room around the trigger so the default bottom/end placement shows without collision shifts.
  decorators: [
    (Story) => (
      <div className="flex h-[640px] w-[1000px] items-start justify-center pt-8">
        <Story />
      </div>
    ),
  ],
  args: { onOpenChange: fn() },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Document</DropdownMenuLabel>
          <DropdownMenuItem>Move to folder</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="muted">Back</DropdownMenuItem>
        <DropdownMenuItem disabled>Share</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" disabled>
          Delete (disabled)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every item variant plus label, separator and disabled rows. */
export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(body.getByRole("group", { name: "Document" })).toBeInTheDocument();
  },
};

/** Item actions menu: narrower content with a Move to folder submenu. */
export const SubmenuKeyboardTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Quarterly report actions" />}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to folder</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {folders.map((name) => (
              <DropdownMenuItem key={name}>{name}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Quarterly report actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(document.body);
    const moveTo = await body.findByRole("menuitem", { name: "Move to folder" });
    // Typeahead lands on the submenu trigger; ArrowRight opens it, ArrowLeft closes it.
    await userEvent.keyboard("m");
    await waitFor(() => expect(moveTo).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Atlas" })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await expect(moveTo).toHaveFocus();
    // Pointer: hovering the trigger opens the submenu again.
    await userEvent.hover(moveTo);
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await expect(moveTo).toHaveAttribute("data-popup-open");
  },
};

const onArchive = fn();

/** Arrows, Home/End, typeahead, disabled item, Escape focus return and item activation. */
export const KeyboardNavigationTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button />}>Atlas actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Move to folder</DropdownMenuItem>
        <DropdownMenuItem disabled>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Atlas actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const first = await body.findByRole("menuitem", { name: "Move to folder" });
    await waitFor(() => expect(first).toHaveFocus());
    // Base UI keeps disabled items focusable (announced as disabled) but inert.
    await userEvent.keyboard("{ArrowDown}");
    const rename = body.getByRole("menuitem", { name: "Rename" });
    await expect(rename).toHaveFocus();
    await expect(rename).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter}");
    await expect(body.getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{ArrowDown}");
    await expect(body.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(body.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    // Reopen, typeahead to Archive and activate it with Enter.
    await userEvent.keyboard("{Enter}");
    await body.findByRole("menu");
    await userEvent.keyboard("a");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Archive" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(onArchive).toHaveBeenCalledTimes(1);
    await expect(trigger).toHaveFocus();
  },
};

function ProjectMenu({ onMove }: { onMove: (name: string) => void }) {
  const [moving, setMoving] = useState(false);
  return (
    <DropdownMenu onOpenChange={(open) => !open && setMoving(false)}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Atlas actions" />}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {moving ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {folders.slice(0, 4).map((name) => (
                <DropdownMenuItem key={name} onClick={() => onMove(name)}>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuItem variant="muted" closeOnClick={false} onClick={() => setMoving(false)}>
              Back
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem closeOnClick={false} onClick={() => setMoving(true)}>
              Move to folder
            </DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled>
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** closeOnClick={false} swaps to a same-width second page. */
export const SecondPageTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <ProjectMenu onMove={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Atlas actions" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Move to folder" }));
    await waitFor(() => expect(body.getByRole("group", { name: "Move to" })).toBeInTheDocument());
    await userEvent.click(body.getByRole("menuitem", { name: "Back" }));
    await expect(await body.findByRole("menuitem", { name: "Move to folder" })).toBeVisible();
    await userEvent.click(body.getByRole("menuitem", { name: "Move to folder" }));
    await expect(await body.findByRole("menuitem", { name: "Drafts" })).toBeVisible();
  },
};

/** A positioner class extends the overlay layer: the menu paints above its Dialog. */
export const InDialogWithPositionerClassTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent size="sm">
        <DialogTitle>Project settings</DialogTitle>
        <DropdownMenu {...args}>
          <DropdownMenuTrigger render={<Button className="mt-4" />}>Actions</DropdownMenuTrigger>
          <DropdownMenuContent align="start" positionerProps={{ className: "mt-1" }}>
            <DropdownMenuItem>Move to folder</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const body = within(document.body);
    await userEvent.click(await body.findByRole("button", { name: "Actions" }));
    const menu = await body.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    const positioner = menu.closest("[data-slot='dropdown-menu-positioner']");
    await expect(positioner).toHaveClass("mt-1");
    // Hit test the lower half of the menu, which overlaps the dialog's bottom edge and backdrop.
    const rect = menu.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.bottom - 8);
    await expect(menu.contains(hit)).toBe(true);
    await expect(getComputedStyle(positioner as Element).zIndex).toBe("1100");
  },
};
