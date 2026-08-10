"use client";

import {
  RemnawaveSubscriptionSettings,
  RemnawaveSubscriptionTemplate,
} from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  Checkbox,
  EmptyState,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  useTable,
} from "@dub/ui";
import { QRCode } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { saveSubscriptionSettings } from "../../app/app.dub.co/(dashboard)/[slug]/operations/actions";

export function SubscriptionSettingsButton({
  slug,
  settings,
}: {
  slug: string;
  settings: RemnawaveSubscriptionSettings;
}) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        text="Subscription settings"
        onClick={() => setShowModal(true)}
      />
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <ModalHeader
          title="Subscription settings"
          description="Configure global behavior for generated subscriptions."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={saveSubscriptionSettings} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="uuid" value={settings.uuid} />
            {[
              ["randomizeHosts", "Randomize hosts", settings.randomizeHosts],
              [
                "serveJsonAtBaseSubscription",
                "Serve base JSON",
                settings.serveJsonAtBaseSubscription,
              ],
              [
                "isShowCustomRemarks",
                "Show custom remarks",
                settings.isShowCustomRemarks,
              ],
            ].map(([name, label, checked]) => (
              <Label
                key={String(name)}
                htmlFor={`subscription-${name}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 font-normal"
              >
                <Checkbox
                  id={`subscription-${name}`}
                  name={String(name)}
                  defaultChecked={Boolean(checked)}
                  className="size-4"
                />
                {String(label)}
              </Label>
            ))}
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Save settings</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function SubscriptionTemplatesTable({
  templates,
}: {
  templates: RemnawaveSubscriptionTemplate[];
}) {
  const columns = useMemo<ColumnDef<RemnawaveSubscriptionTemplate>[]>(
    () => [
      {
        id: "template",
        header: "Template",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.name}
            </p>
            <p className="text-content-subtle font-mono text-xs">
              {row.original.uuid}
            </p>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <StatusBadge icon={null} variant="neutral">
            {row.original.templateType}
          </StatusBadge>
        ),
      },
      { accessorKey: "viewPosition", header: "Position" },
    ],
    [],
  );
  const table = useTable({ data: templates, columns });

  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "templates" : "template")}
      emptyState={
        <EmptyState
          icon={QRCode}
          title="No subscription templates"
          description="Create a template in Remnawave to display it here."
        />
      }
    />
  );
}
