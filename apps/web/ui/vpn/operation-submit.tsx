"use client";

import { Button } from "@dub/ui";
import { useFormStatus } from "react-dom";

export function OperationSubmit({
  children,
  destructive = false,
  confirmMessage,
}: {
  children: React.ReactNode;
  destructive?: boolean;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={destructive ? "danger" : "secondary"}
      loading={pending}
      disabled={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
