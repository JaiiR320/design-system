import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // .ts.net: let the dev server be reached through `tailscale serve`.
  core: { disableTelemetry: true, allowedHosts: [".ts.net"] },
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
};

export default config;
