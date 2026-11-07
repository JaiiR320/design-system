import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type * as React from "react";

import { focusRing } from "#lib/recipes";
import { cn } from "#lib/utils";

function Breadcrumb({
  "aria-label": ariaLabel = "Breadcrumb",
  ...props
}: React.ComponentProps<"nav">) {
  return <nav data-slot="breadcrumb" aria-label={ariaLabel} {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("flex flex-wrap items-center gap-2 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center", className)}
      {...props}
    />
  );
}

/**
 * Anchor by default; `render` swaps in a router link or a navigation button.
 * A link/button for the current location takes `aria-current="page"`.
 */
function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        className: cn(
          "rounded-sm transition hover:text-strong-foreground aria-[current=page]:text-foreground motion-reduce:transition-none",
          focusRing,
          className,
        ),
      },
      props,
    ),
    state: { slot: "breadcrumb-link" },
  });
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("inline-flex items-center [&>svg]:size-4", className)}
      {...props}
    >
      {children ?? <ChevronRight strokeWidth={1.75} />}
    </li>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
