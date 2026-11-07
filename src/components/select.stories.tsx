import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "#components/select";

const groupOptions = [
  { value: "categories", label: "Categories" },
  { value: "type", label: "Type" },
  { value: "manaValue", label: "Mana value" },
];

const sortOptions = [
  { value: "manaValue", label: "Mana value" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "price", label: "Price" },
  { value: "edhrecRank", label: "EDHREC rank" },
];

const printingOptions = [
  { value: "date", label: "Edition date" },
  { value: "set", label: "Set Name" },
  { value: "price", label: "Price" },
];

const meta = {
  title: "Primitives/Select",
  component: Select,
  args: { onValueChange: fn() },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

export const Default: Story = {
  render: (args) => (
    <Select items={groupOptions} defaultValue="categories" onValueChange={args.onValueChange}>
      <SelectTrigger aria-label="Group cards" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {groupOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

/** Closed triggers at DeckDiff's call-site widths, plus placeholder, disabled and invalid. */
export const States: Story = {
  render: () => (
    <div className="grid w-[480px] gap-4">
      <div className="flex items-center gap-2">
        <Select items={groupOptions} defaultValue="categories">
          <SelectTrigger aria-label="Group cards" className="w-40">
            <SelectValue />
          </SelectTrigger>
        </Select>
        <Select items={sortOptions} defaultValue="manaValue">
          <SelectTrigger aria-label="Sort cards" className="w-44">
            <SelectValue />
          </SelectTrigger>
        </Select>
      </div>
      <div>
        <span className="text-sm font-semibold text-strong-foreground">Order by</span>
        <Select items={printingOptions} defaultValue="date">
          <SelectTrigger aria-label="Order printings by" className="mt-1">
            <SelectValue />
          </SelectTrigger>
        </Select>
      </div>
      <Select items={sortOptions} defaultValue={null}>
        <SelectTrigger aria-label="Placeholder">
          <SelectValue placeholder="Choose a sort" />
        </SelectTrigger>
      </Select>
      <Select items={sortOptions} defaultValue="alphabetical" disabled>
        <SelectTrigger aria-label="Disabled">
          <SelectValue />
        </SelectTrigger>
      </Select>
      <Select items={sortOptions} defaultValue="price">
        <SelectTrigger aria-label="Invalid" aria-invalid>
          <SelectValue />
        </SelectTrigger>
      </Select>
      <Select items={sortOptions} defaultValue="edhrecRank">
        <SelectTrigger aria-label="A very long option" className="w-40">
          <SelectValue>{() => "EDHREC rank, then alphabetical"}</SelectValue>
        </SelectTrigger>
      </Select>
    </div>
  ),
};

function SortSelect({ onValueChange }: { onValueChange?: (value: string | null) => void }) {
  return (
    <Select items={sortOptions} defaultValue="manaValue" onValueChange={onValueChange}>
      <SelectTrigger aria-label="Sort cards" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.value === "price"}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const Open: Story = {
  render: (args) => <SortSelect onValueChange={args.onValueChange} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Sort cards" });
    await userEvent.click(trigger);
    const listbox = await body().findByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(body().getByRole("option", { name: "Mana value" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(body().getByRole("option", { name: "Price" })).toHaveAttribute("data-disabled");
  },
};

export const Selected: Story = {
  render: (args) => <SortSelect onValueChange={args.onValueChange} />,
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole("combobox", { name: "Sort cards" });
    await userEvent.click(trigger);
    await userEvent.click(await body().findByRole("option", { name: "EDHREC rank" }));
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(args.onValueChange).toHaveBeenCalledWith("edhrecRank", expect.anything());
    await expect(trigger).toHaveTextContent("EDHREC rank");
  },
};

/** Enter/Space open, Escape returns focus, Home/End/arrows, disabled row not selectable, typeahead, Enter selects. */
export const Keyboard: Story = {
  render: (args) => <SortSelect onValueChange={args.onValueChange} />,
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole("combobox", { name: "Sort cards" });
    // Compare by name so a failure reports which row is highlighted instead.
    const expectHighlighted = (name: string) =>
      waitFor(() =>
        expect(
          document.querySelector("[data-slot='select-item'][data-highlighted]"),
        ).toHaveTextContent(name),
      );
    trigger.focus();

    await userEvent.keyboard("{Enter}");
    await body().findByRole("listbox");
    await expectHighlighted("Mana value");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard(" ");
    await body().findByRole("listbox");
    await expectHighlighted("Mana value");
    await userEvent.keyboard("{End}");
    await expectHighlighted("EDHREC rank");
    await userEvent.keyboard("{Home}");
    await expectHighlighted("Mana value");
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("Alphabetical");
    // Base UI 1.9 keeps disabled rows in arrow navigation (screen readers can reach them)
    // but Enter on one selects nothing and the popup stays open.
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("Price");
    await userEvent.keyboard("{Enter}");
    await expect(body().getByRole("listbox")).toBeVisible();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("EDHREC rank");
    await userEvent.keyboard("a");
    await expectHighlighted("Alphabetical");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(args.onValueChange).toHaveBeenCalledWith("alphabetical", expect.anything());
    await expect(trigger).toHaveTextContent("Alphabetical");
    await expect(trigger).toHaveFocus();

    // Reopen so the snapshot shows the check on the new value and the highlighted row.
    await userEvent.keyboard("{ArrowDown}");
    await body().findByRole("listbox");
    await expectHighlighted("Alphabetical");
    await userEvent.keyboard("{End}");
    await expectHighlighted("EDHREC rank");
  },
};

const formats = {
  constructed: [
    { value: "standard", label: "Standard" },
    { value: "pioneer", label: "Pioneer" },
    { value: "modern", label: "Modern" },
  ],
  eternal: [
    { value: "legacy", label: "Legacy" },
    { value: "vintage", label: "Vintage" },
    { value: "commander", label: "Commander" },
  ],
};
const formatItems = [...formats.constructed, ...formats.eternal];

export const Grouped: Story = {
  render: () => (
    <Select items={formatItems} defaultValue="commander">
      <SelectTrigger aria-label="Format" className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Constructed</SelectLabel>
          {formats.constructed.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Eternal</SelectLabel>
          {formats.eternal.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Format" }));
    await expect(await body().findByRole("group", { name: "Eternal" })).toBeVisible();
  },
};

const sets = Array.from({ length: 40 }, (_, index) => ({
  value: `set-${index + 1}`,
  label: `Set ${String(index + 1).padStart(2, "0")}`,
}));

/** A long list scrolls inside the popup, capped at the space below the trigger. */
export const Scrolling: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <Select items={sets} defaultValue="set-1">
      <SelectTrigger aria-label="Set" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sets.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Set" }));
    const listbox = await body().findByRole("listbox");
    await waitFor(() => expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight));
  },
};

/** Full-width trigger at phone width (the printing picker): the popup matches the trigger. */
export const OpenMobileWidth: Story = {
  globals: { viewport: { value: "mobile" } },
  render: (args) => (
    <div>
      <span className="text-sm font-semibold text-strong-foreground">Order by</span>
      <Select items={printingOptions} defaultValue="date" onValueChange={args.onValueChange}>
        <SelectTrigger aria-label="Order printings by" className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {printingOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Order printings by" });
    await userEvent.click(trigger);
    const listbox = await body().findByRole("listbox");
    const popup = listbox.closest("[data-slot='select-content']");
    await expect(window.innerWidth).toBe(390);
    const positioner = popup?.parentElement;
    await expect(positioner).toHaveAttribute("data-slot", "select-positioner");
    await expect(positioner?.parentElement).toHaveAttribute("data-slot", "select-portal");
    await waitFor(() =>
      expect(popup?.getBoundingClientRect().width).toBe(trigger.getBoundingClientRect().width),
    );
  },
};
