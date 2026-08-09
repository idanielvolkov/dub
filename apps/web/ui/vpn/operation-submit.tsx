"use client";

import { Button, Modal } from "@dub/ui";
import { useState } from "react";
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

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
          setForm(event.currentTarget.form);
          setShowConfirmModal(true);
        }}
      />
      {confirmMessage && (
        <Modal
          showModal={showConfirmModal}
          setShowModal={setShowConfirmModal}
          className="max-w-md"
        >
          <div className="border-border-subtle border-b px-6 py-4">
            <h3 className="text-content-emphasis text-lg font-medium">
              Confirm action
            </h3>
          </div>
          <div className="text-content-default px-6 py-5 text-sm leading-6">
            {confirmMessage}
          </div>
          <div className="border-border-subtle bg-bg-muted flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              variant="secondary"
              className="h-9 w-fit"
              text="Cancel"
              onClick={() => setShowConfirmModal(false)}
            />
            <Button
              variant={destructive ? "danger" : "primary"}
              className="h-9 w-fit"
              text="Confirm"
              onClick={() => {
                setShowConfirmModal(false);
                form?.requestSubmit();
              }}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
