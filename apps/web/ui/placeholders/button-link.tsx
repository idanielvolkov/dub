"use client";

import { ButtonProps, buttonVariants } from "@dub/ui";
import { cn } from "@dub/utils";
import Link from "next/link";
import { ComponentProps } from "react";

export function ButtonLink({
  variant,
  className,
  ...rest
}: Pick<ButtonProps, "variant"> & ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      className={cn(
        "group flex h-10 w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3 text-sm",
        buttonVariants({ variant }),
        className,
      )}
    />
  );
}
