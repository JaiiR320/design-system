---
name: release
description: Cut a new semver release of the design system and publish its GitHub release. Use when asked to release, tag, bump the version, or publish a new version.
---

# Release the design system

Releases are git tags (`v0.2.1`). Apps install a semver range such as `#semver:^0.2.0`, so the version number is a promise about compatibility.

1. **Start from an up-to-date, clean `main`.** `git pull`, then `git status` shows nothing to commit.
2. **Read what changed since the last tag:** `git log --format='%h %s%n%b' $(git describe --tags --abbrev=0)..HEAD`. If there is nothing worth releasing, stop and say so.
3. **Pick the bump.** Until 1.0:
   - `minor` if any change breaks an app: a removed or renamed component, prop, variant, token or export, or changed default behavior an app relies on.
   - `patch` for everything else: fixes, new components or variants, docs.
     Each breaking commit needs a `Breaking:` line in its body that names the replacement. If one is missing, ask the user before releasing; don't rewrite pushed history.
4. **Check:** `pnpm verify` passes.
5. **Bump and tag:** `npm version <patch|minor> -m "Release %s"`. This commits `package.json` and creates the tag.
6. **Preview the notes:** `node scripts/release-notes.mjs v<version>`. The template is `.github/release-notes.md`.
7. **Ask the user before pushing,** with the version, the bump and the notes preview. Then `git push --follow-tags`.
8. **Confirm the release:** `gh run watch $(gh run list --workflow release.yml --limit 1 --json databaseId -q '.[0].databaseId')`, then `gh release view v<version>`.

If the release job fails, fix the cause on `main` and delete and recreate the tag, or release the next patch. Never move a tag that an app may already have installed.
