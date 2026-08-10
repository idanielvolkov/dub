"use client";

import { useConfirmModal } from "@/ui/modals/confirm-modal";
import { Button } from "@dub/ui";
import { useRef } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);
  const { setShowConfirmModal, confirmModal } = useConfirmModal({
    title: "Confirm action",
    description: confirmMessage || "Are you sure you want to continue?",
    confirmText: "Confirm",
    confirmVariant: destructive ? "danger" : "primary",
    onConfirm: () => formRef.current?.requestSubmit(),
  });

  return (
    <>
      <Button
        type="submit"
        variant={destructive ? "danger" : "primary"}
        className="h-9 w-fit"
        text={children}
        loading={pending}
        disabled={pending}
        onClick={(event) => {
          if (!confirmMessage) return;
          event.preventDefault();
          formRef.current = event.currentTarget.form;
          setShowConfirmModal(true);
        }}
      />
      {confirmMessage && confirmModal}
    </>
  );
}
