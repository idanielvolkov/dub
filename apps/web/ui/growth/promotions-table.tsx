"use client";

import { GrowthPromotion } from "@/lib/growth/promotions";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  EmptyState,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ProgressBar,
  StatusBadge,
  Table,
  TableRowMenu,
  useTable,
} from "@dub/ui";
import { Discount } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  deletePromotion,
  updatePromotion,
} from "../../app/app.dub.co/(dashboard)/[slug]/growth/promotions/actions";
import { PromotionFields } from "./promotion-actions";

export function PromotionsTable({
  slug,
  promotions,
}: {
  slug: string;
  promotions: GrowthPromotion[];
}) {
  const [selected, setSelected] = useState<GrowthPromotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GrowthPromotion | null>(
    null,
  );
  const columns = useMemo<ColumnDef<GrowthPromotion>[]>(
    () => [
      {
        id: "code",
        header: "Promo code",
        cell: ({ row }) => (
          <div>
            <code className="text-content-emphasis font-semibold">
              {row.original.code}
            </code>
            <p className="text-content-subtle max-w-64 truncate text-xs">
              {row.original.description}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.active ? "success" : "neutral"}
          >
            {row.original.active ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) =>
          row.original.discountType === "percentage"
            ? `${row.original.discountValue}%`
            : `$${row.original.discountValue}`,
      },
      {
        id: "redemptions",
        header: "Redemptions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <div className="min-w-32">
            <div className="mb-1 text-xs">
              {row.original.redemptions} / {row.original.maxRedemptions || "∞"}
            </div>
            {row.original.maxRedemptions > 0 && (
              <ProgressBar
                value={row.original.redemptions}
                max={row.original.maxRedemptions}
                className="h-1.5"
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: "audience",
        header: "Audience",
        cell: ({ row }) => row.original.audience || "—",
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: "Edit promo code",
                onClick: () => setSelected(row.original),
              },
              {
                label: "Delete promo code",
                variant: "danger",
                onClick: () => setDeleteTarget(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: promotions, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "promo codes" : "promo code")}
        emptyState={
          <EmptyState
            icon={Discount}
            title="No promo codes yet"
            description="Create an offer for your customers."
          />
        }
      />
      <Modal
        showModal={Boolean(selected)}
        setShowModal={(open) => !open && setSelected(null)}
        className="max-w-2xl"
      >
        {selected && (
          <>
            <ModalHeader title="Edit promo code" description={selected.code} />
            <ModalBody asChild className="bg-bg-muted">
              <form
                action={updatePromotion}
                className="grid gap-4 md:grid-cols-2"
              >
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={selected.id} />
                <PromotionFields promotion={selected} />
                <ModalFooter className="-mx-6 -mb-5 mt-1 md:col-span-2">
                  <Button
                    variant="secondary"
                    text="Cancel"
                    onClick={() => setSelected(null)}
                  />
                  <OperationSubmit>Save changes</OperationSubmit>
                </ModalFooter>
              </form>
            </ModalBody>
          </>
        )}
      </Modal>
      <Modal
        showModal={Boolean(deleteTarget)}
        setShowModal={(open) => !open && setDeleteTarget(null)}
      >
        {deleteTarget && (
          <>
            <ModalHeader
              title="Delete promo code"
              description={`Delete ${deleteTarget.code}? This action cannot be undone.`}
            />
            <ModalFooter>
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setDeleteTarget(null)}
              />
              <form action={deletePromotion}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={deleteTarget.id} />
                <OperationSubmit destructive>Delete</OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
