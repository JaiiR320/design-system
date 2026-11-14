import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileCode, SquareTerminal } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "#components/code-block";

const meta = {
  title: "Primitives/CodeBlock",
  component: CodeBlock,
  args: { variant: "default", size: "md" },
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
    size: { control: "select", options: ["md", "sm"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[560px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const source = `export function parseDate(input: string) {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(\`Invalid date: \${input}\`);
  }
  return date;
}`;

// File name in the header, copy button at its end.
export const Default: Story = {
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <FileCode />
          src/lib/date.ts
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={source} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{source}</CodeBlockContent>
    </CodeBlock>
  ),
};

// No header: actions float over the corner and appear on hover or focus.
export const FloatingActions: Story = {
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockActions>
        <CodeBlockCopyButton value="pnpm add date-fns" />
      </CodeBlockActions>
      <CodeBlockContent>pnpm add date-fns</CodeBlockContent>
    </CodeBlock>
  ),
};

export const FloatingActionsFocused: Story = {
  tags: ["!dev", "!autodocs"],
  render: FloatingActions.render,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Copy" });
    // The actions come first in tab order, before the scrollable code.
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button.parentElement!).opacity).toBe("1");
  },
};

export const LineNumbers: Story = {
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockContent lineNumbers startLine={12}>
        {source}
      </CodeBlockContent>
    </CodeBlock>
  ),
};

// Pass lines yourself to mark a diff. Highlighted tokens from shiki go in the same place.
export const Diff: Story = {
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <CodeBlockTitle>src/lib/date.ts</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>
        <CodeBlockLine>{"if (Number.isNaN(date.getTime())) {"}</CodeBlockLine>
        <CodeBlockLine variant="removed">{"  return null;"}</CodeBlockLine>
        <CodeBlockLine variant="added">
          {"  throw new RangeError(`Invalid date: ${input}`);"}
        </CodeBlockLine>
        <CodeBlockLine>{"}"}</CodeBlockLine>
        <CodeBlockLine />
        <CodeBlockLine variant="highlighted">{"return date;"}</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  ),
};

// Failed command output.
export const Destructive: Story = {
  args: { variant: "destructive", size: "sm" },
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <SquareTerminal />
          pnpm lint
        </CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent>
        {"src/lib/date.ts:4:7  error  'offset' is never used\n1 problem (1 error)"}
      </CodeBlockContent>
    </CodeBlock>
  ),
};

const longLine =
  "Error: connect ECONNREFUSED 127.0.0.1:5432 at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1611:16)";

export const Overflow: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <CodeBlock {...args}>
        <CodeBlockContent>{longLine}</CodeBlockContent>
      </CodeBlock>
      <CodeBlock {...args}>
        <CodeBlockContent wrap>{longLine}</CodeBlockContent>
      </CodeBlock>
    </div>
  ),
};

export const Copy: Story = {
  tags: ["!dev", "!autodocs"],
  render: Default.render,
  play: async ({ canvasElement }) => {
    const writeText = fn(async (_text: string) => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await expect(writeText).toHaveBeenCalledWith(source);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Copy" })).toHaveAttribute("data-copied"),
    );
  },
};
