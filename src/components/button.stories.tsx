import { Collapsible } from "@base-ui/react/collapsible";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Ellipsis, Plus, Settings, Trash2, TriangleAlert, X } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "#components/button";
import { Spinner } from "#components/spinner";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Button", onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = [
  "default",
  "outline",
  "ghost",
  "icon-ghost",
  "destructive",
  "destructive-outline",
  "destructive-ghost",
  "warning",
  "warning-ghost",
  "raised",
] as const;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex w-[560px] flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant) => (
          <div key={variant} className="flex items-center gap-3">
            <Button variant={variant}>{variant}</Button>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button variant="link" size="none">
            link
          </Button>
        </div>
      </div>
      {/* Gradient stands in for card artwork behind the on-image variants. */}
      <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-cyan-900 via-zinc-700 to-amber-800 p-4">
        <Button variant="glass">glass</Button>
        <div className="flex overflow-hidden rounded-lg border border-on-image-border/20 bg-on-image/60">
          <Button variant="overlay" size="icon-sm" aria-label="Add one">
            <Plus strokeWidth={1.75} />
          </Button>
          <Button variant="overlay" size="icon-sm" aria-label="More actions">
            <Ellipsis strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button variant="link" size="none">
          none
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="icon-ghost" size="icon-xs" aria-label="Remove (icon-xs)">
          <X className="size-3.5" strokeWidth={1.75} />
        </Button>
        <Button size="icon-sm" aria-label="Settings (icon-sm)">
          <Settings strokeWidth={1.75} />
        </Button>
        <Button size="icon" aria-label="Settings (icon)">
          <Settings strokeWidth={1.75} />
        </Button>
        <Button variant="raised" size="icon-lg" aria-label="Send feedback (icon-lg)">
          <Plus className="size-5" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" aria-label="Settings">
        <Settings strokeWidth={1.75} />
      </Button>
      <Button variant="icon-ghost" size="icon" aria-label="More actions">
        <Ellipsis strokeWidth={1.75} />
      </Button>
      <Button variant="destructive-ghost" size="icon" aria-label="Delete">
        <Trash2 strokeWidth={1.75} />
      </Button>
      <Button variant="warning-ghost" size="icon" aria-label="Warning">
        <TriangleAlert strokeWidth={1.75} />
      </Button>
      <Button variant="default" size="icon-sm" aria-label="Add">
        <Plus strokeWidth={1.75} />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="default">
        <Plus strokeWidth={1.75} />
        New Deck
      </Button>
      <Button>
        <Download strokeWidth={1.75} />
        Export
      </Button>
      <Button variant="outline" size="lg" className="w-72 justify-start text-left">
        <Download className="size-5 text-muted-foreground" strokeWidth={1.75} />
        Export deck list
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button variant="default" disabled onClick={args.onClick}>
        default
      </Button>
      <Button disabled onClick={args.onClick}>
        outline
      </Button>
      <Button variant="destructive" disabled onClick={args.onClick}>
        destructive
      </Button>
      <Button variant="icon-ghost" size="icon" disabled aria-label="Delete" onClick={args.onClick}>
        <Trash2 strokeWidth={1.75} />
      </Button>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "default" });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  render: () => (
    <Button variant="default" disabled aria-busy="true">
      <Spinner />
      Signing in
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Signing in" });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toBeDisabled();
  },
};

export const AsLink: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button render={<a href="#x" />} nativeButton={false}>
        Decks
      </Button>
      <Button
        render={<a href="#x" aria-current="page" />}
        nativeButton={false}
        className="aria-[current=page]:border-selected-border aria-[current=page]:bg-selected aria-[current=page]:text-selected-foreground"
      >
        Current
      </Button>
      <Button variant="link" size="none" render={<a href="#x" />} nativeButton={false}>
        Open an issue
      </Button>
      <Button render={<a href="#x" />} nativeButton={false} disabled>
        Disabled link
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Decks" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "#x");
    await expect(link).not.toHaveAttribute("type");
    const disabled = canvas.getByRole("link", { name: "Disabled link" });
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(disabled).not.toHaveAttribute("disabled");
  },
};

export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Button" });
    await expect(button).toHaveAttribute("type", "button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const AsTrigger: Story = {
  render: (args) => (
    <Collapsible.Root className="flex w-72 flex-col gap-2">
      <Collapsible.Trigger render={<Button onClick={args.onClick} />}>
        Move to folder
      </Collapsible.Trigger>
      <Collapsible.Panel className="text-sm text-muted-foreground">Root</Collapsible.Panel>
    </Collapsible.Root>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(1);
    const trigger = canvas.getByRole("button", { name: "Move to folder" });
    await expect(trigger).toHaveAttribute("data-slot", "button");
    await userEvent.click(trigger);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("Root")).toBeVisible();
  },
};
