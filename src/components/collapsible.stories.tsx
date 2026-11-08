import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronRight, Folder, FolderInput } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#components/collapsible";

const meta = {
  title: "Primitives/Collapsible",
  component: Collapsible,
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

const folders = ["Shared", "Archive"];

// A "Move to folder" disclosure; all layout comes from the caller.
function MoveToFolder({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="w-[30rem] rounded-xl border border-border bg-muted p-4"
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg text-left text-sm transition outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <FolderInput className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <span>Move to folder</span>
        </span>
        <span className="flex min-w-0 items-center gap-2 text-subtle-foreground">
          <span className="truncate">Root</span>
          <ChevronRight
            className="size-4 shrink-0 group-data-panel-open:rotate-90"
            strokeWidth={1.75}
          />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-1 rounded-xl border border-border bg-background/60 p-1">
        <button
          type="button"
          disabled
          aria-current="true"
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-left text-sm text-primary-foreground"
        >
          <FolderInput className="size-4" strokeWidth={1.75} />
          <span>Root</span>
        </button>
        {folders.map((name) => (
          <button
            key={name}
            type="button"
            className="flex w-full items-center gap-2 rounded-lg py-2 pr-3 pl-10 text-left text-sm text-secondary-foreground transition hover:bg-surface hover:text-foreground"
          >
            <Folder className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{name}</span>
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export const Default: Story = {
  render: () => <MoveToFolder />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Move to folder/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("button", { name: "Archive" })).toBeNull();
  },
};

export const Open: Story = {
  render: () => <MoveToFolder />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Move to folder/ });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panelId = trigger.getAttribute("aria-controls");
    await expect(panelId).toBeTruthy();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Archive" })).toBeVisible());
    await expect(
      canvas.getByRole("button", { name: "Archive" }).closest(`[id="${panelId}"]`),
    ).not.toBeNull();
  },
};

// Enter opens, Space closes; focus stays on the trigger.
export const Keyboard: Story = {
  render: () => <MoveToFolder />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Move to folder/ });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    await expect(canvas.getByRole("button", { name: "Shared" })).toBeVisible();
    await userEvent.keyboard(" ");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await expect(canvas.queryByRole("button", { name: "Shared" })).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

export const DefaultOpen: Story = {
  render: () => <MoveToFolder defaultOpen />,
};
