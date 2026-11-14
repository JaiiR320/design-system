import { announce, definePrimitive } from "@ui-sdk/core";

type CopyButtonOptions = {
  /** Text written to the clipboard. */
  text?: string;
  /** How long `copied` (or `failed`) stays on before the button resets, in milliseconds. */
  resetAfter?: number;
  onCopy?: (text: string) => void;
};

type CopyButtonState = { copied: boolean; failed: boolean };

const copyButton = definePrimitive({
  name: "copy-button",
  options: { text: "string", resetAfter: "number", onCopy: "callback" },
  state: (_options: CopyButtonOptions): CopyButtonState => ({ copied: false, failed: false }),
  api: (context) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let text = context.options().text;

    const settle = (next: CopyButtonState) => {
      clearTimeout(timer);
      context.store.set(next);
      if (!next.copied && !next.failed) return;
      timer = setTimeout(
        () => context.store.set({ copied: false, failed: false }),
        context.options().resetAfter ?? 2000,
      );
    };

    context.onOptions((options) => {
      if (options.text === text) return;
      text = options.text;
      settle({ copied: false, failed: false });
    });
    context.onDestroy(() => clearTimeout(timer));

    return {
      async copy() {
        const { text = "", onCopy } = context.options();
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          settle({ copied: false, failed: true });
          announce("Couldn't copy");
          return;
        }
        settle({ copied: true, failed: false });
        announce("Copied");
        onCopy?.(text);
      },
    };
  },
  slots: (slot) => ({
    root: slot<{}, CopyButtonState>({
      state: (state) => state,
      attrs: (state) => ({
        type: "button",
        "data-copied": state.copied ? "" : undefined,
        "data-failed": state.failed ? "" : undefined,
      }),
      press: ({ api }) => api.copy(),
    }),
  }),
  agent: { actions: ["copy"] },
});

export { copyButton };
export type { CopyButtonOptions, CopyButtonState };
