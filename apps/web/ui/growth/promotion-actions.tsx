"use client";

import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  Checkbox,
  FormCombobox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@dub/ui";
import { useState } from "react";
import { createPromotion } from "../../app/app.dub.co/(dashboard)/[slug]/growth/promotions/actions";

type PromotionFieldsValue = {
  id: string;
  code: string;
  description: string;
  audience: string;
  discountType: string;
  discountValue: number;
  startsAt: string | null;
  endsAt: string | null;
  maxRedemptions: number;
  active: boolean;
};

export function PromotionFields({
  promotion,
}: {
  promotion?: PromotionFieldsValue;
}) {
  const prefix = promotion ? `promotion-${promotion.id}` : "new-promotion";

  return (
    <>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-code`}>Code</Label>
        <Input
          id={`${prefix}-code`}
          name="code"
          defaultValue={promotion?.code}
          placeholder="WELCOME20"
          pattern="[A-Za-z0-9_-]+"
          minLength={3}
          maxLength={32}
          required
        />
      </div>
      <div className="grid gap-1.5 md:col-span-2">
        <Label htmlFor={`${prefix}-description`}>Description</Label>
        <Input
          id={`${prefix}-description`}
          name="description"
          defaultValue={promotion?.description}
          placeholder="20% off the first month"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-audience`}>Audience</Label>
        <Input
          id={`${prefix}-audience`}
          name="audience"
          defaultValue={promotion?.audience}
          placeholder="New users"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-discount-type`}>Discount type</Label>
        <FormCombobox
          id={`${prefix}-discount-type`}
          name="discountType"
          defaultValue={promotion?.discountType || "percentage"}
          options={[
            { value: "percentage", label: "Percentage" },
            { value: "fixed", label: "Fixed amount" },
          ]}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-value`}>Value</Label>
        <Input
          id={`${prefix}-value`}
          type="number"
          name="discountValue"
          min={0}
          step="1"
          defaultValue={promotion?.discountValue || 0}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-starts`}>Starts</Label>
        <Input
          id={`${prefix}-starts`}
          type="date"
          name="startsAt"
          defaultValue={promotion?.startsAt || ""}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-ends`}>Ends</Label>
        <Input
          id={`${prefix}-ends`}
          type="date"
          name="endsAt"
          defaultValue={promotion?.endsAt || ""}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${prefix}-limit`}>Redemption limit</Label>
        <Input
          id={`${prefix}-limit`}
          type="number"
          name="maxRedemptions"
          min={0}
          defaultValue={promotion?.maxRedemptions || 0}
        />
        <span className="text-content-subtle text-xs">0 means unlimited</span>
      </div>
      <Label
        htmlFor={`${prefix}-active`}
        className="flex cursor-pointer items-center gap-2 self-end pb-2 font-normal"
      >
        <Checkbox
          id={`${prefix}-active`}
          name="active"
          defaultChecked={promotion?.active ?? false}
          className="size-4"
        />
        Active
      </Label>
    </>
  );
}

export function CreatePromotionButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className="h-9 w-fit px-3"
        text="Create promo code"
        onClick={() => setShowModal(true)}
      />
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-2xl"
      >
        <ModalHeader
          title="Create promo code"
          description="Create an offer for your customers."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createPromotion} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <PromotionFields />
            <ModalFooter className="-mx-6 -mb-5 mt-1 md:col-span-2">
              <Button
                className="w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Create promo code</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
