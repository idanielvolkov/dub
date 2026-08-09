"use client";

import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Button, Input, Label, Modal } from "@dub/ui";
import { useState } from "react";
import { createGrowthCampaign } from "../../app/app.dub.co/(dashboard)/[slug]/growth/campaigns/actions";

export function CreateCampaignButton({
  slug,
  domains,
}: {
  slug: string;
  domains: string[];
}) {
  const [showModal, setShowModal] = useState(false);
  const domain = domains[0];

  return (
    <>
      <Button
        className="h-9 w-fit px-3"
        text="Create campaign"
        disabled={!domain}
        disabledTooltip={
          !domain ? "Add and verify a short domain first." : undefined
        }
        onClick={() => setShowModal(true)}
      />
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-2xl"
      >
        <div className="border-border-subtle border-b px-6 py-4">
          <h3 className="text-content-emphasis text-lg font-medium">
            Create campaign
          </h3>
          <p className="text-content-subtle mt-1 text-sm">
            Create a trackable campaign link with UTM attribution.
          </p>
        </div>
        <form
          action={createGrowthCampaign}
          className="bg-bg-muted grid gap-4 p-6 md:grid-cols-2"
        >
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="new-campaign-name">Campaign name</Label>
            <Input
              id="new-campaign-name"
              name="title"
              placeholder="Summer VPN launch"
              required
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="new-campaign-url">Destination URL</Label>
            <Input
              id="new-campaign-url"
              type="url"
              name="url"
              placeholder="https://detz.fun/pricing"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-domain">Short domain</Label>
            <FormCombobox
              id="new-campaign-domain"
              name="domain"
              defaultValue={domain}
              options={domains.map((value) => ({ value, label: value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-path">Short path</Label>
            <Input
              id="new-campaign-path"
              name="key"
              placeholder="summer"
              pattern="[A-Za-z0-9/_-]+"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-utm">UTM campaign</Label>
            <Input
              id="new-campaign-utm"
              name="campaign"
              placeholder="summer-2026"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-owner">Owner</Label>
            <Input
              id="new-campaign-owner"
              name="owner"
              placeholder="Marketing team"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-source">Source</Label>
            <Input
              id="new-campaign-source"
              name="source"
              placeholder="telegram"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-medium">Medium</Label>
            <Input
              id="new-campaign-medium"
              name="medium"
              placeholder="social"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-budget">Budget</Label>
            <Input
              id="new-campaign-budget"
              type="number"
              name="budget"
              min={0}
              step="1"
              placeholder="0"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-campaign-status">Status</Label>
            <FormCombobox
              id="new-campaign-status"
              name="status"
              defaultValue="draft"
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              className="w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setShowModal(false)}
            />
            <OperationSubmit>Create campaign</OperationSubmit>
          </div>
        </form>
      </Modal>
    </>
  );
}
