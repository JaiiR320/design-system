import { afterEach, expect } from "vitest";
import { page } from "vitest/browser";

// Deterministic rendering: no animations, transitions or caret. The body fills the
// viewport so position:fixed popups (menus, dialogs, tooltips) fall inside the capture.
const style = document.createElement("style");
style.textContent = `
*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
html{background:#09090b}
body{min-height:100vh;padding:16px;box-sizing:border-box}
`;
document.head.appendChild(style);

async function imagesSettled() {
  await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined)));
}

// Snapshot every story after render + play: aria tree and pixels of the whole body,
// so portaled overlays are included.
afterEach(async (ctx) => {
  const { storyId } = ctx.task.meta as { storyId?: string };
  if (!storyId || ctx.task.result?.state === "fail") return;

  await document.fonts.ready;
  await imagesSettled();
  const body = page.elementLocator(document.body);
  await expect.element(body, { timeout: 2000 }).toMatchAriaSnapshot();
  await expect(body).toMatchScreenshot(storyId);
});
