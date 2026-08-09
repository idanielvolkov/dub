import { cn } from "@dub/utils";
import {
  Children,
  cloneElement,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";

type Variant = "compact" | "loose";

export function DubCardList({
  variant = "loose",
  loading = false,
  className,
  children,
}: {
  variant?: Variant;
  loading?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul
      data-variant={variant}
      className={cn(
        "flex w-full min-w-0 flex-col transition-[gap,opacity]",
        variant === "compact" ? "gap-0" : "gap-4",
        loading && "opacity-50",
        className,
      )}
    >
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<{ variant?: Variant }>, {
              variant,
            })
          : child,
      )}
    </ul>
  );
}

export function DubCard({
  variant,
  outerClassName,
  innerClassName,
  hoverStateEnabled = true,
  banner,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLLIElement> & {
  variant?: Variant;
  outerClassName?: string;
  innerClassName?: string;
  hoverStateEnabled?: boolean;
  banner?: ReactNode;
}) {
  return (
    <li
      data-hover-state-enabled={hoverStateEnabled}
      className={cn(
        "group/card w-full min-w-0 border-neutral-200 bg-white",
        variant === "compact"
          ? "border-x border-b first-of-type:rounded-t-xl first-of-type:border-t last-of-type:rounded-b-xl"
          : "rounded-xl border",
        hoverStateEnabled && "transition-colors hover:bg-neutral-50",
        outerClassName,
        className,
      )}
      {...props}
    >
      {banner}
      <div className={cn("w-full px-4 py-2.5", innerClassName)}>{children}</div>
    </li>
  );
}
