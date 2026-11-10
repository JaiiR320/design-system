// Prints the release notes for a tag from .github/release-notes.md and the commits since the previous tag.
// Commits whose body has a line starting with "Breaking:" are listed under "Breaking changes".
// Usage: node scripts/release-notes.mjs v0.2.1
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tag = process.argv[2];
if (!tag) throw new Error("Usage: node scripts/release-notes.mjs <tag>");

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

let previous = "";
try {
  previous = git("describe", "--tags", "--abbrev=0", `${tag}^`);
} catch {
  // First release: list the whole history.
}

const log = git(
  "log",
  "--no-merges",
  "--invert-grep",
  "--grep=^Release ",
  "--format=%h%x1f%s%x1f%b%x1e",
  previous ? `${previous}..${tag}` : tag,
);

const commits = log
  .split("\x1e")
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const [hash, subject, body = ""] = entry.split("\x1f");
    return { hash, subject, body: body.trim() };
  });

const indent = (text) => text.replace(/^/gm, "  ");
const item = ({ hash, subject, body }) =>
  `- ${subject} (${hash})${body ? `\n\n${indent(body)}\n` : ""}`;
const isBreaking = (commit) => /^Breaking:/m.test(commit.body);

const breaking = commits.filter(isBreaking);
const repo = "https://github.com/JaiiR320/design-system";

const notes = readFileSync(new URL("../.github/release-notes.md", import.meta.url), "utf8")
  .replace(
    "{{breaking}}",
    breaking.length ? `## Breaking changes\n\n${breaking.map(item).join("\n")}\n\n` : "",
  )
  .replace(
    "{{changes}}",
    commits
      .filter((c) => !isBreaking(c))
      .map(item)
      .join("\n") || "- None",
  )
  .replace("{{version}}", tag.replace(/^v/, ""))
  .replace(
    "{{compare}}",
    previous ? `${repo}/compare/${previous}...${tag}` : `${repo}/commits/${tag}`,
  );

process.stdout.write(notes);
