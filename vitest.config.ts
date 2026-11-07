import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// Every story runs as a browser test; vitest.setup.ts snapshots each one (screenshot + aria).
// Baselines are tied to Playwright's pinned Chromium build: always use `pnpm exec playwright`.
// test/fonts.conf and the raster flags make pixels identical across Linux distros and machine load.
const fontconfig = fileURLToPath(new URL("./test/fonts.conf", import.meta.url));
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          test: { name: "unit", include: ["src/**/*.test.ts"], environment: "node" },
        },
        {
          extends: true,
          plugins: [storybookTest({ configDir: ".storybook" })],
          test: {
            name: "storybook",
            setupFiles: ["./vitest.setup.ts"],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({
                launchOptions: {
                  env: { ...process.env, FONTCONFIG_FILE: fontconfig },
                  args: [
                    "--disable-gpu",
                    "--disable-partial-raster",
                    "--disable-skia-runtime-opts",
                    "--force-color-profile=srgb",
                    "--num-raster-threads=1",
                  ],
                },
              }),
              instances: [{ browser: "chromium" }],
              expect: {
                toMatchScreenshot: {
                  comparatorName: "pixelmatch",
                  comparatorOptions: { threshold: 0, allowedMismatchedPixelRatio: 0 },
                  screenshotOptions: { animations: "disabled", caret: "hide", scale: "css" },
                },
              },
            },
          },
        },
      ],
    },
  }),
);
