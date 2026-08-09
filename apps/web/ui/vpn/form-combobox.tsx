"use client";

import { Combobox, ComboboxOption } from "@dub/ui";
import { useState } from "react";

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
          className: `w-full justify-start border-neutral-300 px-3 ${className ?? ""}`,
        }}
      />
    </>
  );
}
