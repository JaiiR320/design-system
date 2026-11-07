import type { Meta, StoryObj } from "@storybook/react-vite";
import { GripVertical, Plus, Settings } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Card } from "#components/card";
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
import { Field, FieldDescription, FieldLabel } from "#components/field";
import { Input } from "#components/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#components/item";
import { Label } from "#components/label";
import { SwitchChip } from "#components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/tabs";
import { ToggleGroup, ToggleGroupItem } from "#components/toggle-group";

const colors = [
  { label: "White", dot: "bg-amber-100" },
  { label: "Blue", dot: "bg-sky-400" },
  { label: "Black", dot: "bg-zinc-500" },
  { label: "Red", dot: "bg-red-500" },
  { label: "Green", dot: "bg-emerald-500" },
];

type Category = { name: string; cards: number; hidden: boolean; inDeck: boolean };

const initialCategories: Category[] = [
  { name: "Land", cards: 27, hidden: false, inDeck: true },
  { name: "Creature", cards: 7, hidden: false, inDeck: true },
  { name: "Artifact", cards: 10, hidden: false, inDeck: true },
  { name: "Enchantment", cards: 5, hidden: false, inDeck: true },
  { name: "Instant", cards: 10, hidden: false, inDeck: true },
  { name: "Sideboard", cards: 1, hidden: true, inDeck: false },
];

function GeneralPanel() {
  const [deckColors, setDeckColors] = useState(["White", "Blue", "Black", "Green"]);
  const [zoom, setZoom] = useState(120);
  const [ghosts, setGhosts] = useState(true);
  return (
    <ItemGroup>
      <Card variant="inset" padding="md">
        <Field>
          <FieldLabel>Deck name</FieldLabel>
          <div className="flex gap-2">
            <Input inputSize="sm" defaultValue="Atraxa Superfriends" />
            <Button size="sm">Save</Button>
          </div>
          <FieldDescription>Shown on the deck tile and in exports.</FieldDescription>
        </Field>
      </Card>

      <Item variant="muted" size="sm" className="px-4 py-3">
        <ItemContent>
          <ItemTitle id="deck-colors-title">Deck colors</ItemTitle>
          <ItemDescription className="text-xs">
            Used to clamp flexible mana production stats.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ToggleGroup
            aria-labelledby="deck-colors-title"
            variant="round"
            multiple
            value={deckColors}
            onValueChange={setDeckColors}
          >
            {colors.map(({ label, dot }) => (
              <ToggleGroupItem key={label} value={label} aria-label={label}>
                <span aria-hidden className={`size-7 rounded-full ${dot}`} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ItemActions>
      </Item>

      <Item variant="muted" size="sm" className="px-4 py-3">
        <ItemContent>
          <Label htmlFor="cover-zoom" className="font-medium text-foreground">
            Cover zoom
          </Label>
          <ItemDescription className="text-xs">How far the tile art is cropped in.</ItemDescription>
        </ItemContent>
        <ItemActions className="w-72 gap-3">
          <input
            id="cover-zoom"
            type="range"
            min={100}
            max={200}
            step={10}
            value={zoom}
            onChange={(event) => setZoom(Number(event.currentTarget.value))}
            className="w-full accent-cyan-400"
          />
          <output htmlFor="cover-zoom" className="w-12 text-right text-xs text-subtle-foreground">
            {zoom}%
          </output>
        </ItemActions>
      </Item>

      <Item variant="muted" size="sm" className="px-4 py-3">
        <ItemContent>
          <ItemTitle id="ghosts-title">Removed-card ghosts</ItemTitle>
          <ItemDescription className="text-xs">
            Keep cards visible in their old category after moving them.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <SwitchChip aria-labelledby="ghosts-title" checked={ghosts} onCheckedChange={setGhosts}>
            {ghosts ? "On" : "Off"}
          </SwitchChip>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}

function CategoriesPanel() {
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState("");

  function update(name: string, patch: Partial<Category>) {
    setCategories((list) => list.map((c) => (c.name === name ? { ...c, ...patch } : c)));
  }

  function add() {
    const name = draft.trim();
    if (!name) return;
    setCategories((list) => [...list, { name, cards: 0, hidden: false, inDeck: true }]);
    setDraft("");
  }

  return (
    <div className="space-y-3">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Field className="flex-1">
          <FieldLabel className="sr-only">New category</FieldLabel>
          <Input inputSize="sm" placeholder="New category" value={draft} onValueChange={setDraft} />
        </Field>
        <Button type="submit" variant="default" size="sm">
          <Plus strokeWidth={1.75} />
          Add
        </Button>
      </form>
      <ItemGroup>
        {categories.map((c) => (
          <Item key={c.name} variant="muted" size="sm" className="px-4 py-3">
            <ItemMedia>
              <GripVertical className="size-4 text-faint-foreground" aria-hidden />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{c.name}</ItemTitle>
              <ItemDescription className="mt-0.5 text-xs">
                {c.cards} card{c.cards === 1 ? "" : "s"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <SwitchChip
                aria-label={`Hide ${c.name}`}
                checked={c.hidden}
                onCheckedChange={(hidden) => update(c.name, { hidden })}
              >
                Hide
              </SwitchChip>
              <SwitchChip
                aria-label={`${c.name} in deck`}
                checked={c.inDeck}
                onCheckedChange={(inDeck) => update(c.name, { inDeck })}
              >
                In Deck
              </SwitchChip>
              <Button size="sm" aria-label={`Rename ${c.name}`}>
                Rename
              </Button>
              <Button
                size="sm"
                variant="destructive-outline"
                aria-label={`Remove ${c.name}`}
                disabled={c.cards > 0}
              >
                Remove
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}

type DeckSettingsProps = Pick<React.ComponentProps<typeof Dialog>, "onOpenChange">;

/** A settings-size Dialog composed from parts: no SettingsDialog API. */
function DeckSettings({ onOpenChange }: DeckSettingsProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <Settings strokeWidth={1.75} />
        Settings
      </DialogTrigger>
      <DialogContent
        size="settings"
        padding="none"
        className="flex h-[min(736px,calc(100dvh-48px))] flex-col"
      >
        <DialogHeader className="px-6 pt-6">
          <div className="space-y-1">
            <DialogTitle className="text-lg">Atraxa Superfriends</DialogTitle>
            <DialogDescription className="text-xs">Deck settings</DialogDescription>
          </div>
        </DialogHeader>
        <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-6 mt-3 border-b border-border">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          {/* Header and footer stay put; only this body scrolls. */}
          <DialogBody className="flex-1 overflow-y-auto px-6 py-5" data-testid="settings-body">
            <TabsContent value="general">
              <GeneralPanel />
            </TabsContent>
            <TabsContent value="categories">
              <CategoriesPanel />
            </TabsContent>
          </DialogBody>
        </Tabs>
        <DialogFooter layout="stretch" className="mt-0 border-t border-border px-6 py-4">
          <DialogClose render={<Button />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const meta = {
  title: "Recipes/SettingsPanel",
  component: DeckSettings,
  args: { onOpenChange: fn() },
} satisfies Meta<typeof DeckSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

async function openSettings(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Settings" }));
  return body.findByRole("dialog", { name: "Atraxa Superfriends" });
}

/** Closed: Escape dismisses the dialog and focus returns to the trigger. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Settings" });
    const dialog = await openSettings(canvasElement);
    await expect(dialog).toHaveAccessibleDescription("Deck settings");
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    trigger.blur();
  },
};

/** General tab: multi ToggleGroup, native range and SwitchChip each change their value. */
export const GeneralOpen: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(await openSettings(canvasElement));
    await expect(dialog.getByRole("tab", { name: "General" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(dialog.getByRole("textbox", { name: "Deck name" })).toHaveAccessibleDescription(
      "Shown on the deck tile and in exports.",
    );

    const colors = dialog.getByRole("group", { name: "Deck colors" });
    const red = within(colors).getByRole("button", { name: "Red" });
    await expect(red).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(red);
    await expect(red).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(colors).getByRole("button", { name: "Black" }));
    await expect(within(colors).getByRole("button", { name: "Black" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    const zoom = dialog.getByRole("slider", { name: "Cover zoom" });
    // user-event has no range key support; a change event is what the browser fires on drag.
    fireEvent.change(zoom, { target: { value: "140" } });
    await expect(zoom).toHaveValue("140");
    await expect(dialog.getByText("140%")).toBeVisible();

    const ghosts = dialog.getByRole("switch", { name: "Removed-card ghosts" });
    await expect(ghosts).toBeChecked();
    await userEvent.click(ghosts);
    await expect(ghosts).not.toBeChecked();
    await expect(ghosts).toHaveTextContent("Off");
  },
};

/** Categories tab: keyboard tab switch, add a category, toggle chips; the body scrolls alone. */
export const CategoriesOpen: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(await openSettings(canvasElement));
    const general = dialog.getByRole("tab", { name: "General" });
    general.focus();
    // Arrows move focus only; Enter activates.
    await userEvent.keyboard("{ArrowRight}");
    const categories = dialog.getByRole("tab", { name: "Categories" });
    await expect(categories).toHaveFocus();
    await expect(general).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(categories).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(dialog.getByRole("tabpanel", { name: "Categories" })).toBeVisible());

    const input = dialog.getByRole("textbox", { name: "New category" });
    await userEvent.type(input, "Ramp{Enter}");
    await expect(input).toHaveValue("");
    await expect(dialog.getByRole("switch", { name: "Hide Ramp" })).not.toBeChecked();
    await expect(dialog.getByRole("button", { name: "Remove Ramp" })).toBeEnabled();
    await expect(dialog.getByRole("button", { name: "Remove Land" })).toBeDisabled();

    const hideLand = dialog.getByRole("switch", { name: "Hide Land" });
    await userEvent.click(hideLand);
    await expect(hideLand).toBeChecked();

    const scroller = dialog.getByTestId("settings-body");
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible();
    scroller.scrollTop = 0;
  },
};
