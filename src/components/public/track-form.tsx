"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trackSchema, type TrackInput } from "@/lib/validations/common";

interface TrackFormProps {
  defaultCode?: string;
  className?: string;
  size?: "default" | "lg";
}

export function TrackForm({ defaultCode = "", className, size = "default" }: TrackFormProps) {
  const router = useRouter();
  const form = useForm<TrackInput>({
    resolver: zodResolver(trackSchema),
    defaultValues: { code: defaultCode },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(({ code }) => {
    router.push(`/track?code=${encodeURIComponent(code.trim().toUpperCase())}`);
  });

  const error = form.formState.errors.code;

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="track-code" className="sr-only">
          Tracking code
        </FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="track-code"
              placeholder="CF-261116-ABC123"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!error}
              className={cn("bg-card pl-9 font-mono uppercase", size === "lg" ? "h-11" : "h-10")}
              {...form.register("code")}
            />
          </div>
          <Button type="submit" size={size === "lg" ? "lg" : "default"} className={size === "lg" ? "h-11" : "h-10"}>
            Track
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
        <FieldError errors={[error]} />
      </Field>
    </form>
  );
}
