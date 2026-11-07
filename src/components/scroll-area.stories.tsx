import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaViewport,
  ScrollBar,
} from "#components/scroll-area";

const meta = {
  title: "Primitives/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const rules = Array.from({ length: 24 }, (_, index) => `Rule 100.${index + 1}`);
const cards = Array.from({ length: 14 }, (_, index) => `Card ${index + 1}`);

function VerticalList() {
  return (
    <ScrollArea className="h-56 w-64 rounded-xl border border-border">
      <ScrollAreaViewport tabIndex={0} role="region" aria-label="Rules">
        <ul className="space-y-1 p-3 text-sm text-secondary-foreground">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </ScrollAreaViewport>
      <ScrollBar />
    </ScrollArea>
  );
}

export const Vertical: Story = {
  render: () => <VerticalList />,
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-[28rem] rounded-xl border border-border">
      <ScrollAreaViewport tabIndex={0} role="region" aria-label="Search results">
        <div className="flex gap-3 p-3">
          {cards.map((card) => (
            <div
              key={card}
              className="flex aspect-[488/680] w-24 shrink-0 items-end rounded-lg bg-surface p-2 text-xs text-subtle-foreground"
            >
              {card}
            </div>
          ))}
        </div>
      </ScrollAreaViewport>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const BothAxes: Story = {
  render: () => (
    <ScrollArea className="h-56 w-80 rounded-xl border border-border">
      <ScrollAreaViewport tabIndex={0} role="region" aria-label="Price table">
        <table className="w-[36rem] text-left text-sm text-secondary-foreground">
          <tbody>
            {rules.map((rule, index) => (
              <tr key={rule} className="border-b border-border-subtle">
                <td className="px-3 py-1.5">{rule}</td>
                <td className="px-3 py-1.5 text-muted-foreground">Set {index + 1}</td>
                <td className="px-3 py-1.5 text-right">{index + 1}.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollAreaViewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaCorner />
    </ScrollArea>
  ),
};

// Tab reaches the viewport (focus ring), then Tab moves on: no focus trap.
export const KeyboardFocus: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <VerticalList />
      <button
        type="button"
        className="rounded-lg border border-border px-3 py-2 text-sm text-secondary-foreground"
      >
        After
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Rules" });
    await userEvent.tab();
    await expect(viewport).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(viewport).toHaveFocus();
  },
};

// The viewport is the native scroller; the custom thumb follows its position.
export const Scrolled: Story = {
  render: () => <VerticalList />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Rules" });
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    viewport.scrollTop = viewport.scrollHeight;
    await waitFor(() => expect(canvas.getByText("Rule 100.24")).toBeVisible());
    const thumb = canvasElement.querySelector<HTMLElement>("[data-slot=scroll-area-thumb]");
    await waitFor(() => expect(thumb?.style.transform ?? "").toMatch(/translate3d\(0px, [1-9]/));
  },
};
