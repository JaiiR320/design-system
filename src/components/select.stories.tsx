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
  { value: "project", label: "Project" },
  { value: "owner", label: "Owner" },
  { value: "tag", label: "Tag" },
];

const sortOptions = [
  { value: "modified", label: "Last modified" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "owner", label: "Owner" },
  { value: "created", label: "Date created" },
];

const orderOptions = [
  { value: "date", label: "Date created" },
  { value: "title", label: "Title" },
  { value: "size", label: "Size" },
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
    <Select items={groupOptions} defaultValue="project" onValueChange={args.onValueChange}>
      <SelectTrigger aria-label="Group documents" className="w-40">
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

/** Closed triggers at typical toolbar widths, plus placeholder, disabled and invalid. */
export const States: Story = {
  render: () => (
    <div className="grid w-[480px] gap-4">
      <div className="flex items-center gap-2">
        <Select items={groupOptions} defaultValue="project">
          <SelectTrigger aria-label="Group documents" className="w-40">
            <SelectValue />
          </SelectTrigger>
        </Select>
        <Select items={sortOptions} defaultValue="modified">
          <SelectTrigger aria-label="Sort documents" className="w-44">
            <SelectValue />
          </SelectTrigger>
        </Select>
      </div>
      <div>
        <span className="text-sm font-semibold text-strong-foreground">Order by</span>
        <Select items={orderOptions} defaultValue="date">
          <SelectTrigger aria-label="Order documents by" className="mt-1">
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
      <Select items={sortOptions} defaultValue="owner">
        <SelectTrigger aria-label="Invalid" aria-invalid>
          <SelectValue />
        </SelectTrigger>
      </Select>
      <Select items={sortOptions} defaultValue="created">
        <SelectTrigger aria-label="A very long option" className="w-40">
          <SelectValue>{() => "Date created, then alphabetical"}</SelectValue>
        </SelectTrigger>
      </Select>
    </div>
  ),
};

function SortSelect({ onValueChange }: { onValueChange?: (value: string | null) => void }) {
  return (
    <Select items={sortOptions} defaultValue="modified" onValueChange={onValueChange}>
      <SelectTrigger aria-label="Sort documents" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.value === "owner"}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const OpenTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => <SortSelect onValueChange={args.onValueChange} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Sort documents" });
    await userEvent.click(trigger);
    const listbox = await body().findByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(body().getByRole("option", { name: "Last modified" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(body().getByRole("option", { name: "Owner" })).toHaveAttribute("data-disabled");
  },
};

export const SelectedTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => <SortSelect onValueChange={args.onValueChange} />,
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole("combobox", { name: "Sort documents" });
    await userEvent.click(trigger);
    await userEvent.click(await body().findByRole("option", { name: "Date created" }));
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(args.onValueChange).toHaveBeenCalledWith("created", expect.anything());
    await expect(trigger).toHaveTextContent("Date created");
  },
};

/** Enter/Space open, Escape returns focus, Home/End/arrows, disabled row not selectable, typeahead, Enter selects. */
export const KeyboardTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => <SortSelect onValueChange={args.onValueChange} />,
  play: async ({ canvas, args }) => {
    const trigger = canvas.getByRole("combobox", { name: "Sort documents" });
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
    await expectHighlighted("Last modified");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body().queryByRole("listbox")).toBeNull());
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard(" ");
    await body().findByRole("listbox");
    await expectHighlighted("Last modified");
    await userEvent.keyboard("{End}");
    await expectHighlighted("Date created");
    await userEvent.keyboard("{Home}");
    await expectHighlighted("Last modified");
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("Alphabetical");
    // Base UI 1.9 keeps disabled rows in arrow navigation (screen readers can reach them)
    // but Enter on one selects nothing and the popup stays open.
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("Owner");
    await userEvent.keyboard("{Enter}");
    await expect(body().getByRole("listbox")).toBeVisible();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}");
    await expectHighlighted("Date created");
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
    await expectHighlighted("Date created");
  },
};

const locations = {
  projects: [
    { value: "atlas", label: "Atlas" },
    { value: "borealis", label: "Borealis" },
    { value: "cobalt", label: "Cobalt" },
  ],
  documents: [
    { value: "report", label: "Quarterly report" },
    { value: "review", label: "Design review" },
    { value: "launch", label: "Launch plan" },
  ],
};
const locationItems = [...locations.projects, ...locations.documents];

function GroupedSelect() {
  return (
    <Select items={locationItems} defaultValue="launch">
      <SelectTrigger aria-label="Location" className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Projects</SelectLabel>
          {locations.projects.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Documents</SelectLabel>
          {locations.documents.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export const Grouped: Story = {
  render: () => <GroupedSelect />,
};

export const GroupedTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <GroupedSelect />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Location" }));
    await expect(await body().findByRole("group", { name: "Documents" })).toBeVisible();
  },
};

const folders = Array.from({ length: 40 }, (_, index) => ({
  value: `folder-${index + 1}`,
  label: `Folder ${String(index + 1).padStart(2, "0")}`,
}));

/** A long list scrolls inside the popup, capped at the space below the trigger. */
export const ScrollingTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
  render: () => (
    <Select items={folders} defaultValue="folder-1">
      <SelectTrigger aria-label="Folder" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {folders.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Folder" }));
    const listbox = await body().findByRole("listbox");
    await waitFor(() => expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight));
  },
};

/** Full-width trigger at phone width: the popup matches the trigger. */
export const MobileWidthTest: Story = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "mobile" } },
  parameters: { chromatic: { modes: { mobile: { viewport: "mobile" } } } },
  // A phone-width form field: centered layout would otherwise shrink the trigger to its value.
  render: (args) => (
    <div className="w-[calc(100vw-2rem)]">
      <span className="text-sm font-semibold text-strong-foreground">Order by</span>
      <Select items={orderOptions} defaultValue="date" onValueChange={args.onValueChange}>
        <SelectTrigger aria-label="Order documents by" className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {orderOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Order documents by" });
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

/** A narrow trigger: the list grows to fit its longest option instead of truncating it. */
export const NarrowTriggerTest: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Select items={orderOptions} defaultValue="title">
      <SelectTrigger aria-label="Order by" className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {orderOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Order by" });
    await userEvent.click(trigger);
    const list = await body().findByRole("listbox");
    const option = within(list).getByRole("option", { name: "Date created" });
    const text = option.querySelector<HTMLElement>('[data-slot="select-item-text"]');
    if (!text) throw new Error("item text missing");
    await waitFor(() =>
      expect(list.getBoundingClientRect().width).toBeGreaterThan(
        trigger.getBoundingClientRect().width,
      ),
    );
    await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
  },
};
