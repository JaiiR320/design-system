import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const uiSdkParts = [
  "alert-dialog",
  "button",
  "collapsible",
  "dialog",
  "field",
  "input",
  "label",
  "menu",
  "popover",
  "primitive",
  "scroll-area",
  "select",
  "separator",
  "slider",
  "switch",
  "tabs",
  "textarea",
  "toggle",
  "tooltip",
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-bundle up front: discovering these mid-run makes Vite reload and fail in-flight tests.
  optimizeDeps: {
    include: [
      "@ui-sdk/core",
      ...uiSdkParts.map((part) => `@ui-sdk/react/${part}`),
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "tailwind-merge",
      "storybook/test",
    ],
  },
});
