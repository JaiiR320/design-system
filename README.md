# @jaiir320/design-system

A small design system: semantic tokens and composable React primitives built on the behaviors of [UI SDK](https://ui-sdk.dev) (`@ui-sdk/react`). The default theme is dark zinc with a cyan accent and JetBrains Mono everywhere; apps can rebrand it and add their own tokens and looks.

It ships TypeScript source and CSS, with no build step. Your app compiles it.

## Use it in an app

Requires React 19, Tailwind CSS v4 and a bundler that compiles TSX from `node_modules` (Vite does).

```sh
pnpm add "github:JaiiR320/design-system#semver:^0.2.0"
```

pnpm picks the newest [release](https://github.com/JaiiR320/design-system/releases) in the range and pins its commit in your lockfile. To upgrade, read the release notes, then run `pnpm update @jaiir320/design-system` or widen the range for a breaking release.

```css
/* app.css */
@layer ui-sdk;
@import "tailwindcss";
@import "@jaiir320/design-system/styles.css";
```

`@layer ui-sdk;` must come first. UI SDK adds the little CSS its behaviors need (hiding closed popups, for example) in that layer; declaring it before Tailwind keeps it below every utility.

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
    <DropdownMenuItem onSelect={rename}>Rename</DropdownMenuItem>
    <DropdownMenuItem variant="destructive" onSelect={remove}>
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

Each component is its own module (`components/<name>`); there is no barrel. `lib/utils` exports `cn`.

## Principles

- **Compose, don't configure.** Components are compound parts (`Dialog`, `DialogContent`, `DialogHeader`, ...) with a `data-slot` on every DOM part (UI SDK's slot names on its parts, such as `menu-item` inside a `DropdownMenuItem`). Swap the rendered element with the `render` prop: `<DialogTrigger render={<Button />}>`.
- **Variants are real axes only.** `cva` variants cover generic looks; everything else is `className`, merged last with `cn` (clsx + tailwind-merge). App-specific looks live in the app (see below).
- **Tokens are Tailwind utilities.** `bg-surface`, `text-subtle-foreground`, `border-border-strong`, `bg-destructive-surface/30`, `shadow-overlay`, `tracking-label`. See `src/styles.css` and the Foundation stories.
- **Behaviour comes from UI SDK.** Focus management, keyboard navigation, dismissal, positioning, pending actions and stick-to-end scrolling are not reimplemented. State shows as data attributes (`data-open`, `data-highlighted`, `data-pending`…), which the styles read.
- **Layers.** Popups (dialogs, menus, selects, popovers, tooltips) render in place but sit in the browser's top layer, above every `z-index`, and nested popups stack in the order they open. No portals. Sticky chrome uses `z-(--z-sticky)`.

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
| A number or range along a scale                  | `Slider`; `Input type="number"` when people know the exact value                                       |
| Copying text to the clipboard                    | `CopyButton`; `CodeBlockCopyButton` inside a `CodeBlock`                                               |
| One value from a few options                     | `ToggleGroup variant="segmented"`; `Select` when there are many                                        |
| Switching between panels of content              | `Tabs`                                                                                                 |
| A label, control, description and error together | `Field`; attach icons or buttons to an input with `InputGroup`                                         |
| A grouped surface                                | `Card`                                                                                                 |
| A row in a list: media, title, actions           | `Item`                                                                                                 |
| Nothing to show yet                              | `Empty`                                                                                                |
| A message about the page or a form               | `Alert`                                                                                                |
| A short, non-interactive label or count          | `Badge`; use `Toggle` if it's clickable                                                                |
| Loading with a known layout                      | `Skeleton`; `Spinner` inside a control or for an unknown shape                                         |
| A turn in a conversation                         | `Message`; the user's text in a `MessageBubble`                                                        |
| A conversation that follows new messages         | `MessageScroller`                                                                                      |
| Agent steps: reasoning, tool calls, a plan       | `Trace`; `TraceCollapsible` for a step with detail                                                     |
| Code, command output or a diff                   | `CodeBlock`                                                                                            |

## Agent chat

`Message`, `MessageScroller`, `Trace` and `CodeBlock` are the parts of an agent UI; the AgentChat recipe puts them together with a prompt input built on `InputGroup`.

- **`MessageScroller` stays pinned to the newest message** while content grows (UI SDK's ScrollArea `stickToEnd`), so streamed replies stay in view. Scrolling up unpins it and shows `MessageScrollerButton` (always mounted; it shows with `data-visible`). To pin on send from a prompt input outside the scroller, wrap both in `MessageScrollerProvider` and call `scrollToEnd()` from `useMessageScroller()`; `isAtEnd()` reads the position from a handler. Style from the root's `data-at-end` and `data-sticking`.
- **The prompt is a `Textarea`** with `submitShortcut="enter"` (Shift+Enter for a new line) inside an `InputGroup`; add `autoResize` to grow it with the text.
- **One `Trace` per agent turn**, one `TraceLine` per step. `status` is `running`, `error` or `pending`; omit it when the step is done. Say the state in the title too ("Running tests", "Failed to run lint"). To open reasoning while it streams and still let the user close it: `const [open, setOpen] = useState<boolean>()`, then `<TraceCollapsible open={open ?? running} onOpenChange={setOpen}>`.
- **`CodeBlock` has no syntax highlighting.** Pass highlighted nodes (from shiki, for example) as `CodeBlockLine` children, one per line. `CodeBlockLine variant="added" | "removed" | "highlighted"` marks a diff.

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
- **Layers** are plain variables in `:root`: `--z-sticky` (1000) and `--z-overlay` (1100), for the app's own overlays outside the top layer. Add your own relative to them (for example drag feedback).
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
- Menus and popovers are non-modal.
- Tabs activate on Enter/Space, not on focus.
- `AlertDialog` focuses Cancel first.

## Good to know

- **Menu items run through `onSelect`** (or the menu's `onAction(value)` with an item `value`), not `onClick`: keyboard selection doesn't fire a click. Return a Promise to keep the item pending and the menu open until it settles.
- **Select:** pass `items` to `Select` so the closed trigger can render its label during SSR, and mark disabled options `disabled` there too: navigation and typeahead read the data. `onValueChange` can give `null`, so guard for it.
- **Single-select `ToggleGroup`:** pass `deselectable={false}` to keep one item pressed.
- **App-controlled field errors:** pass `invalid` to the `Field` and put the message in `FieldError`. Leave `invalid` out to show the browser's validation once a submit finds the control invalid.
- **`Input`, `Textarea`, `Select`, `Switch` and `Slider` join a `Field` on their own.** `FieldControl` is only for a control this system doesn't ship, like a native `<select>`.
- **Pending actions:** a `Button` `onClick`, an `AlertDialogAction` `action` or a `DialogClose` `action` that returns a Promise stays pending (`data-pending`, `aria-busy`) until it settles. A rejected `AlertDialogAction` keeps the dialog open for a retry.
- **Tooltips name or describe their trigger** (`role="tooltip"`). After one opens, the next opens at once; no provider is needed. For a disabled control, give it `focusableWhenDisabled` so it can still show why.
- **Focus targets** (`initialFocus`, `finalFocus`) take a selector, an element, a function or `"none"`, not a ref. Pass `finalFocus` when the element that opened a dialog may be gone by the time it closes.
- **Disabled menu items stay focusable** (`aria-disabled`), as the menu pattern asks. Selecting them does nothing.

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

### Releasing

Versions follow semver. Until 1.0, a breaking change bumps the minor version (0.2.x → 0.3.0) and anything else bumps the patch, so `^0.2.0` never pulls in a breaking release.

```sh
npm version patch -m "Release %s"   # or minor for a breaking change; commits and tags v<version>
git push --follow-tags
```

Pushing the tag runs `.github/workflows/release.yml`, which checks the tag matches `package.json` and publishes a GitHub release from the template `.github/release-notes.md`, filled by `scripts/release-notes.mjs` with the commits since the previous tag. A breaking commit has a `Breaking:` line in its body naming the replacement; those commits get their own section, so the notes double as the upgrade guide. Preview the notes with `node scripts/release-notes.mjs v<version>`. Agents follow `.claude/skills/release/SKILL.md`.

### Adding a component

Build it on UI SDK. Its docs ship with the package: start at `node_modules/@ui-sdk/react/docs/llms.txt`, then read the component's page in `docs/components/`.

1. If UI SDK ships the component, wrap its parts like the existing modules do: keep UI SDK's behavior and `data-slot`, add classes from the tokens with `cn`, and type `className` as a string with `WithClassName` from `#lib/utils`.
2. If it doesn't, define a primitive with `definePrimitive` from `@ui-sdk/core` in `src/lib/`, built from its behaviors (`docs/core.md`, searched by heading), and render it with `createParts` (`docs/rendering.md`) rather than hand-writing state, focus, keys or ARIA. `CopyButton` (`src/lib/copy-button.ts`) is the example.
3. A part with no behavior of its own (a header, a footer) is a plain element; give it a `data-slot`, and use `renderElement` from `@ui-sdk/react/primitive` when it should take `render`.
4. Add stories, then run `pnpm test:update` and review the PNG diffs.
