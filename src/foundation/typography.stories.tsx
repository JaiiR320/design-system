import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="w-[720px] space-y-3">
      <p className="text-3xl font-semibold tracking-tight">text-3xl semibold: page titles</p>
      <p className="text-2xl font-semibold tracking-tight">text-2xl semibold: dialog titles</p>
      <p className="text-xl font-semibold">text-xl semibold: section titles</p>
      <p className="text-lg font-semibold">text-lg semibold: panel titles</p>
      <p className="text-base">text-base: body text; controls inherit their parent</p>
      <p className="text-sm font-medium">text-sm medium: labels and dense UI</p>
      <p className="text-xs">text-xs: meta and badges</p>
    </div>
  ),
};

export const Ramp: Story = {
  render: () => (
    <div className="w-[720px] space-y-2 text-sm">
      <p className="text-foreground">foreground: primary text</p>
      <p className="text-strong-foreground">strong-foreground: hover target for quiet controls</p>
      <p className="text-secondary-foreground">secondary-foreground: control text</p>
      <p className="text-subtle-foreground">subtle-foreground: secondary copy</p>
      <p className="text-muted-foreground">muted-foreground: meta and labels</p>
      <p className="text-faint-foreground">faint-foreground: placeholders</p>
    </div>
  ),
};

export const MicroType: Story = {
  render: () => (
    <div className="w-[720px] space-y-4">
      <p className="text-xs font-medium tracking-label text-muted-foreground uppercase">
        tracking-label: field and section labels
      </p>
      <p className="text-xs font-medium tracking-eyebrow text-primary uppercase">
        tracking-eyebrow: eyebrows
      </p>
    </div>
  ),
};
