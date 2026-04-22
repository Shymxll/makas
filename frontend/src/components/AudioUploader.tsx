"use client";

import { useState, useCallback } from "react";
import { uploadAudio } from "@/lib/api";

interface AudioUploaderProps {
  onUpload: (fileId: string, filename: string, audioUrl: string) => void;
}

export default function AudioUploader({ onUpload }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Lütfen ses dosyası yükleyin");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAudio(file);
      const audioUrl = `http://localhost:8000/files/${res.id}${res.format}`;
      onUpload(res.id, file.name, audioUrl);
    } catch {
      alert("Yükleme başarısız");
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={onChange}
        className="hidden"
        id="audio-upload"
        disabled={isUploading}
      />
      <label htmlFor="audio-upload" className="cursor-pointer">
        {isUploading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700">
              Ses dosyası yüklemek için tıklayın veya sürükleyin
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Desteklenen formatlar: MP3, WAV, OGG, M4A
            </p>
          </>
        )}
      </label>
    </div>
  );
}