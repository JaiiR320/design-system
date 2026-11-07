# @jaiir320/design-system

DeckDiff's design system: semantic tokens and small, composable React primitives built on [shadcn/ui](https://ui.shadcn.com) (base-nova) and [Base UI](https://base-ui.com). Dark only, JetBrains Mono everywhere.

It ships TypeScript source and CSS, with no build step. Your app compiles it.

## Use it in an app

Requires React 19, Tailwind CSS v4 and a bundler that compiles TSX from `node_modules` (Vite does).

```sh
pnpm add github:JaiiR320/design-system#<commit-sha>
```

```css
/* app.css */
@import "tailwindcss";
@import "@jaiir320/design-system/styles.css";
```

```tsx
import { Button } from "@jaiir320/design-system/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@jaiir320/design-system/components/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button size="icon" aria-label="Deck actions" />}>
    <MoreHorizontal />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={rename}>Rename</DropdownMenuItem>
    <DropdownMenuItem variant="destructive" onClick={remove}>
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

Each component is its own module (`components/<name>`); there is no barrel. `lib/utils` exports `cn`.

## Principles

- **Compose, don't configure.** Components are compound parts (`Dialog`, `DialogContent`, `DialogHeader`, ...) with a `data-slot` on every DOM part. Swap the rendered element with Base UI's `render` prop: `<DialogTrigger render={<Button />}>`.
- **Variants are real axes only.** `cva` variants cover the looks the product uses; everything else is `className`, merged last with `cn` (clsx + tailwind-merge).
- **Tokens are Tailwind utilities.** `bg-surface`, `text-subtle-foreground`, `border-border-strong`, `bg-destructive-surface/30`, `shadow-overlay`, `tracking-label`. See `src/styles.css` and the Foundation stories.
- **Behaviour comes from Base UI.** Focus management, keyboard navigation, dismissal and positioning are not reimplemented.
- **Layers.** Sticky chrome uses `z-(--z-sticky)`. Every portaled overlay shares `z-(--z-overlay)`, and nested overlays stack in the order they open.

## Good to know

- **Select:** pass `items` to `Select` so the closed trigger can render its label during SSR. `onValueChange` can give `null`, so guard for it.
- **Single-select `ToggleGroup`:** pressing the active item empties the value array. Ignore empty arrays if a selection is required.
- **App-controlled field errors:** render `{error && <FieldError match>{error}</FieldError>}`. A `Field`'s `invalid` flag alone doesn't show `FieldError`.
- **Tooltips are visual hints.** Base UI gives them no `role="tooltip"` and no `aria-describedby`. Keep essential information in the control's name or in persistent text.
- **Dialogs opened from state:** pass `finalFocus` when the element that opened the dialog may be gone by the time it closes.
- **Popover anchored to an input:** focus stays in the input, so handle Escape on the input itself.
- **Disabled menu items stay focusable** (`aria-disabled`), as Base UI intends. Clicking them does nothing.

## Develop

```sh
pnpm install
pnpm exec playwright install chromium   # once; screenshots are tied to this browser build
pnpm storybook                          # http://localhost:6106
pnpm test                               # every story: play function + aria snapshot + screenshot
pnpm test:update                        # accept intended visual changes, then review the PNG diffs
pnpm verify                             # format, lint, types, tests, Storybook build
```

Every story is a test. After it renders and its play function runs, the whole page gets an aria snapshot and a pixel-exact screenshot, including any open menu or dialog. Baselines sit next to each story in `__screenshots__/` and `__snapshots__/`.

Keep stories host-independent so baselines match on any Linux:

- no network images;
- no smooth gradients, which dither differently per machine; use hard color stops;
- no glyphs outside JetBrains Mono's bundled Latin subsets, such as `⌘`, which fall back to OS fonts.

### Adding a shadcn component

```sh
pnpm dlx shadcn@latest add <name> --dry-run   # inspect first
pnpm dlx shadcn@latest add <name>
```

Then:

1. Rewrite imports to `#lib/utils` and `#components/*`.
2. Restyle with the tokens.
3. Drop parts nothing uses.
4. Add stories, then run `pnpm test:update`.

`shadcn` stays a CLI; it is never a runtime dependency.
