import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge doesn't read the theme: register the custom shadow and tracking
// names so `shadow-2xl shadow-overlay` or `tracking-wide tracking-label` resolve to one.
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["overlay", "raised", "panel", "glow", "drag"] }],
      tracking: [{ tracking: ["label", "eyebrow", "brand"] }],
    },
  },
});

/** Join class names; later Tailwind classes win over conflicting earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}
