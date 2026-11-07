import { describe, expect, it } from "vitest";
import { cn } from "./utils.ts";

describe("cn", () => {
  it("keeps a size and a semantic colour from the same text- prefix", () => {
    expect(cn("text-sm", "text-subtle-foreground")).toBe("text-sm text-subtle-foreground");
  });

  it("replaces only the conflicting group", () => {
    expect(cn("text-sm text-muted-foreground", "text-xs")).toBe("text-muted-foreground text-xs");
    expect(cn("text-sm text-muted-foreground", "text-foreground")).toBe("text-sm text-foreground");
    expect(cn("px-4 py-2", "px-3")).toBe("py-2 px-3");
  });

  it("treats custom shadow tokens as shadow sizes", () => {
    expect(cn("shadow-2xl", "shadow-overlay")).toBe("shadow-overlay");
    expect(cn("shadow-overlay shadow-black/50")).toBe("shadow-overlay shadow-black/50");
  });

  it("treats custom tracking tokens as letter spacing", () => {
    expect(cn("tracking-wide", "tracking-label")).toBe("tracking-label");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, { b: true, c: false })).toBe("a b");
  });
});
