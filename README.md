# @jaiir320/design-system

A small design system: semantic tokens and composable React primitives built on [shadcn/ui](https://ui.shadcn.com) (base-nova) and [Base UI](https://base-ui.com). The default theme is dark zinc with a cyan accent and JetBrains Mono everywhere; apps can rebrand it and add their own tokens and looks.

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
  <DropdownMenuTrigger render={<Button size="icon" aria-label="Project actions" />}>
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
- **Variants are real axes only.** `cva` variants cover generic looks; everything else is `className`, merged last with `cn` (clsx + tailwind-merge). App-specific looks live in the app (see below).
- **Tokens are Tailwind utilities.** `bg-surface`, `text-subtle-foreground`, `border-border-strong`, `bg-destructive-surface/30`, `shadow-overlay`, `tracking-label`. See `src/styles.css` and the Foundation stories.
- **Behaviour comes from Base UI.** Focus management, keyboard navigation, dismissal and positioning are not reimplemented.
- **Layers.** Sticky chrome uses `z-(--z-sticky)`. Every portaled overlay shares `z-(--z-overlay)`, and nested overlays stack in the order they open.

## Choosing a component

| When you need                                    | Use                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| A form or task that takes over the page          | `Dialog`                                                                                               |
| A yes/no answer before a risky action            | `AlertDialog`. For a row in a list, confirm inline with an `Alert` in the row (Inline confirm recipe). |
| Content anchored to a control, page still usable | `Popover`                                                                                              |
| A short hint on hover or focus                   | `Tooltip`, never the only place for information                                                        |
| Actions from a button                            | `DropdownMenu`                                                                                         |
| Actions on right click or long press             | `ContextMenu`, plus another way to reach the same actions                                              |
| An on/off setting that applies at once           | `Switch`                                                                                               |
| A pressed state on one button                    | `Toggle`                                                                                               |
| One value from a few options                     | `ToggleGroup variant="segmented"`; `Select` when there are many                                        |
| Switching between panels of content              | `Tabs`                                                                                                 |
| A label, control, description and error together | `Field`; attach icons or buttons to an input with `InputGroup`                                         |
| A grouped surface                                | `Card`                                                                                                 |
| A row in a list: media, title, actions           | `Item`                                                                                                 |
| Nothing to show yet                              | `Empty`                                                                                                |
| A message about the page or a form               | `Alert`                                                                                                |
| A short, non-interactive label or count          | `Badge`; use `Toggle` if it's clickable                                                                |
| Loading with a known layout                      | `Skeleton`; `Spinner` inside a control or for an unknown shape                                         |

## Theming

Tokens are Tailwind v4 theme variables in one `@theme` block (`src/styles.css`). Override or add tokens in your own `@theme` block **after** importing the system:

```css
@import "tailwindcss";
@import "@jaiir320/design-system/styles.css";

@theme {
  /* Rebrand: the primary family moves together. */
  --color-primary: var(--color-violet-400);
  --color-primary-hover: var(--color-violet-300);
  --color-primary-foreground: var(--color-violet-950);
  --color-ring: var(--color-violet-500);
  /* selected*, info* are cyan too; override them if they should follow. */

  /* App-only tokens become utilities like any other (bg-brand, shadow-glow). */
  --color-brand: var(--color-violet-300);
  --shadow-glow: 0 0 18px rgb(167 139 250 / 0.14);
}
```

- **Dark only.** `:root` sets `color-scheme: dark`; there is no light palette.
- **Layers** are plain variables in `:root`: `--z-sticky` (1000) and `--z-overlay` (1100). Add your own relative to them (for example drag feedback above overlays).
- **`cn` only knows the system's custom shadow and tracking names** (`shadow-overlay|raised|panel`, `tracking-label|eyebrow`). If your own shadow or tracking token can meet a conflicting class in one `cn` call, write it as a variable utility (`shadow-(--shadow-glow)`) so tailwind-merge keeps it.

## App-specific looks

Keep product-specific styling in the app. Pass `variant={null}` to drop the built-in look while keeping structure, focus ring and disabled handling, then supply your classes:

```tsx
// app/src/components/buttonLooks.ts
export const buttonLooks = {
  overArt: "bg-black/35 text-white backdrop-blur-sm hover:bg-black/50",
};

<Button variant={null} size="icon" className={buttonLooks.overArt} aria-label="More" />;
```

`Button`, `Toggle`, `ToggleGroup` and `Badge` all accept `variant={null}`. For non-button elements styled like a button (a router link), use `buttonVariants({ variant, size, className })`.

## Sizes and defaults

| Size           | Button      | Input (`inputSize`) |
| -------------- | ----------- | ------------------- |
| `sm`           | `px-3 py-2` | `px-3 py-2`         |
| `md` (default) | `px-4 py-2` | `px-4 py-2`         |
| `lg`           | `px-4 py-3` | `px-4 py-3`         |

Buttons also have `xs`, `icon-xs`, `icon-sm`, `icon`, `icon-lg` and `none`. Sizes set padding only; radius comes from the variant or your className.

Controls (buttons, inputs, selects, tabs, toggles, menu rows) set **no typography**: they inherit the surrounding font size and weight, so put `text-*` on the control or its parent as you need.

Defaults worth knowing:

- `Button` is `outline` unless you pass `variant`.
- `Alert` is `info` unless you pass `tone`.
- Menus are non-modal.
- Tabs activate on Enter/Space, not on focus.
- `AlertDialog` focuses Cancel first.

## Good to know

- **Select:** pass `items` to `Select` so the closed trigger can render its label during SSR. `onValueChange` can give `null`, so guard for it.
- **Single-select `ToggleGroup`:** pressing the active item empties the value array. Ignore empty arrays if a selection is required.
- **App-controlled field errors:** render `{error && <FieldError match>{error}</FieldError>}`. A `Field`'s `invalid` flag alone doesn't show `FieldError`.
- **Tooltips are visual hints.** Base UI gives them no `role="tooltip"` and no `aria-describedby`. Keep essential information in the control's name or in persistent text.
- **Dialogs opened from state:** pass `finalFocus` when the element that opened the dialog may be gone by the time it closes.
- **Popover anchored to an input:** focus stays in the input, so handle Escape on the input itself.
- **Disabled menu items stay focusable** (`aria-disabled`), as Base UI intends. Clicking them does nothing.
- **Server rendering with Vite 8 + Nitro:** Base UI imports the CommonJS `use-sync-external-store` shim. The production server build leaves the shim's `require("react")` as a runtime require, which loads a second React and breaks SSR with an invalid hook call ([nitrojs/nitro#4171](https://github.com/nitrojs/nitro/issues/4171)). Until the Nitro fix ships, alias `use-sync-external-store/shim` and `use-sync-external-store/shim/with-selector` to a small ESM module that re-exports React's `useSyncExternalStore`.

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

Overlay examples in the sidebar start closed: click the trigger. Stories that exist only to test an open state or an interaction are tagged `["!dev", "!autodocs"]`, which hides them from the sidebar and docs; they still run in `pnpm test`.

Chromatic also publishes Storybook and snapshots every story on each push to `main` and each pull request (`.github/workflows/chromatic.yml`, repo secret `CHROMATIC_PROJECT_TOKEN`). Visual changes wait for review in Chromatic rather than failing the job. To publish by hand: `CHROMATIC_PROJECT_TOKEN=<token> pnpm chromatic`.

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
