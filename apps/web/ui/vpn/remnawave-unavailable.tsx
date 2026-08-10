"use client";

import { SimpleEmptyState } from "@/ui/shared/simple-empty-state";
import { Button } from "@dub/ui";
import { Refresh2, TriangleWarning } from "@dub/ui/icons";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RemnawaveUnavailable({ detail }: { detail?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <SimpleEmptyState
      className="border-border-subtle min-h-96 rounded-xl border bg-white"
      graphic={
        <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <TriangleWarning className="size-6" />
        </div>
      }
      title="Remnawave is unavailable"
      description={
        detail ||
        "Live data could not be loaded. Check the panel connection and try again."
      }
      addButton={
        <Button
          type="button"
          text={pending ? "Checking…" : "Try again"}
          icon={<Refresh2 className="size-4" />}
          disabled={pending}
          onClick={() => startTransition(() => router.refresh())}
        />
      }
    />
  );
}
