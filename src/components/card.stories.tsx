import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal } from "lucide-react";
import { expect, within } from "storybook/test";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#components/card";

// Plain stand-in for DeckDiff's icon button (Button is a separate module).
const iconButton =
  "inline-flex size-8 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-surface hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const meta = {
  title: "Primitives/Card",
  component: Card,
  args: { variant: "default", padding: "md" },
  argTypes: {
    variant: { control: "select", options: ["default", "inset", "glass", "outline", "panel"] },
    padding: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-96 space-y-3">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Deck colors</CardTitle>
          <CardDescription>Used to clamp flexible mana production stats.</CardDescription>
        </div>
        <CardAction>
          <button type="button" aria-label="Deck color actions" className={iconButton}>
            <MoreHorizontal className="size-4" strokeWidth={1.75} />
          </button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-secondary-foreground">
        White, blue, black and green are selected.
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">Saved with the deck.</CardFooter>
    </Card>
  ),
};

const variants = ["default", "inset", "outline", "panel"] as const;

export const Variants: Story = {
  render: () => (
    <div className="grid w-[45rem] grid-cols-4 gap-3">
      {variants.map((variant) => (
        <Card key={variant} variant={variant} padding="md" className="space-y-1">
          <CardTitle>{variant}</CardTitle>
          <CardDescription>Card surface</CardDescription>
        </Card>
      ))}
    </div>
  ),
};

const paddings = ["none", "sm", "md", "lg", "xl"] as const;

export const Paddings: Story = {
  render: () => (
    <div className="flex items-start gap-3">
      {paddings.map((padding) => (
        <Card key={padding} padding={padding}>
          <div className="rounded-lg bg-surface px-2 py-1 text-xs text-subtle-foreground">
            {padding}
          </div>
        </Card>
      ))}
    </div>
  ),
};

// Editor shell: a section with a local header band; the band styling is caller-owned.
export const HeaderBand: Story = {
  render: () => (
    <Card render={<section aria-labelledby="ramp-title" />} className="w-96 overflow-hidden">
      <CardHeader className="items-center border-b bg-surface/80 px-3 py-1.5">
        <CardTitle
          render={<h2 id="ramp-title" />}
          className="text-xs tracking-label text-subtle-foreground uppercase"
        >
          Ramp
        </CardTitle>
        <CardAction className="text-xs text-muted-foreground">12</CardAction>
      </CardHeader>
      <CardContent className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
        Card stack
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Ramp" });
    await expect(region.tagName).toBe("SECTION");
    await expect(region).toHaveAttribute("data-slot", "card");
    await expect(canvas.getByRole("heading", { level: 2, name: "Ramp" })).toBeVisible();
  },
};

// Translucent and rounder panels are caller overrides, not variants.
export const PanelOverrides: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <Card padding="lg" className="w-72 rounded-3xl bg-card/90 shadow-2xl shadow-black/40">
        <CardTitle render={<h2 />} className="text-lg">
          Sign in
        </CardTitle>
        <CardDescription className="mt-1">rounded-3xl, 90% surface.</CardDescription>
      </Card>
      <Card padding="md" className="w-72 rounded-2xl bg-card/70 shadow-2xl shadow-black/20">
        <CardTitle render={<h2 />}>Judge</CardTitle>
        <CardDescription className="mt-1">rounded-2xl, 70% surface.</CardDescription>
      </Card>
      <Card variant="panel" padding="md" className="w-72">
        <CardTitle render={<h2 />}>Editor</CardTitle>
        <CardDescription className="mt-1">Panel variant.</CardDescription>
      </Card>
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <Card variant="inset" padding="md" className="w-56">
      <CardHeader>
        <CardTitle>A long title that wraps across lines</CardTitle>
        <CardAction className="text-xs text-muted-foreground">Action</CardAction>
      </CardHeader>
      <CardDescription className="mt-1">
        Description text wraps inside a narrow card.
      </CardDescription>
    </Card>
  ),
};
