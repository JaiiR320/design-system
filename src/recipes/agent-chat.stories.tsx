import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowUp,
  Brain,
  Copy,
  FileText,
  Paperclip,
  RotateCcw,
  Search,
  Square,
  SquareTerminal,
} from "lucide-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "#components/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "#components/code-block";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "#components/input-group";
import { Message, MessageBubble, MessageContent, MessageFooter } from "#components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "#components/message-scroller";
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

// An agent chat built only from primitives: a pinned conversation, each agent turn's chain of
// thought as a Trace, a diff in a CodeBlock, and a prompt input on InputGroup.
// Enter sends, Shift+Enter adds a line. While the agent runs, Send becomes Stop.
// Wire `send` and `stop` to your agent; this story fakes a reply that runs until stopped.

type Turn =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "agent"; done: boolean };

const fix = `const offset = /([+-])(\\d{2}):?(\\d{2})$/;`;

function FirstReply() {
  return (
    <>
      <Trace>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <Brain />
              </TraceIcon>
              <TraceTitle>Thought for 4s</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            The input has a colon in its offset. Check which offset forms the parser accepts.
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
        <TraceLine>
          <TraceIcon>
            <SquareTerminal />
          </TraceIcon>
          <TraceTitle>Ran pnpm test date</TraceTitle>
          <TraceDescription>1.2s</TraceDescription>
        </TraceLine>
      </Trace>
      <p className="leading-relaxed">
        The offset pattern only accepted <code>+0530</code>. I made the colon optional:
      </p>
      <CodeBlock size="sm">
        <CodeBlockHeader>
          <CodeBlockTitle>src/lib/date.ts</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={fix} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>
          <CodeBlockLine variant="removed">{"const offset = /([+-])(\\d{4})$/;"}</CodeBlockLine>
          <CodeBlockLine variant="added">{fix}</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
      <MessageFooter>
        <Button variant="ghost" size="icon-sm" aria-label="Copy reply">
          <Copy />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Retry">
          <RotateCcw />
        </Button>
      </MessageFooter>
    </>
  );
}

// A reply in progress: reasoning opens while it runs; the user can still close it.
function PendingReply({ done }: { done: boolean }) {
  const [open, setOpen] = useState<boolean>();
  return (
    <Trace>
      <TraceCollapsible open={open ?? !done} onOpenChange={setOpen}>
        <TraceCollapsibleTrigger>
          <TraceLine status={done ? undefined : "running"}>
            <TraceIcon>
              <Brain />
            </TraceIcon>
            <TraceTitle>{done ? "Stopped" : "Thinking"}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Looking for the call sites of parseDate.</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

const seed: Turn[] = [
  { id: 0, role: "user", text: "Why does parseDate return null for 2026-11-10T09:00+05:30?" },
  { id: 1, role: "agent", done: true },
];

function PromptInput({
  running,
  onSend,
  onStop,
}: {
  running: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [text, setText] = useState("");
  const { scrollToEnd } = useMessageScroller();
  const send = () => {
    if (!text.trim() || running) return;
    onSend(text.trim());
    setText("");
    scrollToEnd();
  };
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          aria-label="Message"
          placeholder="Ask the agent"
          rows={2}
          value={text}
          onValueChange={setText}
          submitShortcut="enter"
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-sm" aria-label="Attach file">
            <Paperclip />
          </InputGroupButton>
          {running ? (
            <InputGroupButton
              variant="outline"
              size="icon-sm"
              className="ms-auto rounded-full"
              aria-label="Stop"
              onClick={onStop}
            >
              <Square />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              className="ms-auto rounded-full"
              aria-label="Send"
              disabled={!text.trim()}
            >
              <ArrowUp />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

function AgentChat() {
  const [turns, setTurns] = useState<Turn[]>(seed);
  const running = turns.some((turn) => turn.role === "agent" && !turn.done);
  return (
    <MessageScrollerProvider>
      <div className="flex h-[640px] w-[720px] flex-col gap-3 rounded-xl border border-border p-3 text-sm">
        <MessageScroller className="flex-1">
          <MessageScrollerViewport aria-label="Conversation">
            <MessageScrollerContent className="p-3">
              {turns.map((turn) =>
                turn.role === "user" ? (
                  <Message key={turn.id} align="end">
                    <MessageContent>
                      <MessageBubble>{turn.text}</MessageBubble>
                    </MessageContent>
                  </Message>
                ) : (
                  <Message key={turn.id}>
                    <MessageContent className="gap-3">
                      {turn.id === 1 ? <FirstReply /> : <PendingReply done={turn.done} />}
                    </MessageContent>
                  </Message>
                ),
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <PromptInput
          running={running}
          onSend={(text) =>
            setTurns((current) => [
              ...current,
              { id: current.length, role: "user", text },
              { id: current.length + 1, role: "agent", done: false },
            ])
          }
          onStop={() =>
            setTurns((current) =>
              current.map((turn) => (turn.role === "agent" ? { ...turn, done: true } : turn)),
            )
          }
        />
      </div>
    </MessageScrollerProvider>
  );
}

const meta = {
  title: "Recipes/AgentChat",
  render: () => <AgentChat />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
  },
};

// Enter sends and pins the conversation; Send turns into Stop while the agent runs.
export const SendAndStop: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Now find the callers");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}and fix them");
    await expect(input).toHaveValue("Now find the callers\nand fix them");
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("");
    await expect(canvas.getByText(/Now find the callers/)).toBeVisible();
    const thinking = canvas.getByRole("button", { name: /Thinking/ });
    await expect(thinking).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Stop" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /Stopped/ })).toHaveAttribute(
        "aria-expanded",
        "false",
      ),
    );
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
  },
};
