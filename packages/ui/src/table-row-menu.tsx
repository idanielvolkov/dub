"use client";

import { useState } from "react";
import { Button } from "./button";
import { Dots, Icon } from "./icons";
import { MenuItem } from "./menu-item";
import { Popover } from "./popover";

export function TableRowMenu({
  actions,
}: {
  actions: {
    label: string;
    icon?: Icon;
    variant?: "default" | "danger";
    onClick: () => void;
  }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      align="end"
      openPopover={open}
      setOpenPopover={setOpen}
      content={
        <div className="grid w-48 gap-1 p-2">
          {actions.map(({ label, icon, variant, onClick }) => (
            <MenuItem
              key={label}
              icon={icon}
              variant={variant}
              onClick={() => {
                setOpen(false);
                onClick();
              }}
            >
              {label}
            </MenuItem>
          ))}
        </div>
      }
    >
      <Button
        type="button"
        aria-label="Open row actions"
        variant="outline"
        className="text-content-subtle size-8 rounded-md border-transparent p-0"
        icon={<Dots className="size-4" />}
      />
    </Popover>
  );
}
