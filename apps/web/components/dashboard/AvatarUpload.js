"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

export default function AvatarUpload() {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

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
    try {
      const data = await api.upload("/users/me/avatar", file);
      if (data.user) {
        setUser(data.user);
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={handlePick} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload avatar"}
      </Button>
      <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
    </div>
  );
}
