"use client";

import { MenuItem, Popover } from "@dub/ui";
import { Icon, MoreVertical } from "@dub/ui/icons";
import { useState } from "react";

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
      <button
        type="button"
        aria-label="Open row actions"
        className="text-content-subtle hover:bg-bg-subtle active:bg-bg-muted flex size-8 items-center justify-center rounded-md transition-colors"
      >
        <MoreVertical className="size-4" />
      </button>
    </Popover>
  );
}
