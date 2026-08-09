"use client";

import { VpnPlan } from "@/lib/remnawave/plans";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Button, Checkbox, Input, Label, Modal } from "@dub/ui";
import { useState } from "react";
import {
  createVpnPlan,
  provisionPlan,
  setVpnPlanArchived,
  updateVpnPlan,
} from "../../app/app.dub.co/(dashboard)/[slug]/vpn/plans/actions";

function PlanFields({ plan }: { plan?: VpnPlan }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label>Name</Label>
        <Input name="name" defaultValue={plan?.name} required />
      </div>
      <div className="grid gap-1.5">
        <Label>Price, USD</Label>
        <Input
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={plan?.price}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Duration, days</Label>
        <Input
          name="durationDays"
          type="number"
          min="1"
          defaultValue={plan?.durationDays ?? 30}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Traffic, GB</Label>
        <Input
          name="trafficGb"
          type="number"
          min="1"
          step="0.01"
          defaultValue={plan?.trafficGb}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Devices</Label>
        <Input
          name="devices"
          type="number"
          min="1"
          defaultValue={plan?.devices}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Traffic reset</Label>
        <FormCombobox
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
        <Label>Description</Label>
        <Input name="description" defaultValue={plan?.description} />
      </div>
      <Label className="flex items-center gap-2 font-normal sm:col-span-2">
        <Checkbox
          name="featured"
          defaultChecked={plan?.featured}
          className="size-4 rounded"
        />
        Mark as most popular
      </Label>
    </div>
  );
}

function FormModal({
  open,
  setOpen,
  title,
  description,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Modal showModal={open} setShowModal={setOpen} className="max-w-xl">
      <div className="border-border-subtle border-b px-6 py-4">
        <h3 className="text-content-emphasis text-lg font-medium">{title}</h3>
        <p className="text-content-subtle mt-1 text-sm">{description}</p>
      </div>
      {children}
    </Modal>
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
      <FormModal
        open={open}
        setOpen={setOpen}
        title="Create plan"
        description="Add a new plan to the Detz catalog."
      >
        <form action={createVpnPlan} className="bg-bg-muted space-y-5 p-6">
          <input type="hidden" name="slug" value={slug} />
          <PlanFields />
          <div className="flex justify-end gap-2">
            <Button
              className="w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setOpen(false)}
            />
            <OperationSubmit>Create plan</OperationSubmit>
          </div>
        </form>
      </FormModal>
    </>
  );
}

export function PlanCardActions({
  slug,
  plan,
}: {
  slug: string;
  plan: VpnPlan;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button text="Provision" onClick={() => setProvisionOpen(true)} />
        <Button
          variant="secondary"
          text="Edit"
          onClick={() => setEditOpen(true)}
        />
      </div>
      <FormModal
        open={provisionOpen}
        setOpen={setProvisionOpen}
        title={`Provision ${plan.name}`}
        description="Create a Remnawave subscriber with this plan's limits."
      >
        <form action={provisionPlan} className="bg-bg-muted space-y-4 p-6">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="planId" value={plan.id} />
          <div className="grid gap-1.5">
            <Label>Subscriber name</Label>
            <Input name="username" minLength={3} required />
          </div>
          <OperationSubmit>Provision access</OperationSubmit>
        </form>
      </FormModal>
      <FormModal
        open={editOpen}
        setOpen={setEditOpen}
        title={`Edit ${plan.name}`}
        description="Update pricing and Remnawave access limits."
      >
        <div className="bg-bg-muted p-6">
          <form action={updateVpnPlan} className="space-y-5">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={plan.id} />
            <PlanFields plan={plan} />
            <div className="flex justify-end gap-2">
              <OperationSubmit>Save changes</OperationSubmit>
            </div>
          </form>
          <form action={setVpnPlanArchived} className="mt-3 flex justify-end">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={plan.id} />
            <input type="hidden" name="archived" value="true" />
            <OperationSubmit
              destructive
              confirmMessage="Archive this plan? Existing subscribers will not be affected."
            >
              Archive plan
            </OperationSubmit>
          </form>
        </div>
      </FormModal>
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
