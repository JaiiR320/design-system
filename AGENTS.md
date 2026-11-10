# Agent rules

Read `README.md` first. Each rule comes with its reason; use the reason for cases the rules don't cover.

- **Keep the system generic.** App-specific looks, tokens and layers belong in the app, through `variant={null}` plus className. Every future site shares this package.
- **Style with the semantic tokens in `src/styles.css`,** not palette colors or one-off values. A theme override should reach every component.
- **Use status colors (destructive, warning, success, info) only for meaning.** Decorative red or green reads as a state.
- **Controls set no font size or weight.** Apps expect them to inherit the surrounding type.
- **Document only what exists.** An agent will try to use a documented variant even if it was never built.
- **Overlay stories start closed, behind a trigger.** Open-state and interaction tests are hidden fixtures (`tags: ["!dev", "!autodocs"]`), so browsing Storybook doesn't open a dialog on every page.
- **Keep stories host-independent:** no network images, no smooth gradients, and no glyphs outside JetBrains Mono's Latin subset (such as `⌘`). Screenshots must match on Ubuntu CI.
- **Run `pnpm verify` before every commit, and look at the PNG diffs after `pnpm test:update`.** Stale baselines have slipped into commits before.
- **Name the replacement in the commit message of a breaking change.** Apps pin a commit and upgrade by reading the git log.
- **Ask before adding a light theme, motion tokens, or semantic radius and spacing tokens.** None of them is decided yet, and a guess tends to stick.
