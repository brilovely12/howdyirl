"use client";

import { useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function ImagePicker({
  mainImage,
  onMainChange,
  gallery,
  onGalleryChange,
  folder,
}: {
  mainImage: string | null;
  onMainChange: (url: string | null) => void;
  gallery: string[];
  onGalleryChange: (urls: string[]) => void;
  folder: string;
}) {
  const supabase = getBrowserClient();
  const mainRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<string | null> {
    if (file.size > 2 * 1024 * 1024) {
      setError("Each image must be under 2 MB.");
      return null;
    }
    if (!file.type.startsWith("image/")) {
      setError("File must be an image.");
      return null;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("howdy").upload(path, file, { upsert: true });
    if (upErr) {
      setError("Upload failed: " + upErr.message);
      return null;
    }
    const { data } = supabase.storage.from("howdy").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleMain(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (url) onMainChange(url);
    e.target.value = "";
  }

  async function handleGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = 5 - gallery.length;
    if (remaining <= 0) {
      setError("Maximum 5 additional images.");
      return;
    }
    setError(null);
    setUploading(true);
    const toUpload = Array.from(files).slice(0, remaining);
    const urls: string[] = [];
    for (const file of toUpload) {
      const url = await upload(file);
      if (url) urls.push(url);
    }
    setUploading(false);
    if (urls.length) onGalleryChange([...gallery, ...urls]);
    e.target.value = "";
  }

  function removeGallery(index: number) {
    onGalleryChange(gallery.filter((_, i) => i !== index));
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <label>main photo</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        {mainImage ? (
          <img src={mainImage} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, border: "1px solid var(--rule)" }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: 4, background: "var(--panel-2)", border: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--ink-faint)" }}>
            No photo
          </div>
        )}
        <div>
          <input ref={mainRef} type="file" accept="image/*" onChange={handleMain} style={{ display: "none" }} />
          <button type="button" className="btn ghost" style={{ width: "auto", fontSize: 11, padding: "5px 12px" }} onClick={() => mainRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : mainImage ? "Change" : "Upload"}
          </button>
          {mainImage && (
            <button type="button" style={{ background: "none", border: "none", fontSize: 11, color: "var(--ink-faint)", cursor: "pointer", marginLeft: 8 }} onClick={() => onMainChange(null)}>
              Remove
            </button>
          )}
        </div>
      </div>

      <label>additional photos <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>(up to 5)</span></label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {gallery.map((url, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img src={url} alt="" style={{ width: 70, height: 55, objectFit: "cover", borderRadius: 3, border: "1px solid var(--rule)" }} />
            <button
              type="button"
              onClick={() => removeGallery(i)}
              style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--panel)", border: "1px solid var(--rule)",
                color: "var(--ink-faint)", fontSize: 11, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {gallery.length < 5 && (
          <>
            <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGallery} style={{ display: "none" }} />
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={uploading}
              style={{
                width: 70, height: 55, borderRadius: 3,
                background: "var(--panel-2)", border: "1px dashed var(--rule)",
                color: "var(--ink-faint)", fontSize: 20, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              +
            </button>
          </>
        )}
      </div>
      <div className="hint">Max 2 MB each. Square or landscape works best.</div>

      {error && <div className="hint" style={{ color: "var(--red)", marginTop: 4 }}>{error}</div>}
    </div>
  );
}
