# Changelog

## Unreleased

### Changed

- **Buttons show the pointer cursor.** `styles.css` gives every enabled `<button>` and `[role="button"]` `cursor: pointer`, including Button, Tabs, Switch, the Select trigger and the Collapsible trigger. Menu and select rows keep the arrow. To get the old cursor back on one element, add `className="cursor-default"`.

## 0.2.0

The system is now generic. App-specific looks and tokens moved out; recreate the ones you use in your app with `variant={null}` plus className (see the README's "App-specific looks").

### Removed variants and how to recreate them

| Removed                                              | Recreate with                                                                                                                                                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button variant="icon-ghost"`                        | `variant={null} className="rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"`                                                                                                      |
| `Button variant="warning-ghost"`                     | `variant={null} className="rounded-lg text-warning-text hover:bg-warning-border/30 hover:text-amber-100"`                                                                                                             |
| `Button variant="glass"`                             | `variant={null} className="bg-black/35 text-zinc-100 backdrop-blur-sm hover:bg-black/50"`                                                                                                                             |
| `Button variant="overlay"`                           | `variant={null} className="rounded-none text-zinc-100 hover:bg-white/15"`                                                                                                                                             |
| `Button variant="raised"`                            | `variant={null} className="border border-border-strong bg-secondary text-secondary-foreground shadow-lg shadow-black/40 hover:bg-border-strong hover:text-cyan-300"`                                                  |
| `Toggle`/`ToggleGroup variant="round"`               | `variant={null}` + your own swatch classes (group: `className="flex shrink-0 gap-2"`)                                                                                                                                 |
| `Badge variant="selected" \| "order"`, old `outline` | `variant={null}` + your own classes                                                                                                                                                                                   |
| `Card variant="glass"`                               | `className="bg-card/80"`                                                                                                                                                                                              |
| `DialogContent size="settings"`                      | `className="max-w-[800px]"`                                                                                                                                                                                           |
| `DialogContent size="screen"`                        | `padding="none" className="mx-auto max-w-7xl rounded-none border-0 bg-transparent shadow-none" overlayProps={{ className: "bg-black/80 backdrop-blur-sm" }} viewportProps={{ className: "block px-4 py-5 sm:px-6" }}` |
| `DialogOverlay screen` prop                          | `className`                                                                                                                                                                                                           |

### Changed

- **Button sizes set padding only.** `xs` no longer adds `rounded-lg`, `icon-xs` no longer adds `rounded-md`, and `icon-lg` no longer adds `rounded-full`. Add the radius in className where you relied on it. `destructive-ghost` uses the base radius.
- **Input sizes line up with Button heights.** `inputSize` is now `sm | md | lg`, with `md` the default. Old `xs` becomes `sm` plus `rounded-lg`. Old `sm` becomes `md`. Old `md`, the old default, becomes `lg`. Textarea keeps `lg` padding.
- **Toggle:**
  - `accent` defaults to size `sm`; pass `size="icon-sm"` for icon toggles.
  - `variant={null}` now drops the look instead of falling back to `outline`.
- **ToggleGroup:** `segmented` sizes its columns to the option count and supports `orientation="vertical"`.
- **Alert:** tone `danger` is renamed `destructive`, and the default tone is now `info`.
- **Item:** selected and pressed rows use the selection tokens (`selected`, `selected-border`) instead of the info tint.
- **TooltipContent:** accepts `portalProps` and `positionerProps`, like the other floating parts.

### Removed tokens

`surface-glass` (use `card`), `highlight`, `highlight-strong`, the `on-image` family, `chart-1`, `chart-2`, `tracking-brand`, `shadow-glow`, `shadow-drag` and `--z-drag`. Define the ones you need in your app's `@theme`. To keep the old names, copy their values from 0.1.0's `src/styles.css`.

## 0.1.0

First release, extracted from DeckDiff.
