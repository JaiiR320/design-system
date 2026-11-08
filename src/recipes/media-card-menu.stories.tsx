import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Copy,
  Download,
  Folder,
  FolderInput,
  ImageOff,
  Image as ImageIcon,
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

// Deterministic stand-in for a cover image: flat SVG shapes, never a network image.
function cover(back: string, front: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'><rect width='600' height='300' fill='${back}'/><circle cx='420' cy='120' r='130' fill='${front}'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type Project = { id: string; name: string; documents: number; cover?: string };

const projects: Project[] = [
  { id: "atlas", name: "Atlas", documents: 3, cover: cover("#18181b", "#3f3f46") },
  { id: "borealis", name: "Borealis", documents: 1, cover: cover("#082f49", "#0e7490") },
  { id: "cobalt", name: "Cobalt", documents: 0 },
];

const folders = ["Root", "Shared", "Archived"];

type MediaCardProps = {
  project: Project;
  onOpen: (id: string) => void;
  onAction: (action: string, id: string) => void;
};

function MediaCard({ project, onOpen, onAction }: MediaCardProps) {
  const [folder, setFolder] = useState("Root");
  const hasCover = Boolean(project.cover);
  return (
    <Card className="group relative flex h-56 flex-col overflow-hidden rounded-2xl transition hover:border-border-strong">
      {project.cover ? (
        <>
          <img
            src={project.cover}
            alt={`${project.name} cover`}
            className="absolute inset-0 size-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-black/45" />
        </>
      ) : null}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-5 pr-16">
        <div className="flex items-center gap-3">
          <Folder className="size-7 shrink-0 text-cyan-300" strokeWidth={1.75} aria-hidden />
          <CardTitle className="text-2xl tracking-tight">{project.name}</CardTitle>
        </div>
        <p
          className={
            hasCover ? "text-base text-secondary-foreground" : "text-base text-muted-foreground"
          }
        >
          {project.documents} document{project.documents === 1 ? "" : "s"}
          {folder === "Root" ? null : ` · ${folder}`}
        </p>
      </div>

      {/* Stretched primary action: a real link covering the card, below the menu trigger. */}
      <Button
        nativeButton={false}
        render={<a href={`#project-${project.id}`} />}
        variant="ghost"
        size="none"
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-10 rounded-2xl hover:bg-transparent"
        onClick={(event) => {
          event.preventDefault();
          onOpen(project.id);
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant={hasCover ? null : "ghost"}
              size="icon"
              aria-label={`${project.name} actions`}
              className={
                hasCover
                  ? "absolute top-5 right-5 z-20 bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50"
                  : // Plain cards reveal the action on hover or when anything in the card has focus.
                    "absolute top-5 right-5 z-20 p-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 data-popup-open:opacity-100"
              }
            />
          }
        >
          <MoreVertical className="size-5" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={() => onAction("rename", project.id)}>
            <Pencil strokeWidth={1.75} />
            Rename
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
          <DropdownMenuItem onClick={() => onAction("duplicate", project.id)}>
            <Copy strokeWidth={1.75} />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("export", project.id)}>
            <Download strokeWidth={1.75} />
            Export
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!hasCover} onClick={() => onAction("cover", project.id)}>
            <ImageIcon strokeWidth={1.75} />
            Change cover
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!hasCover}
            onClick={() => onAction("remove-cover", project.id)}
          >
            <ImageOff strokeWidth={1.75} />
            Remove cover
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onAction("delete", project.id)}>
            <Trash2 strokeWidth={1.75} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

type GridArgs = Omit<MediaCardProps, "project">;

function MediaCardGrid(args: GridArgs) {
  return (
    <div className="grid w-[1128px] grid-cols-3 gap-5">
      {projects.map((project) => (
        <MediaCard key={project.id} project={project} {...args} />
      ))}
    </div>
  );
}

const meta = {
  title: "Recipes/MediaCardMenu",
  component: MediaCardGrid,
  args: { onOpen: fn(), onAction: fn() },
} satisfies Meta<typeof MediaCardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

/** Image and plain cards. The stretched link opens the project; the image never steals the click. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const open = canvas.getByRole("link", { name: "Open Atlas" });
    await expect(open).toHaveAttribute("href", "#project-atlas");
    await userEvent.click(open);
    await expect(args.onOpen).toHaveBeenCalledWith("atlas");
    await expect(canvas.getByRole("img", { name: "Borealis cover" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Cobalt" })).toBeVisible();
    // Keep the capture at rest: no hover or focus left on a card.
    await userEvent.unhover(open);
    open.blur();
  },
};

/** The plain card's action is hidden until the card has focus; Tab from the link reveals it. */
export const FocusRevealTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole("button", { name: "Cobalt actions" });
    await expect(getComputedStyle(action).opacity).toBe("0");
    const link = canvas.getByRole("link", { name: "Open Cobalt" });
    link.focus();
    await waitFor(() => expect(getComputedStyle(action).opacity).toBe("1"));
    await userEvent.tab();
    await expect(action).toHaveFocus();
  },
};

/** Keyboard open: focus lands on the first item. Cover actions are enabled on a card with an image. */
export const MenuOpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Atlas actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await body.findByRole("menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(within(menu).getByRole("menuitem", { name: "Rename" })).toHaveFocus(),
    );
    await expect(within(menu).getByRole("menuitem", { name: "Delete" })).toBeVisible();
    await expect(within(menu).getByRole("menuitem", { name: "Change cover" })).not.toHaveAttribute(
      "aria-disabled",
    );
  },
};

/** Move to folder submenu; Escape closes the submenu first, then the menu, returning focus. */
export const SubmenuKeyboardTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Borealis actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const moveTo = await body.findByRole("menuitem", { name: /Move to folder/ });
    // Keyboard opening focuses the first item; wait for it so ArrowDown doesn't race it.
    const rename = body.getByRole("menuitem", { name: "Rename" });
    await waitFor(() => expect(rename).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(moveTo).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    // The current folder is disabled, so opening the submenu focuses the next folder.
    await expect(body.getByRole("menuitem", { name: "Root" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Shared" })).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
    await expect(moveTo).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();

    // Reopen for the capture: menu plus submenu.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Rename" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(body.getByRole("menuitem", { name: /Move to folder/ })).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
    await waitFor(() => expect(body.getByRole("menuitem", { name: "Shared" })).toHaveFocus());
  },
};

/** Picking a folder closes the whole tree, updates the card and the submenu's current value. */
export const MoveToFolderTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Atlas actions" });
    await userEvent.click(trigger);
    await userEvent.hover(await body.findByRole("menuitem", { name: /Move to folder/ }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Archived" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByText("3 documents · Archived")).toBeVisible();

    await userEvent.click(trigger);
    const moveTo = await body.findByRole("menuitem", { name: /Move to folder/ });
    await expect(moveTo).toHaveTextContent("Archived");
    await userEvent.click(body.getByRole("menuitem", { name: "Export" }));
    await expect(args.onAction).toHaveBeenCalledWith("export", "atlas");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await userEvent.unhover(trigger);
    trigger.blur();
  },
};
