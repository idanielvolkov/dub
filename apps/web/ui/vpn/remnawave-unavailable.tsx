"use client";

import { Button, EmptyState } from "@dub/ui";
import { Refresh2, TriangleWarning } from "@dub/ui/icons";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RemnawaveUnavailable({ detail }: { detail?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-border-subtle flex min-h-96 items-center justify-center rounded-xl border bg-white p-8">
      <EmptyState
        icon={TriangleWarning}
        title="Remnawave is unavailable"
        description={
          detail ||
          "Live data could not be loaded. Check the panel connection and try again."
        }
      >
        <Button
          type="button"
          text={pending ? "Checking…" : "Try again"}
          icon={<Refresh2 className="size-4" />}
          disabled={pending}
          onClick={() => startTransition(() => router.refresh())}
        />
      </EmptyState>
    </div>
  );
}
