import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Badge } from "#components/badge";
import { Button } from "#components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "#components/item";
import { Toggle } from "#components/toggle";

const meta = {
  title: "Primitives/Item",
  component: Item,
  args: { variant: "outline", size: "md" },
  argTypes: {
    variant: { control: "select", options: ["outline", "muted", "plain"] },
    size: { control: "select", options: ["md", "sm"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Item>;

// App-owned look layered on Badge with variant={null}: a numbered step marker.
const stepLook =
  "flex size-6 items-center justify-center rounded-full bg-secondary p-0 text-xs font-semibold text-muted-foreground data-selected:bg-primary data-selected:text-primary-foreground";

export default meta;
type Story = StoryObj<typeof meta>;

// A history row: title + timestamp on the left, Restore on the right.
export const Default: Story = {
  render: (args) => (
    <Item {...args}>
      <ItemContent>
        <ItemTitle>Initial draft</ItemTitle>
        <ItemDescription>Nov 7, 2026, 12:59 AM</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="xs">Restore</Button>
      </ItemActions>
    </Item>
  ),
};

function Row({ label }: { label: string }) {
  return (
    <ItemContent>
      <ItemTitle>{label}</ItemTitle>
      <ItemDescription>Description text</ItemDescription>
    </ItemContent>
  );
}

export const Variants: Story = {
  render: () => (
    <ItemGroup>
      <Item variant="outline">
        <Row label="outline md" />
      </Item>
      <Item variant="outline" data-selected="">
        <Row label="outline md data-selected" />
      </Item>
      <Item variant="muted">
        <Row label="muted md" />
      </Item>
      <Item variant="plain">
        <Row label="plain md" />
      </Item>
      <Item variant="outline" size="sm">
        <Row label="outline sm" />
      </Item>
      <Item variant="muted" size="sm">
        <Row label="muted sm" />
      </Item>
      <Item variant="plain" size="sm">
        <Row label="plain sm" />
      </Item>
    </ItemGroup>
  ),
};

// Settings rows inside an inset well: label/description with a control, split by separators.
export const SettingsRows: Story = {
  render: () => (
    <div className="rounded-xl border border-border bg-muted p-4">
      <ItemGroup className="gap-3">
        <Item variant="plain" size="sm" className="p-0">
          <ItemContent>
            <ItemTitle>Cover image</ItemTitle>
            <ItemDescription>Shown on the project card.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="xs">Edit crop</Button>
            <Button size="xs" variant="destructive-outline">
              Clear
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item variant="plain" size="sm" className="p-0">
          <ItemMedia className="size-10 rounded-lg bg-surface" />
          <ItemContent>
            <ItemTitle>Atlas</ItemTitle>
            <ItemDescription>2 folders | 5 documents</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

// Polymorphic roots: a link row keeps its href/link role; a plain row has no role.
export const AsLink: Story = {
  render: () => (
    <ItemGroup>
      <Item render={<a href="#atlas" />}>
        <ItemContent>
          <ItemTitle>Atlas</ItemTitle>
          <ItemDescription>Open folder</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /Atlas/ });
    await expect(link).toHaveAttribute("href", "#atlas");
    await expect(link).toHaveAttribute("data-slot", "item");
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

const saves = [
  { id: "s2", label: "Revise launch plan", savedAt: "Nov 7, 2026, 01:00 AM" },
  { id: "s1", label: "Initial draft", savedAt: "Nov 7, 2026, 12:59 AM" },
  { id: "s0", label: "Version 3", savedAt: "Nov 6, 2026, 11:42 PM" },
];

// Background of every :hover rule that would apply to this element (nested rules resolved).
function hoverBackgrounds(element: Element) {
  const found: string[] = [];
  const walk = (rules: CSSRuleList, parent: string) => {
    for (const rule of rules) {
      let selector = parent;
      if (rule instanceof CSSStyleRule) {
        selector = parent ? rule.selectorText.replaceAll("&", parent) : rule.selectorText;
        const background = rule.style.backgroundColor;
        // Drop real :hover pseudo-classes, not the escaped `\:hover` inside variant class names.
        const plain = selector.replace(/(?<!\\):hover/g, "");
        if (background && plain !== selector && element.matches(plain)) found.push(background);
      }
      if ("cssRules" in rule && rule.cssRules instanceof CSSRuleList) walk(rule.cssRules, selector);
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules, "");
  return found;
}

// History compare mode: each row is one Toggle (aria-pressed), never a nested button.
// Titles inherit 16px/24px and unselected rows hover with the border only,
// so Toggle's off-state hover fill is overridden on the row.
export const CompareSelection: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState(["s1"]);
      return (
        <ItemGroup role="group" aria-label="Versions to compare">
          {saves.map((save) => {
            const order = selected.indexOf(save.id) + 1;
            return (
              <Item
                key={save.id}
                className="not-data-pressed:hover:bg-background"
                render={
                  <Toggle
                    pressed={order > 0}
                    onPressedChange={(pressed) =>
                      setSelected((current) =>
                        pressed ? [...current, save.id] : current.filter((id) => id !== save.id),
                      )
                    }
                  />
                }
              >
                <div className="flex items-center gap-3">
                  <ItemMedia>
                    <Badge
                      variant={null}
                      className={stepLook}
                      data-selected={order > 0 ? "" : undefined}
                    >
                      {order > 0 ? order : ""}
                    </Badge>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{save.label}</ItemTitle>
                    <ItemDescription className="mt-0">{save.savedAt}</ItemDescription>
                  </ItemContent>
                </div>
              </Item>
            );
          })}
        </ItemGroup>
      );
    }
    return <Example />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole("button", { name: /Revise launch plan/ });
    await expect(row).toHaveAttribute("aria-pressed", "false");
    // Unselected hover changes only the border; the fill stays the row background.
    await expect(hoverBackgrounds(row).filter((value) => !value.includes("background"))).toEqual(
      [],
    );
    const title = within(row).getByText("Revise launch plan");
    await expect(getComputedStyle(title).fontSize).toBe("16px");
    await expect(getComputedStyle(title).lineHeight).toBe("24px");
    const timestamp = within(row).getByText("Nov 7, 2026, 01:00 AM");
    await expect(getComputedStyle(timestamp).fontSize).toBe("14px");
    await userEvent.click(row);
    await expect(row).toHaveAttribute("aria-pressed", "true");
    await expect(row.querySelector("button")).toBeNull();
    // Keyboard: Tab moves to the next row.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: /Initial draft/ })).toHaveFocus();
  },
};
