"use client";

import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@dub/ui";
import { useState } from "react";
import { createGrowthLead } from "../../app/app.dub.co/(dashboard)/[slug]/growth/leads/actions";

export function CreateLeadButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className="h-9 w-fit px-3"
        text="Add lead"
        onClick={() => setShowModal(true)}
      />
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-xl"
      >
        <ModalHeader
          title="Add lead"
          description="Create a contact when campaign attribution is unavailable."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createGrowthLead} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="new-lead-name">Name</Label>
              <Input id="new-lead-name" name="name" placeholder="Alex Smith" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-lead-email">Email</Label>
              <Input
                id="new-lead-email"
                type="email"
                name="email"
                placeholder="alex@example.com"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-lead-country">Country</Label>
              <Input
                id="new-lead-country"
                name="country"
                maxLength={2}
                placeholder="US"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-lead-owner">Owner</Label>
              <Input
                id="new-lead-owner"
                name="owner"
                placeholder="Sales team"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-lead-stage">Stage</Label>
              <FormCombobox
                id="new-lead-stage"
                name="status"
                defaultValue="new"
                options={[
                  { value: "new", label: "New" },
                  { value: "contacted", label: "Contacted" },
                  { value: "qualified", label: "Qualified" },
                  { value: "won", label: "Won" },
                  { value: "lost", label: "Lost" },
                ]}
              />
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="new-lead-note">Note</Label>
              <Input
                id="new-lead-note"
                name="note"
                placeholder="Interested in annual business plan"
              />
            </div>
            <ModalFooter className="-mx-6 -mb-5 mt-1 md:col-span-2">
              <Button
                className="w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Add lead</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
