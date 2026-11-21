"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const debounced = useDebounce(text, 400);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Keep in sync when the URL changes from elsewhere (back button, "clear filters").
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  useEffect(() => {
    const term = debounced.trim();
    if (term === (value ?? "")) return;
    if (term.length === 0 || term.length >= minLength) onChangeRef.current(term);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, minLength]);

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
