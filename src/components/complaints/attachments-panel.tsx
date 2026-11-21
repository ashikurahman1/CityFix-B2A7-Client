"use client";

import { FileText, ImagePlus, Paperclip, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUploadAttachments } from "@/hooks/queries/use-complaints";
import { ALLOWED_FILE_TYPES, MAX_ATTACHMENTS, MAX_FILE_BYTES } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import type { Attachment, ComplaintStatus } from "@/types/api";

const LOCKED: ComplaintStatus[] = ["CLOSED", "CANCELLED", "REJECTED"];

interface Pending {
  file: File;
  preview: string | null;
}

/** Gallery of uploaded files plus a client-validated uploader with previews and a progress bar. */
export function AttachmentsPanel({
  complaintId,
  attachments,
  status,
}: {
  complaintId: string;
  attachments: Attachment[];
  status: ComplaintStatus;
}) {
  const upload = useUploadAttachments(complaintId);
  const [pending, setPending] = useState<Pending[]>([]);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_ATTACHMENTS - attachments.length;
  const canUpload = !LOCKED.includes(status) && remaining > 0;

  // Release object URLs when previews go away.
  useEffect(() => () => pending.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)), [pending]);

  const pick = (list: FileList | null) => {
    if (!list) return;
    const files = [...list];
    const errors: string[] = [];
    const accepted = files.filter((f) => {
      if (!ALLOWED_FILE_TYPES.includes(f.type)) errors.push(`${f.name}: only JPEG, PNG, WEBP or PDF`);
      else if (f.size > MAX_FILE_BYTES) errors.push(`${f.name}: larger than 5 MB`);
      else return true;
      return false;
    });
    const room = Math.min(3, remaining) - pending.length;
    if (accepted.length > room) errors.push(`You can add ${Math.max(room, 0)} more file(s) in this upload`);
    errors.forEach((e) => toast.error(e));
    setPending((prev) => [
      ...prev,
      ...accepted.slice(0, Math.max(room, 0)).map((file) => ({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })),
    ]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const send = () => {
    setProgress(0);
    upload.mutate(
      { files: pending.map((p) => p.file), onProgress: setProgress },
      { onSuccess: () => setPending([]) },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans text-base">
          <Paperclip className="size-4" aria-hidden="true" /> Photos & documents
        </CardTitle>
        <CardDescription>
          {attachments.length} of {MAX_ATTACHMENTS} files · JPEG, PNG, WEBP or PDF up to 5 MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {attachments.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-xl border bg-muted/40"
                >
                  {a.mimeType.startsWith("image/") ? (
                    <Image
                      src={a.url}
                      alt={a.fileName}
                      width={320}
                      height={240}
                      sizes="(min-width: 640px) 200px, 45vw"
                      className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1 p-2 text-muted-foreground">
                      <FileText className="size-8" aria-hidden="true" />
                      <span className="text-xs">PDF</span>
                    </div>
                  )}
                  <p className="truncate px-2 py-1.5 text-xs">{a.fileName}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No files attached yet.</p>
        )}

        {canUpload ? (
          <div className="space-y-3 rounded-xl border border-dashed p-4">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ALLOWED_FILE_TYPES.join(",")}
              className="sr-only"
              id={`upload-${complaintId}`}
              onChange={(e) => pick(e.target.files)}
              disabled={upload.isPending}
            />
            {pending.length > 0 ? (
              <ul className="grid gap-2">
                {pending.map((p, i) => (
                  <li key={`${p.file.name}-${i}`} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                    {p.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not optimisable
                      <img src={p.preview} alt="" className="size-10 rounded-md object-cover" />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-md bg-background">
                        <FileText className="size-5 text-muted-foreground" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(p.file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${p.file.name}`}
                      disabled={upload.isPending}
                      onClick={() => setPending((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            {upload.isPending ? (
              <div className="space-y-1.5" aria-live="polite">
                <Progress value={progress} aria-label="Upload progress" />
                <p className="text-xs text-muted-foreground">
                  {progress < 100 ? `Uploading… ${progress}%` : "Processing on Cloudinary…"}
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild disabled={upload.isPending}>
                <label htmlFor={`upload-${complaintId}`} className="cursor-pointer">
                  <ImagePlus data-icon="inline-start" /> Choose files
                </label>
              </Button>
              {pending.length > 0 ? (
                <Button size="sm" onClick={send} disabled={upload.isPending}>
                  <Upload data-icon="inline-start" /> Upload {pending.length}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
