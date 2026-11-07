import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const baseUiParts = [
  "alert-dialog",
  "button",
  "collapsible",
  "context-menu",
  "dialog",
  "field",
  "input",
  "menu",
  "merge-props",
  "popover",
  "scroll-area",
  "select",
  "separator",
  "switch",
  "tabs",
  "toggle",
  "toggle-group",
  "tooltip",
  "use-render",
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-bundle up front: discovering these mid-run makes Vite reload and fail in-flight tests.
  optimizeDeps: {
    include: [
      ...baseUiParts.map((part) => `@base-ui/react/${part}`),
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "tailwind-merge",
      "storybook/test",
    ],
  },
});
