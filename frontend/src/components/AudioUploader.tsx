"use client";

import { useCallback, useState } from "react";
import { uploadAudio } from "@/lib/api";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AudioUploaderProps {
  onUpload: (id: string, filename: string, audioUrl: string) => void;
}

export default function AudioUploader({ onUpload }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Please upload an audio file");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAudio(file);
      const audioUrl = `http://localhost:8000/files/${res.id}${res.format}`;
      onUpload(res.id, file.name, audioUrl);
    } catch {
      alert("Upload failed");
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
    <Card
      className={`relative border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-primary bg-accent"
          : "border-border hover:border-muted-foreground"
      } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isDragging ? "bg-accent" : "bg-muted"
        }`}>
          <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        
        {isUploading ? (
          <p className="text-muted-foreground">Uploading...</p>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-lg font-medium">
                Click or drag to upload audio file
              </p>
              <p className="text-sm text-muted-foreground">
                or drop file here
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant="secondary">MP3</Badge>
              <Badge variant="secondary">WAV</Badge>
              <Badge variant="secondary">OGG</Badge>
              <Badge variant="secondary">M4A</Badge>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}