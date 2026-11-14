import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpRight, Brain, FileText, ListChecks, Search, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { CodeBlock, CodeBlockContent } from "#components/code-block";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "#components/trace";

const meta = {
  title: "Primitives/Trace",
  component: Trace,
  decorators: [
    (Story) => (
      <div className="w-[560px] text-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Trace>;

export default meta;
type Story = StoryObj<typeof meta>;

// An agent's chain of thought: reasoning, then the steps it took, newest last.
function ChainOfThought() {
  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Brain />
            </TraceIcon>
            <TraceTitle>Thought for 6s</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          The failing test imports the date helper, so the bug is likely in how it parses timezones.
          Read the helper first, then run only that test.
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine>
        <TraceIcon>
          <Search />
        </TraceIcon>
        <TraceTitle>Searched for parseDate</TraceTitle>
        <TraceDescription>4 results</TraceDescription>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <FileText />
        </TraceIcon>
        <TraceTitle>Read src/lib/date.ts</TraceTitle>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <SquareTerminal />
            </TraceIcon>
            <TraceTitle>Ran pnpm test date</TraceTitle>
            <TraceDescription>1.2s</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm">
            <CodeBlockContent>{"PASS parses UTC\nPASS parses offsets\n2 passed"}</CodeBlockContent>
          </CodeBlock>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="running">
        <TraceIcon>
          <SquareTerminal />
        </TraceIcon>
        <TraceTitle>Running pnpm lint</TraceTitle>
      </TraceLine>
    </Trace>
  );
}

export const Default: Story = {
  render: () => <ChainOfThought />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Thought for 6s/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Plain lines are text, not tab stops.
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
  },
};

export const Opened: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <ChainOfThought />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Ran pnpm test date/ }));
    await waitFor(() => expect(canvas.getByText(/2 passed/)).toBeVisible());
    await userEvent.tab();
    // The code output is focusable so it can scroll by keyboard.
    await expect(canvas.getByText(/2 passed/).closest("pre")).toHaveFocus();
  },
};

// Done (no status), running, error and pending. Each title says its state in words too.
export const Statuses: Story = {
  render: () => (
    <Trace>
      <TraceLine>
        <TraceIcon>
          <SquareTerminal />
        </TraceIcon>
        <TraceTitle>Ran pnpm install</TraceTitle>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon>
          <SquareTerminal />
        </TraceIcon>
        <TraceTitle>Running pnpm build</TraceTitle>
      </TraceLine>
      <TraceLine status="error">
        <TraceIcon>
          <SquareTerminal />
        </TraceIcon>
        <TraceTitle>Failed to run pnpm lint</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon>
          <SquareTerminal />
        </TraceIcon>
        <TraceTitle>Run pnpm test</TraceTitle>
      </TraceLine>
    </Trace>
  ),
};

// A plan: done, running, then pending steps, nested under one collapsible step.
export const Plan: Story = {
  render: () => (
    <Trace>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <ListChecks />
            </TraceIcon>
            <TraceTitle>Plan</TraceTitle>
            <TraceDescription>1 of 4</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            <TraceLine>
              <TraceTitle>Reproduce the timezone bug</TraceTitle>
            </TraceLine>
            <TraceLine status="running">
              <TraceTitle>Fixing offset parsing</TraceTitle>
            </TraceLine>
            <TraceLine status="pending">
              <TraceTitle>Add a regression test</TraceTitle>
            </TraceLine>
            <TraceLine status="pending">
              <TraceTitle>Run the full suite</TraceTitle>
            </TraceLine>
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  ),
};

// A line inside a link: the icon after the title is an indicator.
export const AsLink: Story = {
  render: () => (
    <Trace>
      <a href="#docs">
        <TraceLine>
          <TraceTitle>Read the date-fns docs</TraceTitle>
          <TraceIcon>
            <ArrowUpRight />
          </TraceIcon>
        </TraceLine>
      </a>
    </Trace>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /Read the date-fns docs/ });
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

// Reasoning that opens while it streams; the user's click wins from then on.
function StreamingReasoning() {
  const [running, setRunning] = useState(true);
  const [open, setOpen] = useState<boolean>();
  return (
    <div className="flex flex-col items-start gap-4">
      <Trace>
        <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
          <TraceCollapsibleTrigger>
            <TraceLine status={running ? "running" : undefined}>
              <TraceIcon>
                <Brain />
              </TraceIcon>
              <TraceTitle>{running ? "Thinking" : "Thought for 3s"}</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            Checking whether the parser handles negative offsets.
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
      <button
        type="button"
        className="text-xs text-faint-foreground underline"
        onClick={() => setRunning(false)}
      >
        Finish
      </button>
    </div>
  );
}

export const StreamingOpenState: Story = {
  render: () => <StreamingReasoning />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /Thinking/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};

export const StreamingFinishes: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <StreamingReasoning />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Finish" }));
    const trigger = canvas.getByRole("button", { name: /Thought for 3s/ });
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
