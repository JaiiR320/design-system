import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundation/Tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Swatch = { name: string; className: string };

function SwatchGrid({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-medium tracking-label text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {swatches.map((swatch) => (
          <div key={swatch.name} className="space-y-1.5">
            <div className={`h-10 rounded-lg border border-border ${swatch.className}`} />
            <p className="text-xs text-subtle-foreground">{swatch.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const surfaces: Swatch[] = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "surface-glass/80", className: "bg-surface-glass/80" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "secondary", className: "bg-secondary" },
  { name: "popover", className: "bg-popover" },
  { name: "overlay", className: "bg-overlay" },
];

const text: Swatch[] = [
  { name: "foreground", className: "bg-foreground" },
  { name: "strong-foreground", className: "bg-strong-foreground" },
  { name: "secondary-foreground", className: "bg-secondary-foreground" },
  { name: "subtle-foreground", className: "bg-subtle-foreground" },
  { name: "muted-foreground", className: "bg-muted-foreground" },
  { name: "faint-foreground", className: "bg-faint-foreground" },
];

const lines: Swatch[] = [
  { name: "border-subtle", className: "bg-border-subtle" },
  { name: "border", className: "bg-border" },
  { name: "border-strong", className: "bg-border-strong" },
  { name: "ring", className: "bg-ring" },
];

const brand: Swatch[] = [
  { name: "primary", className: "bg-primary" },
  { name: "primary-hover", className: "bg-primary-hover" },
  { name: "selected", className: "bg-selected" },
  { name: "selected-border", className: "bg-selected-border" },
  { name: "highlight", className: "bg-highlight" },
  { name: "highlight-strong", className: "bg-highlight-strong" },
  { name: "chart-1", className: "bg-chart-1" },
  { name: "chart-2", className: "bg-chart-2" },
];

const status: Swatch[] = [
  { name: "destructive", className: "bg-destructive" },
  { name: "destructive-text", className: "bg-destructive-text" },
  { name: "destructive-surface/30", className: "bg-destructive-surface/30" },
  { name: "destructive-border/50", className: "bg-destructive-border/50" },
  { name: "warning", className: "bg-warning" },
  { name: "warning-text", className: "bg-warning-text" },
  { name: "warning-surface/20", className: "bg-warning-surface/20" },
  { name: "warning-border/60", className: "bg-warning-border/60" },
  { name: "success", className: "bg-success" },
  { name: "success-text", className: "bg-success-text" },
  { name: "success-surface/20", className: "bg-success-surface/20" },
  { name: "success-border/50", className: "bg-success-border/50" },
  { name: "info", className: "bg-info" },
  { name: "info-text", className: "bg-info-text" },
  { name: "info-surface/20", className: "bg-info-surface/20" },
  { name: "info-border/50", className: "bg-info-border/50" },
];

export const Neutrals: Story = {
  render: () => (
    <div className="w-[720px] space-y-6">
      <SwatchGrid title="Surfaces" swatches={surfaces} />
      <SwatchGrid title="Text" swatches={text} />
      <SwatchGrid title="Lines" swatches={lines} />
    </div>
  ),
};

export const Accents: Story = {
  render: () => (
    <div className="w-[720px] space-y-6">
      <SwatchGrid title="Brand and selection" swatches={brand} />
      <SwatchGrid title="Status" swatches={status} />
    </div>
  ),
};

const shadows = [
  { name: "shadow-raised", className: "shadow-raised" },
  { name: "shadow-overlay", className: "shadow-overlay" },
  { name: "shadow-panel", className: "shadow-panel" },
  { name: "shadow-glow", className: "shadow-glow" },
  { name: "shadow-drag", className: "shadow-drag" },
];

export const Elevation: Story = {
  render: () => (
    <div className="grid w-[720px] grid-cols-5 gap-6 p-6">
      {shadows.map((shadow) => (
        <div key={shadow.name} className="space-y-3">
          <div className={`h-16 rounded-xl border border-border bg-surface ${shadow.className}`} />
          <p className="text-xs text-subtle-foreground">{shadow.name}</p>
        </div>
      ))}
    </div>
  ),
};
