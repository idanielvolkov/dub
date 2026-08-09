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
            <Label htmlFor={`provision-${plan.id}-username`}>
              Subscriber name
            </Label>
            <Input
              id={`provision-${plan.id}-username`}
              name="username"
              minLength={3}
              required
            />
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
