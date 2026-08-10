"use client";

import { VpnPlan } from "@/lib/remnawave/plans";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  Checkbox,
  EmptyState,
  FormCombobox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  TableRowMenu,
  useTable,
} from "@dub/ui";
import { Cards } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  createVpnPlan,
  provisionPlan,
  setVpnPlanArchived,
  updateVpnPlan,
} from "../../app/app.dub.co/(dashboard)/[slug]/vpn/plans/actions";

function PlanFields({ plan }: { plan?: VpnPlan }) {
  const fieldPrefix = plan ? `plan-${plan.id}` : "new-plan";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor={`${fieldPrefix}-name`}>Name</Label>
        <Input
          id={`${fieldPrefix}-name`}
          name="name"
          defaultValue={plan?.name}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${fieldPrefix}-price`}>Price, USD</Label>
        <Input
          id={`${fieldPrefix}-price`}
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={plan?.price}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${fieldPrefix}-duration`}>Duration, days</Label>
        <Input
          id={`${fieldPrefix}-duration`}
          name="durationDays"
          type="number"
          min="1"
          defaultValue={plan?.durationDays ?? 30}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${fieldPrefix}-traffic`}>Traffic, GB</Label>
        <Input
          id={`${fieldPrefix}-traffic`}
          name="trafficGb"
          type="number"
          min="1"
          step="0.01"
          defaultValue={plan?.trafficGb}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${fieldPrefix}-devices`}>Devices</Label>
        <Input
          id={`${fieldPrefix}-devices`}
          name="devices"
          type="number"
          min="1"
          defaultValue={plan?.devices}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${fieldPrefix}-reset`}>Traffic reset</Label>
        <FormCombobox
          id={`${fieldPrefix}-reset`}
          name="reset"
          defaultValue={plan?.reset ?? "MONTH"}
          options={[
            { value: "NO_RESET", label: "No reset" },
            { value: "DAY", label: "Daily" },
            { value: "WEEK", label: "Weekly" },
            { value: "MONTH", label: "Monthly" },
          ]}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor={`${fieldPrefix}-description`}>Description</Label>
        <Input
          id={`${fieldPrefix}-description`}
          name="description"
          defaultValue={plan?.description}
        />
      </div>
      <Label
        htmlFor={`${fieldPrefix}-featured`}
        className="flex cursor-pointer items-center gap-2 font-normal sm:col-span-2"
      >
        <Checkbox
          id={`${fieldPrefix}-featured`}
          name="featured"
          defaultChecked={plan?.featured}
        />
        Mark as most popular
      </Label>
    </div>
  );
}

export function CreatePlanButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className="w-fit"
        text="Create plan"
        onClick={() => setOpen(true)}
      />
      <Modal showModal={open} setShowModal={setOpen} className="max-w-xl">
        <ModalHeader
          title="Create plan"
          description="Create a plan for your VPN catalog."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createVpnPlan} className="space-y-5">
            <input type="hidden" name="slug" value={slug} />
            <PlanFields />
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                className="w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setOpen(false)}
              />
              <OperationSubmit>Create plan</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function PlanCardActions({
  slug,
  plan,
  canProvision,
}: {
  slug: string;
  plan: VpnPlan;
  canProvision: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  return (
    <>
      <div className={`grid gap-2 ${canProvision ? "grid-cols-2" : ""}`}>
        {canProvision && (
          <Button text="Provision" onClick={() => setProvisionOpen(true)} />
        )}
        <Button
          variant="secondary"
          text="Edit"
          onClick={() => setEditOpen(true)}
        />
      </div>
      {canProvision && (
        <Modal
          showModal={provisionOpen}
          setShowModal={setProvisionOpen}
          className="max-w-xl"
        >
          <ModalHeader
            title={`Provision ${plan.name}`}
            description="Create a Remnawave user with this plan's limits."
          />
          <ModalBody asChild className="bg-bg-muted">
            <form action={provisionPlan} className="space-y-4">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="planId" value={plan.id} />
              <div className="grid gap-1.5">
                <Label htmlFor={`provision-${plan.id}-username`}>
                  Username
                </Label>
                <Input
                  id={`provision-${plan.id}-username`}
                  name="username"
                  minLength={3}
                  required
                />
              </div>
              <ModalFooter className="-mx-6 -mb-5">
                <Button
                  className="w-fit"
                  variant="secondary"
                  text="Cancel"
                  onClick={() => setProvisionOpen(false)}
                />
                <OperationSubmit>Provision access</OperationSubmit>
              </ModalFooter>
            </form>
          </ModalBody>
        </Modal>
      )}
      <Modal
        showModal={editOpen}
        setShowModal={setEditOpen}
        className="max-w-xl"
      >
        <ModalHeader
          title={`Edit ${plan.name}`}
          description="Update pricing and access limits."
        />
        <ModalBody className="bg-bg-muted">
          <form action={updateVpnPlan} className="space-y-5">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={plan.id} />
            <PlanFields plan={plan} />
            <div className="flex justify-end gap-2">
              <OperationSubmit>Save changes</OperationSubmit>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <form action={setVpnPlanArchived}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={plan.id} />
            <input type="hidden" name="archived" value="true" />
            <OperationSubmit
              destructive
              confirmMessage="Archive this plan? Existing users will not be affected."
            >
              Archive plan
            </OperationSubmit>
          </form>
        </ModalFooter>
      </Modal>
    </>
  );
}

export function RestorePlanButton({
  slug,
  planId,
}: {
  slug: string;
  planId: string;
}) {
  return (
    <form action={setVpnPlanArchived}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="id" value={planId} />
      <input type="hidden" name="archived" value="false" />
      <OperationSubmit>Restore</OperationSubmit>
    </form>
  );
}

export function ArchivedPlansTable({
  slug,
  plans,
}: {
  slug: string;
  plans: VpnPlan[];
}) {
  const [selected, setSelected] = useState<VpnPlan | null>(null);
  const columns = useMemo<ColumnDef<VpnPlan>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Plan",
        cell: ({ row }) => (
          <span className="text-content-emphasis font-medium">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => `$${row.original.price}`,
      },
      {
        id: "duration",
        header: "Duration",
        cell: ({ row }) => `${row.original.durationDays} days`,
      },
      {
        id: "status",
        header: "Status",
        cell: () => (
          <StatusBadge icon={null} variant="neutral">
            Archived
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: "Restore plan",
                onClick: () => setSelected(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: plans, columns });
  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "plans" : "plan")}
        emptyState={
          <EmptyState
            icon={Cards}
            title="No archived plans"
            description="Archived plans will appear here."
          />
        }
      />
      <Modal
        showModal={Boolean(selected)}
        setShowModal={(open) => !open && setSelected(null)}
      >
        {selected && (
          <>
            <ModalHeader
              title="Restore plan"
              description={`Make ${selected.name} available again?`}
            />
            <ModalFooter>
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setSelected(null)}
              />
              <form action={setVpnPlanArchived}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="archived" value="false" />
                <OperationSubmit>Restore plan</OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
