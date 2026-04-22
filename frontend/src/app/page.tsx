"use client";

import { Scissors, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { uploadAudio } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    try {
      await uploadAudio(file);
      router.push("/editor");
    } catch {
      console.error("Upload failed");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="flex w-1/2 flex-col justify-center px-16">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white">
            <Scissors className="h-6 w-6" />
          </div>
          <span className="font-mono text-3xl font-bold tracking-tight">MAKAS</span>
        </div>

        <p className="mt-8 max-w-xs text-lg text-neutral-500">
          Ses dosyalarındaki sessiz kısımları otomatik kes
        </p>

        <div className="mt-8 flex gap-2">
          <span className="rounded-full border border-neutral-800 px-4 py-2 font-mono text-sm text-neutral-500">
            WAV
          </span>
          <span className="flex items-center text-neutral-800">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="rounded-full border border-neutral-800 px-4 py-2 font-mono text-sm text-neutral-500">
            MP3
          </span>
        </div>
      </div>

      <div className="flex w-1/2 items-center justify-center border-l border-neutral-900 px-16">
        <label
          className={`relative flex w-full max-w-md flex-col items-center gap-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
            isDragging ? "border-white bg-white/10" : "border-neutral-800 hover:border-neutral-600"
          }`}
        >
          <input
            type="file"
            accept="audio/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800">
            <Upload className="h-8 w-8 text-neutral-500" />
          </div>
          <p className="text-lg font-medium">Dosya yükle</p>
          <p className="text-sm text-neutral-600">WAV, MP3, OGG, FLAC</p>
        </label>
      </div>
    </div>
  );
}