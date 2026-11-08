import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis, Info, X } from "lucide-react";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#components/alert-dialog";
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
} from "#components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#components/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "#components/item";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#components/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#components/tooltip";

// One modal Dialog hosting every other overlay: Select, a menu with a submenu, a Popover,
// a Tooltip and a nested AlertDialog. All share z-(--z-overlay); the one opened last is
// portaled last and paints on top. Escape closes only the top layer, and focus walks back
// down the stack to each layer's trigger.

const groupOptions = [
  { value: "categories", label: "Categories" },
  { value: "type", label: "Type" },
  { value: "manaValue", label: "Mana value" },
];

const categories = ["Commander", "Ramp", "Sideboard", "Planeswalker"];

type DeckOptionsProps = {
  placement?: "center" | "edge";
  onMove: (category: string) => void;
  onDelete: () => void;
};

function DeckOptions({ placement = "center", onMove, onDelete }: DeckOptionsProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const edge = placement === "edge";

  return (
    <TooltipProvider>
      <div className={edge ? "flex w-[1168px] justify-end" : undefined}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>Deck options</DialogTrigger>
          <DialogContent
            ref={popupRef}
            tabIndex={-1}
            initialFocus={popupRef}
            size="lg"
            viewportProps={edge ? { className: "items-start justify-end pt-2 pr-2" } : undefined}
          >
            <DialogHeader>
              <div>
                <DialogTitle>Atraxa Superfriends</DialogTitle>
                <DialogDescription className="mt-1">Deck options</DialogDescription>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger
                    render={<Button size="icon-sm" variant="ghost" aria-label="Last saved" />}
                  >
                    <Info strokeWidth={1.75} />
                  </TooltipTrigger>
                  <TooltipContent>Saved Nov 7, 2026, 01:00 AM</TooltipContent>
                </Tooltip>
                <DialogClose render={<Button size="icon-sm" variant="ghost" aria-label="Close" />}>
                  <X strokeWidth={1.75} />
                </DialogClose>
              </div>
            </DialogHeader>

            <DialogBody className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-secondary-foreground">Group cards</span>
                <Select items={groupOptions} defaultValue="categories">
                  <SelectTrigger aria-label="Group cards" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Item size="sm">
                <ItemMedia
                  aria-hidden="true"
                  className="h-10 w-7 rounded-sm border border-border bg-linear-160 from-sky-500 to-indigo-900"
                />
                <ItemContent>
                  <ItemTitle>Deepglow Skate</ItemTitle>
                  <ItemDescription className="mt-0">Ramp</ItemDescription>
                </ItemContent>
                <ItemActions className="gap-1">
                  <Popover>
                    <PopoverTrigger render={<Button size="xs" variant="ghost" />}>
                      $0.42
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverHeader>
                        <PopoverTitle>Price</PopoverTitle>
                        <PopoverDescription>Cheapest printing, Nov 7, 2026.</PopoverDescription>
                      </PopoverHeader>
                    </PopoverContent>
                  </Popover>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Deepglow Skate actions"
                        />
                      }
                    >
                      <Ellipsis strokeWidth={1.75} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Use as deck cover</DropdownMenuItem>
                      <DropdownMenuItem>Change printing</DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {categories.map((category) => (
                            <DropdownMenuItem key={category} onClick={() => onMove(category)}>
                              {category}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
            </DialogBody>

            <DialogFooter layout="between">
              <AlertDialog open={confirming} onOpenChange={setConfirming}>
                <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
                  Delete deck
                </AlertDialogTrigger>
                {/* Base UI skips a nested dialog's backdrop by default; force it to dim the dialog below. */}
                <AlertDialogContent size="sm" overlayProps={{ forceRender: true }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Atraxa Superfriends?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The deck and its 3 snapshots are removed for good.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete();
                        setConfirming(false);
                        setOpen(false);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DialogClose render={<Button variant="default" />}>Done</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

const meta = {
  title: "Recipes/NestedOverlays",
  component: DeckOptions,
  parameters: { layout: "padded" },
  args: { onMove: fn(), onDelete: fn() },
} satisfies Meta<typeof DeckOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

/**
 * `top` paints over `below`: every overlay shares one z layer, so the later portal wins.
 * Base UI nests a child overlay's portal inside its parent's, so compare document order.
 */
async function expectAbove(top: HTMLElement, below: HTMLElement) {
  await expect(below.contains(top)).toBe(false);
  await expect(below.compareDocumentPosition(top) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const rect = top.getBoundingClientRect();
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  await expect(top.contains(hit)).toBe(true);
}

async function openDialog(canvasElement: HTMLElement) {
  const trigger = within(canvasElement).getByRole("button", { name: "Deck options" });
  await userEvent.click(trigger);
  const dialog = await body.findByRole("dialog", { name: "Atraxa Superfriends" });
  return { trigger, dialog };
}

async function openSubmenu(dialog: HTMLElement) {
  const menuTrigger = within(dialog).getByRole("button", { name: "Deepglow Skate actions" });
  await userEvent.click(menuTrigger);
  const menu = await body.findByRole("menu");
  await userEvent.click(within(menu).getByRole("menuitem", { name: "Move to" }));
  await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
  const submenu = body.getAllByRole("menu")[1];
  return { menuTrigger, menu, submenu };
}

export const Default: Story = {};

export const DialogOpen: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    await expect(dialog).toHaveAccessibleDescription("Deck options");
    await expect(dialog).toHaveFocus();
  },
};

export const SelectOpen: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    const trigger = within(dialog).getByRole("combobox", { name: "Group cards" });
    await userEvent.click(trigger);
    const listbox = await body.findByRole("listbox");
    await expectAbove(listbox, dialog);
    // Escape closes the listbox, not the dialog.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).toBeNull());
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveFocus();
    // Pick a value, then reopen to show the selection.
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("option", { name: "Type" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Type"));
    await expect(dialog).toBeVisible();
    await userEvent.click(trigger);
    await expect(await body.findByRole("option", { name: "Type" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const SubmenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    const { menu, submenu } = await openSubmenu(dialog);
    await expectAbove(menu, dialog);
    await expectAbove(submenu, menu);
    await expect(within(submenu).getAllByRole("menuitem")).toHaveLength(4);
    // The submenu opens to the right, offset from its trigger row.
    const moveTo = within(menu).getByRole("menuitem", { name: "Move to" });
    await expect(moveTo).toHaveAttribute("aria-expanded", "true");
    await expect(submenu.getBoundingClientRect().left).toBeGreaterThan(
      moveTo.getBoundingClientRect().right,
    );
  },
};

export const MoveToCategory: Story = {
  play: async ({ args, canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    const { menuTrigger, submenu } = await openSubmenu(dialog);
    await userEvent.click(within(submenu).getByRole("menuitem", { name: "Sideboard" }));
    await expect(args.onMove).toHaveBeenCalledWith("Sideboard");
    // The whole menu tree closes; the dialog stays.
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    await expect(dialog).toBeVisible();
    await expect(menuTrigger).toHaveFocus();
  },
};

export const EscapeClosesTopLayerFirst: Story = {
  play: async ({ canvasElement }) => {
    const { trigger, dialog } = await openDialog(canvasElement);
    const { menuTrigger } = await openSubmenu(dialog);
    const scrollY = window.scrollY;

    // Keyboard into the submenu so Escape starts from the top layer.
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await expect(body.getByRole("menuitem", { name: "Move to" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    await expect(dialog).toBeVisible();
    await expect(menuTrigger).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    // Scroll lock released and position kept.
    await waitFor(() => expect(document.documentElement.style.overflow).not.toBe("hidden"));
    await expect(document.body.style.overflow).not.toBe("hidden");
    await expect(window.scrollY).toBe(scrollY);
  },
};

export const PopoverAndTooltip: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    const priceTrigger = within(dialog).getByRole("button", { name: "$0.42" });
    await userEvent.click(priceTrigger);
    const popover = await body.findByRole("dialog", { name: "Price" });
    await expectAbove(popover, dialog);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Price" })).toBeNull());
    await expect(dialog).toBeVisible();
    await expect(priceTrigger).toHaveFocus();

    // Both open at once: the tooltip, opened last, paints over the popover.
    await userEvent.click(priceTrigger);
    const reopened = await body.findByRole("dialog", { name: "Price" });
    await userEvent.hover(within(dialog).getByRole("button", { name: "Last saved" }));
    const tooltip = await waitFor(() => {
      const element = document.querySelector<HTMLElement>("[data-slot=tooltip-content]");
      if (!element) throw new Error("tooltip not open");
      return element;
    });
    await expect(tooltip).toHaveTextContent("Saved Nov 7, 2026, 01:00 AM");
    await expectAbove(tooltip, dialog);
    await expect(reopened.compareDocumentPosition(tooltip) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  },
};

export const NestedAlertDialog: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    const deleteTrigger = within(dialog).getByRole("button", { name: "Delete deck" });
    await userEvent.click(deleteTrigger);
    const alert = await body.findByRole("alertdialog", { name: "Delete Atraxa Superfriends?" });
    await expectAbove(alert, dialog);
    await expect(within(alert).getByRole("button", { name: "Cancel" })).toHaveFocus();
    // Escape closes the alert dialog only; focus returns to its trigger inside the dialog.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull());
    await expect(dialog).toBeVisible();
    await expect(deleteTrigger).toHaveFocus();
    // Reopen for the snapshot.
    await userEvent.keyboard("{Enter}");
    await body.findByRole("alertdialog");
  },
};

export const ConfirmDelete: Story = {
  play: async ({ args, canvasElement }) => {
    const { trigger, dialog } = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete deck" }));
    const alert = await body.findByRole("alertdialog");
    await userEvent.click(within(alert).getByRole("button", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(body.queryByRole("alertdialog")).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

/** Dialog pinned to the right edge: the submenu has no room on the right and flips left. */
export const EdgeOfViewport: Story = {
  args: { placement: "edge" },
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement);
    await expect(window.innerWidth - dialog.getBoundingClientRect().right).toBeLessThan(16);
    const { menu, submenu } = await openSubmenu(dialog);
    const menuRect = menu.getBoundingClientRect();
    const subRect = submenu.getBoundingClientRect();
    // Flipped: it opens leftwards over the dialog instead of off screen.
    await expect(subRect.left).toBeLessThan(menuRect.left);
    await expect(subRect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(menuRect.right).toBeLessThanOrEqual(window.innerWidth);
    await expectAbove(submenu, menu);
  },
};

/** Phone width: the dialog fills the screen and the submenu stays on screen. */
export const Mobile390: Story = {
  globals: { viewport: { value: "mobile" } },
  play: async ({ canvasElement }) => {
    await expect(window.innerWidth).toBe(390);
    const { dialog } = await openDialog(canvasElement);
    const { menu, submenu } = await openSubmenu(dialog);
    for (const element of [dialog, menu, submenu]) {
      const rect = element.getBoundingClientRect();
      await expect(rect.left).toBeGreaterThanOrEqual(0);
      await expect(rect.right).toBeLessThanOrEqual(390);
    }
    await expectAbove(submenu, menu);
    await expectAbove(menu, dialog);
  },
};
