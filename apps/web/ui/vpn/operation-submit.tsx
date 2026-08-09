"use client";

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "@dub/ui";
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
          <ModalHeader title="Confirm action" />
          <ModalBody className="text-content-default text-sm leading-6">
            {confirmMessage}
          </ModalBody>
          <ModalFooter>
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
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
