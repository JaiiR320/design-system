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
  { label: "Amber", dot: "bg-amber-100" },
  { label: "Sky", dot: "bg-sky-400" },
  { label: "Slate", dot: "bg-zinc-500" },
  { label: "Red", dot: "bg-red-500" },
  { label: "Emerald", dot: "bg-emerald-500" },
];

type Folder = { name: string; documents: number; hidden: boolean; shared: boolean };

const initialFolders: Folder[] = [
  { name: "Reports", documents: 12, hidden: false, shared: true },
  { name: "Designs", documents: 7, hidden: false, shared: true },
  { name: "Plans", documents: 4, hidden: false, shared: true },
  { name: "Research", documents: 5, hidden: false, shared: false },
  { name: "Meetings", documents: 9, hidden: false, shared: true },
  { name: "Scratch", documents: 1, hidden: true, shared: false },
];

function GeneralPanel() {
  const [labelColors, setLabelColors] = useState(["Amber", "Sky", "Slate", "Emerald"]);
  const [textSize, setTextSize] = useState(120);
  const [archived, setArchived] = useState(true);
  return (
    <ItemGroup>
      <Card variant="inset" padding="md">
        <Field>
          <FieldLabel>Project name</FieldLabel>
          <div className="flex gap-2">
            <Input inputSize="md" defaultValue="Atlas" />
            <Button size="sm">Save</Button>
          </div>
          <FieldDescription>Shown in the sidebar and in exports.</FieldDescription>
        </Field>
      </Card>

      <Item variant="muted" size="sm" className="px-4 py-3">
        <ItemContent>
          <ItemTitle id="label-colors-title">Label colors</ItemTitle>
          <ItemDescription className="text-xs">
            Colors offered when tagging a document.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ToggleGroup
            aria-labelledby="label-colors-title"
            variant={null}
            className="flex shrink-0 gap-2"
            multiple
            value={labelColors}
            onValueChange={setLabelColors}
          >
            {colors.map(({ label, dot }) => (
              <ToggleGroupItem key={label} value={label} aria-label={label} className={swatchLook}>
                <span aria-hidden className={`size-7 rounded-full ${dot}`} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ItemActions>
      </Item>

      <Item variant="muted" size="sm" className="px-4 py-3">
        <ItemContent>
          <Label htmlFor="text-size" className="font-medium text-foreground">
            Text size
          </Label>
          <ItemDescription className="text-xs">Scale of document previews.</ItemDescription>
        </ItemContent>
        <ItemActions className="w-72 gap-3">
          <input
            id="text-size"
            type="range"
            min={100}
            max={200}
            step={10}
            value={textSize}
            onChange={(event) => setTextSize(Number(event.currentTarget.value))}
            className="w-full accent-cyan-400"
          />
          <output htmlFor="text-size" className="w-12 text-right text-xs text-subtle-foreground">
            {textSize}%
          </output>
        </ItemActions>
      </Item>

      <Item variant="muted" size="sm" className="px-4 py-3">
        <ItemContent>
          <ItemTitle id="archived-title">Show archived</ItemTitle>
          <ItemDescription className="text-xs">
            Keep archived documents in the list, dimmed.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <SwitchChip
            aria-labelledby="archived-title"
            checked={archived}
            onCheckedChange={setArchived}
          >
            {archived ? "On" : "Off"}
          </SwitchChip>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}

function FoldersPanel() {
  const [folders, setFolders] = useState(initialFolders);
  const [draft, setDraft] = useState("");

  function update(name: string, patch: Partial<Folder>) {
    setFolders((list) => list.map((f) => (f.name === name ? { ...f, ...patch } : f)));
  }

  function add() {
    const name = draft.trim();
    if (!name) return;
    setFolders((list) => [...list, { name, documents: 0, hidden: false, shared: true }]);
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
          <FieldLabel className="sr-only">New folder</FieldLabel>
          <Input inputSize="md" placeholder="New folder" value={draft} onValueChange={setDraft} />
        </Field>
        <Button type="submit" variant="default" size="sm">
          <Plus strokeWidth={1.75} />
          Add
        </Button>
      </form>
      <ItemGroup>
        {folders.map((f) => (
          <Item key={f.name} variant="muted" size="sm" className="px-4 py-3">
            <ItemMedia>
              <GripVertical className="size-4 text-faint-foreground" aria-hidden />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{f.name}</ItemTitle>
              <ItemDescription className="mt-0.5 text-xs">
                {f.documents} document{f.documents === 1 ? "" : "s"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <SwitchChip
                aria-label={`Hide ${f.name}`}
                checked={f.hidden}
                onCheckedChange={(hidden) => update(f.name, { hidden })}
              >
                Hide
              </SwitchChip>
              <SwitchChip
                aria-label={`Share ${f.name}`}
                checked={f.shared}
                onCheckedChange={(shared) => update(f.name, { shared })}
              >
                Shared
              </SwitchChip>
              <Button size="sm" aria-label={`Rename ${f.name}`}>
                Rename
              </Button>
              <Button
                size="sm"
                variant="destructive-outline"
                aria-label={`Remove ${f.name}`}
                disabled={f.documents > 0}
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

type ProjectSettingsProps = Pick<React.ComponentProps<typeof Dialog>, "onOpenChange">;

/** A settings-size Dialog composed from parts: no SettingsDialog API. */
function ProjectSettings({ onOpenChange }: ProjectSettingsProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <Settings strokeWidth={1.75} />
        Settings
      </DialogTrigger>
      <DialogContent
        padding="none"
        className="flex h-[min(736px,calc(100dvh-48px))] max-w-[800px] flex-col"
      >
        <DialogHeader className="px-6 pt-6">
          <div className="space-y-1">
            <DialogTitle className="text-lg">Atlas</DialogTitle>
            <DialogDescription className="text-xs">Project settings</DialogDescription>
          </div>
        </DialogHeader>
        <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-6 mt-3 border-b border-border">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>
          {/* Header and footer stay put; only this body scrolls. */}
          <DialogBody className="flex-1 overflow-y-auto px-6 py-5" data-testid="settings-body">
            <TabsContent value="general">
              <GeneralPanel />
            </TabsContent>
            <TabsContent value="folders">
              <FoldersPanel />
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
  title: "Recipes/SettingsDialog",
  component: ProjectSettings,
  args: { onOpenChange: fn() },
} satisfies Meta<typeof ProjectSettings>;

// App-owned look layered on Toggle with variant={null}: a label-color swatch that lights up when pressed.
const swatchLook =
  "size-10 rounded-full border border-border bg-background p-0 opacity-30 grayscale not-data-pressed:hover:border-border-strong not-data-pressed:hover:opacity-60 data-pressed:border-white/40 data-pressed:opacity-100 data-pressed:grayscale-0 data-pressed:shadow-[0_0_18px_rgb(34_211_238/0.14)]";

export default meta;
type Story = StoryObj<typeof meta>;

const body = within(document.body);

async function openSettings(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Settings" }));
  return body.findByRole("dialog", { name: "Atlas" });
}

export const Default: Story = {};

/** Escape dismisses the dialog and focus returns to the trigger. */
export const EscapeClosesTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Settings" });
    const dialog = await openSettings(canvasElement);
    await expect(dialog).toHaveAccessibleDescription("Project settings");
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    trigger.blur();
  },
};

/** General tab: multi ToggleGroup, native range and SwitchChip each change their value. */
export const GeneralTabTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const dialog = within(await openSettings(canvasElement));
    await expect(dialog.getByRole("tab", { name: "General" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(dialog.getByRole("textbox", { name: "Project name" })).toHaveAccessibleDescription(
      "Shown in the sidebar and in exports.",
    );

    const colors = dialog.getByRole("group", { name: "Label colors" });
    const red = within(colors).getByRole("button", { name: "Red" });
    await expect(red).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(red);
    await expect(red).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(colors).getByRole("button", { name: "Slate" }));
    await expect(within(colors).getByRole("button", { name: "Slate" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    const size = dialog.getByRole("slider", { name: "Text size" });
    // user-event has no range key support; a change event is what the browser fires on drag.
    fireEvent.change(size, { target: { value: "140" } });
    await expect(size).toHaveValue("140");
    await expect(dialog.getByText("140%")).toBeVisible();

    const archived = dialog.getByRole("switch", { name: "Show archived" });
    await expect(archived).toBeChecked();
    await userEvent.click(archived);
    await expect(archived).not.toBeChecked();
    await expect(archived).toHaveTextContent("Off");
  },
};

/** Folders tab: keyboard tab switch, add a folder, toggle chips; the body scrolls alone. */
export const FoldersTabTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const dialog = within(await openSettings(canvasElement));
    const general = dialog.getByRole("tab", { name: "General" });
    general.focus();
    // Arrows move focus only; Enter activates.
    await userEvent.keyboard("{ArrowRight}");
    const folders = dialog.getByRole("tab", { name: "Folders" });
    await expect(folders).toHaveFocus();
    await expect(general).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(folders).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(dialog.getByRole("tabpanel", { name: "Folders" })).toBeVisible());

    const input = dialog.getByRole("textbox", { name: "New folder" });
    await userEvent.type(input, "Drafts{Enter}");
    await expect(input).toHaveValue("");
    await expect(dialog.getByRole("switch", { name: "Hide Drafts" })).not.toBeChecked();
    await expect(dialog.getByRole("button", { name: "Remove Drafts" })).toBeEnabled();
    await expect(dialog.getByRole("button", { name: "Remove Reports" })).toBeDisabled();

    const hideReports = dialog.getByRole("switch", { name: "Hide Reports" });
    await userEvent.click(hideReports);
    await expect(hideReports).toBeChecked();

    const scroller = dialog.getByTestId("settings-body");
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible();
    scroller.scrollTop = 0;
  },
};
