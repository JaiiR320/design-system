import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, History } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#components/empty";

// Plain stand-in for a bordered button (Button is a separate module).
const button =
  "inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm text-secondary-foreground transition hover:border-border-strong hover:bg-surface hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const meta = {
  title: "Primitives/Empty",
  component: Empty,
  args: { variant: "plain" },
  argTypes: { variant: { control: "select", options: ["plain", "inset", "outline"] } },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Empty {...args} className="w-96">
      <EmptyMedia>
        <History className="size-6 text-muted-foreground" strokeWidth={1.75} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No saves yet</EmptyTitle>
        <EmptyDescription>Save the document to start its history.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <button type="button" className={button}>
          Save
        </button>
        <button type="button" className={button}>
          Import
        </button>
      </EmptyContent>
    </Empty>
  ),
};

const variants = ["plain", "inset", "outline"] as const;

export const Variants: Story = {
  render: () => (
    <div className="grid w-[48rem] grid-cols-3 gap-3">
      {variants.map((variant) => (
        <Empty key={variant} variant={variant} className="min-h-40 px-5">
          <EmptyHeader>
            <EmptyTitle>{variant}</EmptyTitle>
            <EmptyDescription>Nothing here yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ))}
    </div>
  ),
};

// Local compositions: list, drop zone, success media. Geometry stays caller-owned.
export const Compositions: Story = {
  render: () => (
    <div className="grid w-[56rem] grid-cols-3 items-start gap-4">
      <Empty className="min-h-64 bg-surface/40 px-5 font-semibold">
        <EmptyTitle>No items</EmptyTitle>
      </Empty>
      <Empty className="min-h-64 gap-3 rounded-xl bg-surface/25 px-4 font-semibold text-faint-foreground">
        <EmptyTitle className="text-faint-foreground">Drop a folder here</EmptyTitle>
      </Empty>
      <Empty variant="outline" className="rounded-2xl p-8">
        <EmptyMedia className="size-12 rounded-full bg-info-surface/40 text-primary">
          <Check className="size-6" strokeWidth={1.75} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle className="text-foreground">Feedback sent</EmptyTitle>
          <EmptyDescription className="text-subtle-foreground">
            Thanks for helping improve Atlas.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <Empty variant="outline" className="w-56 p-4">
      <EmptyHeader>
        <EmptyTitle>Nothing matches the current filters</EmptyTitle>
        <EmptyDescription>Try clearing filters or searching for another document.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <button type="button" className={button}>
          Clear filters
        </button>
        <button type="button" className={button}>
          Search
        </button>
      </EmptyContent>
    </Empty>
  ),
};
