import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

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

const triggerClass =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-secondary-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const iconTriggerClass =
  "inline-flex size-7 items-center justify-center rounded-md text-subtle-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const categories = [
  "Land",
  "Artifact",
  "Enchantment",
  "Instant",
  "Sorcery",
  "Planeswalker",
  "Battle",
  "Other",
  "Ramp",
  "Sideboard",
  "Commander",
];

const meta = {
  title: "Primitives/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  // Room around the trigger so the default bottom/end placement shows without collision shifts.
  decorators: [
    (Story) => (
      <div className="flex h-[640px] w-[1000px] justify-center pt-8">
        <Story />
      </div>
    ),
  ],
  args: { onOpenChange: fn() },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger className={triggerClass}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Category</DropdownMenuLabel>
          <DropdownMenuItem>Move all cards</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="muted">Back</DropdownMenuItem>
        <DropdownMenuItem disabled>Hide category</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" disabled>
          Remove (disabled)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every item variant plus label, separator and disabled rows. */
export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(body.getByRole("group", { name: "Category" })).toBeInTheDocument();
  },
};

/** Card actions menu: narrower content with a Move to submenu (DeckDiff card ⋯ menu). */
export const OpenSubmenu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger className={iconTriggerClass} aria-label="Deepglow Skate actions">
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem>Use as deck cover</DropdownMenuItem>
        <DropdownMenuItem>Change printing</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {categories.map((name) => (
              <DropdownMenuItem key={name}>{name}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Deepglow Skate actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(document.body);
    const moveTo = await body.findByRole("menuitem", { name: "Move to" });
    // Typeahead lands on the submenu trigger; ArrowRight opens it, ArrowLeft closes it.
    await userEvent.keyboard("m");
    await waitFor(() => expect(moveTo).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Land" })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await expect(moveTo).toHaveFocus();
    // Pointer: hovering the trigger opens the submenu again.
    await userEvent.hover(moveTo);
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await expect(moveTo).toHaveAttribute("data-popup-open");
  },
};

const onHide = fn();

/** Arrows, Home/End, typeahead, disabled item, Escape focus return and item activation. */
export const KeyboardNavigation: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger className={triggerClass}>Ramp actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Move all cards</DropdownMenuItem>
        <DropdownMenuItem disabled>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onHide}>Hide category</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Ramp actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const first = await body.findByRole("menuitem", { name: "Move all cards" });
    await waitFor(() => expect(first).toHaveFocus());
    // Base UI keeps disabled items focusable (announced as disabled) but inert.
    await userEvent.keyboard("{ArrowDown}");
    const rename = body.getByRole("menuitem", { name: "Rename" });
    await expect(rename).toHaveFocus();
    await expect(rename).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter}");
    await expect(body.getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{ArrowDown}");
    await expect(body.getByRole("menuitem", { name: "Hide category" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(body.getByRole("menuitem", { name: "Remove" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    // Reopen, typeahead to Hide category and activate it with Enter.
    await userEvent.keyboard("{Enter}");
    await body.findByRole("menu");
    await userEvent.keyboard("h");
    await waitFor(() =>
      expect(body.getByRole("menuitem", { name: "Hide category" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(onHide).toHaveBeenCalledTimes(1);
    await expect(trigger).toHaveFocus();
  },
};

function CategoryMenu({ onMove }: { onMove: (name: string) => void }) {
  const [moving, setMoving] = useState(false);
  return (
    <DropdownMenu onOpenChange={(open) => !open && setMoving(false)}>
      <DropdownMenuTrigger className={iconTriggerClass} aria-label="Ramp actions">
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {moving ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Move cards to</DropdownMenuLabel>
              {categories.slice(0, 4).map((name) => (
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
              Move all cards
            </DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Hide category</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled>
              Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** closeOnClick={false} swaps to a same-width second page (DeckDiff category Move all cards). */
export const SecondPage: Story = {
  render: () => <CategoryMenu onMove={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Ramp actions" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Move all cards" }));
    await waitFor(() =>
      expect(body.getByRole("group", { name: "Move cards to" })).toBeInTheDocument(),
    );
    await userEvent.click(body.getByRole("menuitem", { name: "Back" }));
    await expect(await body.findByRole("menuitem", { name: "Move all cards" })).toBeVisible();
    await userEvent.click(body.getByRole("menuitem", { name: "Move all cards" }));
    await expect(await body.findByRole("menuitem", { name: "Instant" })).toBeVisible();
  },
};

/** A positioner class extends the overlay layer: the menu paints above its Dialog. */
export const InDialogWithPositionerClass: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent size="sm">
        <DialogTitle>Deck settings</DialogTitle>
        <DropdownMenu {...args}>
          <DropdownMenuTrigger className={`mt-4 ${triggerClass}`}>Actions</DropdownMenuTrigger>
          <DropdownMenuContent align="start" positionerProps={{ className: "mt-1" }}>
            <DropdownMenuItem>Move all cards</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
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
