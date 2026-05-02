"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

export default function AttachmentUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState(null);

  const handlePick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const data = await api.upload("/uploads/attachments", file);
      setAttachment(data.attachment);
      if (onUploaded) {
        onUploaded(data.attachment);
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attachment</p>
          {attachment ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-200"
            >
              {attachment.name || "View uploaded file"}
            </a>
          ) : (
            <p className="text-xs text-slate-500">Upload a file to share.</p>
          )}
        </div>
        <div>
          <Button variant="ghost" onClick={handlePick} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload file"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
