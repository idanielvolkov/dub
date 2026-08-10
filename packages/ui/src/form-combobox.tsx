"use client";

import { cn } from "@dub/utils";
import { useState } from "react";
import { Combobox, ComboboxOption } from "./combobox";

export function FormCombobox({
  id,
  name,
  options,
  defaultValue,
  placeholder = "Select",
  className,
}: {
  id?: string;
  name: string;
  options: ComboboxOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const initialOption =
    options.find((option) => option.value === defaultValue) ??
    options[0] ??
    null;
  const [selected, setSelected] = useState<ComboboxOption | null>(
    initialOption,
  );

  return (
    <>
      <input type="hidden" name={name} value={selected?.value ?? ""} />
      <Combobox
        selected={selected}
        setSelected={setSelected}
        options={options}
        placeholder={placeholder}
        caret
        hideSearch
        matchTriggerWidth
        buttonProps={{
          id,
          className: cn("w-full justify-start px-3", className),
        }}
      />
    </>
  );
}
