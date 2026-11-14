import { cva, type VariantProps } from "class-variance-authority";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import type * as React from "react";

import { Button, type ButtonProps } from "#components/button";
import { cn } from "#lib/utils";

// No syntax highlighting is bundled: pass highlighted nodes (from shiki, for example) as the
// children of `CodeBlockLine`, one line each.

const codeBlockVariants = cva(
  "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border has-[>[data-slot=code-block-content]:focus-visible]:ring-2 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50 has-[>[data-slot=code-block-content]:focus-visible]:ring-offset-2 has-[>[data-slot=code-block-content]:focus-visible]:ring-offset-background",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-strong-foreground",
        /** Output of something that failed: a stack trace, stderr. */
        destructive:
          "border-destructive-border bg-destructive-surface/20 text-destructive-muted-foreground",
      },
      size: {
        md: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

type CodeBlockProps = React.ComponentProps<"div"> & VariantProps<typeof codeBlockVariants>;

function CodeBlock({ className, variant, size, ...props }: CodeBlockProps) {
  return (
    <div
      data-slot="code-block"
      data-size={size ?? "md"}
      className={cn(codeBlockVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** Title row above the code: file name, command or language, then `CodeBlockActions`. */
function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-3 pt-2 text-muted-foreground group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pt-1.5",
        className,
      )}
      {...props}
    />
  );
}

function CodeBlockTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-title"
      className={cn(
        "flex min-w-0 items-center gap-1.5 truncate text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Buttons for the block. In a header they sit at its end; as a direct child of `CodeBlock`
 * they float over the top corner and show on hover or focus (always on touch screens).
 */
function CodeBlockActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block-actions"
      className={cn(
        "ms-auto flex shrink-0 items-center gap-1",
        "[[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-2 [[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:rounded-lg [[data-slot=code-block]>&]:bg-surface",
        "[[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 [[data-slot=code-block]>&]:pointer-coarse:opacity-100 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

type CodeBlockCopyButtonProps = ButtonProps & {
  /** Text written to the clipboard. */
  value: string;
};

/** Copies `value`; shows a check and announces "Copied" for 2 seconds. */
function CodeBlockCopyButton({
  value,
  variant = "ghost",
  size = "icon-sm",
  onClick,
  ...props
}: CodeBlockCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={copied || undefined}
        variant={variant}
        size={size}
        aria-label={copied ? "Copied" : "Copy"}
        onClick={(event, details) => {
          onClick?.(event, details);
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => {});
        }}
        {...props}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}

type CodeBlockContentProps = React.ComponentProps<"pre"> & {
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Number each line. A string child is split into lines for you. */
  lineNumbers?: boolean;
  startLine?: number;
};

/** The code. A string child renders as-is; for numbering or marks, pass `CodeBlockLine`s. */
function CodeBlockContent({
  className,
  children,
  style,
  wrap = false,
  lineNumbers = false,
  startLine = 1,
  ...props
}: CodeBlockContentProps) {
  return (
    <pre
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      data-numbered={lineNumbers || undefined}
      dir="ltr"
      // Focusable so keyboard users can scroll overflowing code.
      tabIndex={0}
      style={{ counterReset: `line ${startLine - 1}`, ...style }}
      className={cn(
        "m-0 min-h-0 min-w-0 overflow-auto p-3 text-start font-mono leading-relaxed outline-none group-has-data-[slot=code-block-header]/code-block:pt-1.5 group-data-[size=sm]/code-block:p-2.5 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1 data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap",
        className,
      )}
      {...props}
    >
      <code
        data-slot="code-block-code"
        className={cn(
          "grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0",
          // Without line numbers, a diff needs its own gutter for the +/- markers.
          "[:not([data-numbered])>&]:has-[>[data-variant=added],>[data-variant=removed]]:*:ps-6",
        )}
      >
        {lineNumbers && typeof children === "string"
          ? children
              .replace(/\n$/, "")
              .split("\n")
              // oxlint-disable-next-line react/no-array-index-key -- lines have no identity
              .map((line, index) => <CodeBlockLine key={index}>{line}</CodeBlockLine>)
          : children}
      </code>
    </pre>
  );
}

const codeBlockLineVariants = cva(
  [
    "relative -mx-3 block min-h-lh px-3 group-data-[size=sm]/code-block:-mx-2.5 group-data-[size=sm]/code-block:px-2.5",
    // Diff marker in the left gutter.
    "after:absolute after:start-1 after:top-0 after:text-faint-foreground after:select-none",
    // Line numbers.
    "before:min-w-6 before:text-end before:text-faint-foreground in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none",
  ],
  {
    variants: {
      variant: {
        default: "",
        added: "bg-success-surface/40 after:text-success-text after:content-['+']",
        removed: "bg-destructive-surface/40 after:text-destructive-text after:content-['-']",
        highlighted: "bg-surface",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type CodeBlockLineProps = React.ComponentProps<"span"> & VariantProps<typeof codeBlockLineVariants>;

/** One line of code. `added` and `removed` mark a diff; `highlighted` draws attention. */
function CodeBlockLine({ className, variant, children, ...props }: CodeBlockLineProps) {
  // An empty line holds a newline so a copied selection keeps blank lines.
  const empty =
    children === undefined ||
    children === null ||
    children === "" ||
    (Array.isArray(children) && children.length === 0);
  return (
    <span
      data-slot="code-block-line"
      data-variant={variant ?? "default"}
      className={cn(codeBlockLineVariants({ variant }), className)}
      {...props}
    >
      <span data-slot="code-block-line-content" className="min-w-0">
        {empty ? "\n" : children}
      </span>
    </span>
  );
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  codeBlockVariants,
};
export type { CodeBlockProps, CodeBlockContentProps, CodeBlockLineProps };
