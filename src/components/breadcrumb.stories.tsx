import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slash } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#components/breadcrumb";

const meta = {
  title: "Primitives/Breadcrumb",
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#decks">Decks</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#constructed">Constructed</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Modern</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    const link = canvas.getByRole("link", { name: "Decks" });
    await expect(link).toHaveAttribute("href", "#decks");
    await expect(canvas.getByText("Modern")).toHaveAttribute("aria-current", "page");
  },
};

const onOpen = fn();

// DeckDiff's folder breadcrumb: every crumb is a navigation button, the current one marked.
function FolderBreadcrumb({ onNavigate }: { onNavigate: (path: string) => void }) {
  const crumbs = [
    { path: "", name: "Decks" },
    { path: "constructed", name: "Constructed" },
    { path: "constructed/modern", name: "Modern" },
  ];
  return (
    <Breadcrumb aria-label="Deck folders">
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;
          return [
            index > 0 ? <BreadcrumbSeparator key={`${crumb.path}-separator`} /> : null,
            <BreadcrumbItem key={crumb.path}>
              <BreadcrumbLink
                render={<button type="button" />}
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => onNavigate(crumb.path)}
              >
                {crumb.name}
              </BreadcrumbLink>
            </BreadcrumbItem>,
          ];
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const ButtonCrumbs: Story = {
  render: () => <FolderBreadcrumb onNavigate={onOpen} />,
  play: async ({ canvasElement }) => {
    onOpen.mockClear();
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "Deck folders" })).toBeVisible();
    const current = canvas.getByRole("button", { name: "Modern" });
    await expect(current).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Decks" }));
    await expect(onOpen).toHaveBeenCalledWith("");
  },
};

// Keyboard: Tab reaches each crumb, Enter activates it; focus ring stays visible.
export const KeyboardFocus: Story = {
  render: () => <FolderBreadcrumb onNavigate={onOpen} />,
  play: async ({ canvasElement }) => {
    onOpen.mockClear();
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.tab();
    const constructed = canvas.getByRole("button", { name: "Constructed" });
    await expect(constructed).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onOpen).toHaveBeenCalledWith("constructed");
  },
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#decks">Decks</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash strokeWidth={1.75} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Archive</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <div className="w-64">
      <Breadcrumb>
        <BreadcrumbList>
          {["Decks", "Constructed", "Modern", "Burn variants"].map((name, index, all) => [
            index > 0 ? <BreadcrumbSeparator key={`${name}-separator`} /> : null,
            <BreadcrumbItem key={name}>
              {index === all.length - 1 ? (
                <BreadcrumbPage>{name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={`#${index}`}>{name}</BreadcrumbLink>
              )}
            </BreadcrumbItem>,
          ])}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};
