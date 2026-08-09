import { cn } from "@dub/utils";
import Link from "next/link";
import { ComponentProps } from "react";
import { ButtonProps, buttonVariants } from "./button";

export function ButtonLink({
  variant,
  className,
  ...props
}: Pick<ButtonProps, "variant"> & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "group flex h-10 w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3 text-sm transition-all",
        buttonVariants({ variant }),
        className,
      )}
    />
  );
}
