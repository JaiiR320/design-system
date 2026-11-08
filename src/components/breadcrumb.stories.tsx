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
          <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#atlas">Atlas</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reports</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    const link = canvas.getByRole("link", { name: "Projects" });
    await expect(link).toHaveAttribute("href", "#projects");
    await expect(canvas.getByText("Reports")).toHaveAttribute("aria-current", "page");
  },
};

const onOpen = fn();

// A folder breadcrumb: every crumb is a navigation button, the current one marked.
function FolderBreadcrumb({ onNavigate }: { onNavigate: (path: string) => void }) {
  const crumbs = [
    { path: "", name: "Projects" },
    { path: "atlas", name: "Atlas" },
    { path: "atlas/reports", name: "Reports" },
  ];
  return (
    <Breadcrumb aria-label="Project folders">
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
    await expect(canvas.getByRole("navigation", { name: "Project folders" })).toBeVisible();
    const current = canvas.getByRole("button", { name: "Reports" });
    await expect(current).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Projects" }));
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
    const atlas = canvas.getByRole("button", { name: "Atlas" });
    await expect(atlas).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onOpen).toHaveBeenCalledWith("atlas");
  },
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
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
          {["Projects", "Atlas", "Reports", "Quarterly report drafts"].map((name, index, all) => [
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
