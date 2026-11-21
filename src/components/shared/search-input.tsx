"use client";

import { Search, X } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  /** The API rejects search terms shorter than this. */
  minLength?: number;
  className?: string;
}

/** Debounced search box. Pushes the term to the URL only after the user pauses typing. */
export function SearchInput({ value, onChange, placeholder = "Search…", minLength = 2, className }: SearchInputProps) {
  const [text, setText] = useState(value ?? "");
  const [synced, setSynced] = useState(value);
  const debounced = useDebounce(text, 400);

  // Keep in sync when the URL changes from elsewhere (back button, "clear filters"):
  // adjust state during render instead of in an effect.
  if (value !== synced) {
    setSynced(value);
    setText(value ?? "");
  }

  const emit = useEffectEvent((term: string) => {
    if (term === (value ?? "")) return;
    if (term.length === 0 || term.length >= minLength) onChange(term);
  });

  useEffect(() => {
    emit(debounced.trim());
  }, [debounced]);

  return (
    <InputGroup className={cn("h-9 w-full sm:w-72", className)}>
      <InputGroupAddon>
        <Search aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {text ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" onClick={() => setText("")} aria-label="Clear search">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
