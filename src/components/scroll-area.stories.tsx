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

const documents = Array.from({ length: 24 }, (_, index) => `Document ${index + 1}`);
const files = Array.from({ length: 14 }, (_, index) => `File ${index + 1}`);

function VerticalList() {
  return (
    <ScrollArea className="h-56 w-64 rounded-xl border border-border">
      <ScrollAreaViewport tabIndex={0} role="region" aria-label="Documents">
        <ul className="space-y-1 p-3 text-sm text-secondary-foreground">
          {documents.map((name) => (
            <li key={name}>{name}</li>
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
          {files.map((file) => (
            <div
              key={file}
              className="flex aspect-[3/4] w-24 shrink-0 items-end rounded-lg bg-surface p-2 text-xs text-subtle-foreground"
            >
              {file}
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
      <ScrollAreaViewport tabIndex={0} role="region" aria-label="Activity table">
        <table className="w-[36rem] text-left text-sm text-secondary-foreground">
          <tbody>
            {documents.map((name, index) => (
              <tr key={name} className="border-b border-border-subtle">
                <td className="px-3 py-1.5">{name}</td>
                <td className="px-3 py-1.5 text-muted-foreground">Version {index + 1}</td>
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
    const viewport = canvas.getByRole("region", { name: "Documents" });
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
    const viewport = canvas.getByRole("region", { name: "Documents" });
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    // Scroll only once the thumb is measured; an earlier scroll event is lost.
    const thumb = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>("[data-slot=scroll-area-thumb]");
      expect(element?.style.transform).toBe("translate3d(0px, 0px, 0px)");
      return element;
    });
    viewport.scrollTop = viewport.scrollHeight;
    await waitFor(() => expect(canvas.getByText("Document 24")).toBeVisible());
    await waitFor(() => expect(thumb?.style.transform ?? "").toMatch(/translate3d\(0px, [1-9]/));
  },
};
