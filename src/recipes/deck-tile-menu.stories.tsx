import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Download,
  FolderInput,
  ImageOff,
  Image as ImageIcon,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import { Card, CardTitle } from "#components/card";
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

// Deterministic stand-in for card art: an inline SVG gradient, never a network image.
function art(from: string, via: string, to: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='440' viewBox='0 0 600 440'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='.55' stop-color='${via}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect width='600' height='440' fill='url(#g)'/><circle cx='390' cy='180' r='130' fill='${to}' opacity='.55'/><circle cx='170' cy='300' r='90' fill='${from}' opacity='.45'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type Media =
  | { kind: "plain" }
  | { kind: "single"; name: string; src: string }
  | {
      kind: "split";
      left: { name: string; src: string };
      right: { name: string; src: string };
    };

type Deck = { id: string; name: string; snapshots: number; media: Media };

const decks: Deck[] = [
  {
    id: "atraxa",
    name: "Atraxa Superfriends",
    snapshots: 3,
    media: {
      kind: "single",
      name: "Atraxa, Praetors' Voice",
      src: art("#3f3f46", "#18181b", "#a1a1aa"),
    },
  },
  {
    id: "thrasios",
    name: "Thrasios Tymna",
    snapshots: 0,
    media: {
      kind: "split",
      left: { name: "Thrasios, Triton Hero", src: art("#164e63", "#0e7490", "#be123c") },
      right: { name: "Tymna the Weaver", src: art("#78350f", "#d6d3d1", "#44403c") },
    },
  },
  { id: "empty-brew", name: "Empty Brew", snapshots: 0, media: { kind: "plain" } },
];

const folders = ["Root", "Constructed", "Archive"];

// Demonstration geometry from DeckDiff's DeckCard: oversized art offset into the 3:2 frame.
const artClass = "absolute top-[-40%] h-auto w-[142%] max-w-none";

function TileMedia({ media }: { media: Media }) {
  if (media.kind === "plain") return null;
  return (
    <>
      {media.kind === "single" ? (
        <img src={media.src} alt={media.name} className={`${artClass} left-[-21%] opacity-85`} />
      ) : (
        <div className="absolute inset-0 opacity-85">
          <div className="absolute inset-0 overflow-hidden [clip-path:polygon(0_0,57%_0,43%_100%,0_100%)]">
            <img src={media.left.src} alt={media.left.name} className={`${artClass} left-[-31%]`} />
          </div>
          <div className="absolute inset-0 overflow-hidden [clip-path:polygon(57%_0,100%_0,100%_100%,43%_100%)]">
            <img
              src={media.right.src}
              alt={media.right.name}
              className={`${artClass} right-[-31%]`}
            />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-on-image/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-on-image/85 to-transparent" />
    </>
  );
}

type DeckTileProps = {
  deck: Deck;
  onOpenDeck: (id: string) => void;
  onAction: (action: string, id: string) => void;
};

function DeckTile({ deck, onOpenDeck, onAction }: DeckTileProps) {
  const [folder, setFolder] = useState("Root");
  const hasArt = deck.media.kind !== "plain";
  return (
    <Card className="group relative flex aspect-3/2 flex-col overflow-hidden rounded-2xl transition hover:border-border-strong">
      <TileMedia media={deck.media} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-5 pr-16">
        <div className="flex items-center gap-3">
          <Layers
            className="size-7 shrink-0 text-highlight drop-shadow-lg"
            strokeWidth={1.75}
            aria-hidden
          />
          <CardTitle className="text-2xl tracking-tight drop-shadow-lg">{deck.name}</CardTitle>
        </div>
        <p
          className={
            hasArt
              ? "text-base text-secondary-foreground drop-shadow-lg"
              : "text-base text-muted-foreground"
          }
        >
          {deck.snapshots} snapshot{deck.snapshots === 1 ? "" : "s"}
          {folder === "Root" ? null : ` · ${folder}`}
        </p>
      </div>

      {/* Stretched primary action: a real link covering the tile, below the menu trigger. */}
      <Button
        nativeButton={false}
        render={<a href={`#deck-${deck.id}`} />}
        variant="ghost"
        size="none"
        aria-label={`Open ${deck.name}`}
        className="absolute inset-0 z-10 rounded-2xl hover:bg-transparent"
        onClick={(event) => {
          event.preventDefault();
          onOpenDeck(deck.id);
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant={hasArt ? "glass" : "icon-ghost"}
              size="icon"
              aria-label={`Edit ${deck.name}`}
              className={
                hasArt
                  ? "absolute top-5 right-5 z-20 p-2"
                  : // Plain tiles reveal the action on hover or when anything in the tile has focus.
                    "absolute top-5 right-5 z-20 p-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 data-popup-open:opacity-100"
              }
            />
          }
        >
          <MoreVertical className="size-5" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={() => onAction("rename", deck.id)}>
            <Pencil strokeWidth={1.75} />
            Rename deck
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="flex items-center gap-3">
                <FolderInput className="size-4" strokeWidth={1.75} aria-hidden />
                Move to folder
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{folder}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              {folders.map((name) => (
                <DropdownMenuItem
                  key={name}
                  disabled={name === folder}
                  onClick={() => setFolder(name)}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => onAction("export", deck.id)}>
            <Download strokeWidth={1.75} />
            Export deck list
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!hasArt} onClick={() => onAction("crop", deck.id)}>
            <ImageIcon strokeWidth={1.75} />
            Edit cover crop
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!hasArt} onClick={() => onAction("clear", deck.id)}>
            <ImageOff strokeWidth={1.75} />
            Clear deck cover
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onAction("delete", deck.id)}>
            <Trash2 strokeWidth={1.75} />
            Delete deck
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

type GridArgs = Omit<DeckTileProps, "deck">;

function DeckGrid(args: GridArgs) {
  return (
    <div className="grid w-[1128px] grid-cols-3 gap-5">
      {decks.map((deck) => (
        <DeckTile key={deck.id} deck={deck} {...args} />
      ))}
    </div>
  );
}

const meta = {
  title: "Recipes/DeckTileMenu",
  component: DeckGrid,
  args: { onOpenDeck: fn(), onAction: fn() },
} satisfies Meta<typeof DeckGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

/** Single, split and plain media. The stretched link opens the deck; art never steals the click. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const open = canvas.getByRole("link", { name: "Open Atraxa Superfriends" });
    await expect(open).toHaveAttribute("href", "#deck-atraxa");
    await userEvent.click(open);
    await expect(args.onOpenDeck).toHaveBeenCalledWith("atraxa");
    await expect(canvas.getByRole("img", { name: "Tymna the Weaver" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Empty Brew" })).toBeVisible();
    // Keep the capture at rest: no hover or focus left on a tile.
    await userEvent.unhover(open);
    open.blur();
  },
};

/** The plain tile's action is hidden until the tile has focus; Tab from the link reveals it. */
export const FocusRevealedAction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole("button", { name: "Edit Empty Brew" });
    await expect(getComputedStyle(action).opacity).toBe("0");
    const link = canvas.getByRole("link", { name: "Open Empty Brew" });
    link.focus();
    await waitFor(() => expect(getComputedStyle(action).opacity).toBe("1"));
    await userEvent.tab();
    await expect(action).toHaveFocus();
  },
};

/** Keyboard open: focus lands on the first item. Cover actions are enabled on a deck with art. */
export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Edit Atraxa Superfriends" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await body.findByRole("menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(within(menu).getByRole("menuitem", { name: "Rename deck" })).toHaveFocus(),
    );
    await expect(within(menu).getByRole("menuitem", { name: "Delete deck" })).toBeVisible();
    await expect(
      within(menu).getByRole("menuitem", { name: "Edit cover crop" }),
    ).not.toHaveAttribute("aria-disabled");
  },
};

/** Move to folder submenu; Escape closes the submenu first, then the menu, returning focus. */
export const SubmenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Edit Thrasios Tymna" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const moveTo = await body.findByRole("menuitem", { name: /Move to folder/ });
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(moveTo).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    // The current folder is disabled, so opening the submenu focuses the next folder.
    await expect(body.getByRole("menuitem", { name: "Root" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Constructed" })).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await expect(moveTo).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    // Reopen for the capture: menu plus submenu.
    await userEvent.keyboard("{Enter}");
    await body.findByRole("menu");
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Constructed" })).toHaveFocus());
  },
};

/** Picking a folder closes the whole tree, updates the tile and the submenu's current value. */
export const MoveToFolder: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Edit Atraxa Superfriends" });
    await userEvent.click(trigger);
    await userEvent.hover(await body.findByRole("menuitem", { name: /Move to folder/ }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Archive" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByText("3 snapshots · Archive")).toBeVisible();

    await userEvent.click(trigger);
    const moveTo = await body.findByRole("menuitem", { name: /Move to folder/ });
    await expect(moveTo).toHaveTextContent("Archive");
    await userEvent.click(body.getByRole("menuitem", { name: "Export deck list" }));
    await expect(args.onAction).toHaveBeenCalledWith("export", "atraxa");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.unhover(trigger);
    trigger.blur();
  },
};
