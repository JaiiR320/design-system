import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  args: { defaultValue: "editor", onValueChange: fn() },
  // The header owns the full-width bottom border; the tablist stays borderless.
  render: (args) => (
    <Tabs {...args} className="w-[640px]">
      <div className="flex border-b border-border">
        <TabsList aria-label="Deck views">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="editor" className="p-4 text-sm text-subtle-foreground">
        Editor panel
      </TabsContent>
      <TabsContent value="history" className="p-4 text-sm text-subtle-foreground">
        History panel
      </TabsContent>
      <TabsContent value="stats" className="p-4 text-sm text-subtle-foreground">
        Stats panel
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-[640px]">
      <div className="flex border-b border-border">
        <TabsList aria-label="Deck settings">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="archived" disabled>
            Archived
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  ),
};

// Arrows only move focus; Enter/Space selects. Home/End jump to the ends.
export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tablist", { name: "Deck views" })).toBeInTheDocument();
    const editor = canvas.getByRole("tab", { name: "Editor" });
    const history = canvas.getByRole("tab", { name: "History" });
    const stats = canvas.getByRole("tab", { name: "Stats" });

    await userEvent.tab();
    await expect(editor).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(history).toHaveFocus();
    await expect(editor).toHaveAttribute("aria-selected", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard("{End}");
    await expect(stats).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(editor).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{Enter}");
    await expect(history).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "History" })).toHaveTextContent(
      "History panel",
    );

    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard(" ");
    await expect(stats).toHaveAttribute("aria-selected", "true");
    await expect(stats).toHaveAttribute("data-active");
    // Base UI unmounts the old panel after its exit frame.
    await waitFor(() => expect(canvas.queryByText("History panel")).not.toBeInTheDocument());
  },
};

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-secondary-foreground"
      onClick={() => setCount((value) => value + 1)}
    >
      Compared {count}
    </button>
  );
}

// Inactive panels unmount, so panel-local state (like history compare selection) resets.
export const PanelReset: Story = {
  render: () => (
    <Tabs defaultValue="history" className="w-[640px]">
      <div className="flex border-b border-border">
        <TabsList aria-label="Deck views">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="editor" className="p-4 text-sm text-subtle-foreground">
        Editor panel
      </TabsContent>
      <TabsContent value="history" className="p-4">
        <Counter />
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Compared 0" }));
    await expect(canvas.getByRole("button", { name: "Compared 1" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "Editor" }));
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: /Compared/ })).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole("tab", { name: "History" }));
    await expect(await canvas.findByRole("button", { name: "Compared 0" })).toBeInTheDocument();
  },
};

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(within(canvasElement).getByRole("tab", { name: "History" })).toHaveFocus();
  },
};
