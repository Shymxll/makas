"use client";

import { useState, useCallback } from "react";
import AudioUploader from "@/components/AudioUploader";
import Waveform from "@/components/Waveform";
import EffectsPanel, { EffectSettings } from "@/components/EffectsPanel";

interface Region {
  start: number;
  end: number;
  type: "silence" | "removed";
}

interface PreviewData {
  regions: Region[];
  duration: number;
  keptStart: number;
  keptEnd: number;
}

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const handleUpload = (id: string, filename: string, url: string) => {
    setFileId(id);
    setAudioUrl(url);
    setProcessedUrl(null);
    setPreviewData(null);
  };

  const handlePreview = useCallback(async (settings: EffectSettings) => {
    if (!fileId) return;

    try {
      const res = await fetch("http://localhost:8000/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, ...settings }),
      });
      const data = await res.json();
      setPreviewData(data);
    } catch {
      setPreviewData(null);
    }
  }, [fileId]);

  const handleApplyEffects = async (settings: EffectSettings) => {
    if (!fileId) return;

    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, ...settings }),
      });
      const data = await res.json();
      setProcessedUrl(data.url);
    } catch {
      alert("İşleme başarısız");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = ms / 1000;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Makas - Ses İşleme</h1>

        {!audioUrl ? (
          <AudioUploader onUpload={handleUpload} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Orijinal Ses</h2>
                {previewData && (
                  <span className="text-sm text-gray-500">
                    {formatTime(previewData.keptEnd - previewData.keptStart)} / {formatTime(previewData.duration)} tutulacak
                  </span>
                )}
              </div>
              <Waveform 
                audioUrl={audioUrl} 
                regions={previewData?.regions || []}
                showRegions={!!previewData}
              />
              {previewData && (
                <div className="mt-2 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-3 bg-red-200 rounded"></div>
                    <span>Gidilecek</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-3 bg-yellow-200 rounded"></div>
                    <span>Sessiz</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-3 bg-blue-100 rounded"></div>
                    <span>Tutulacak</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <EffectsPanel 
                onApply={handleApplyEffects} 
                isProcessing={isProcessing}
                onPreview={handlePreview}
              />
              
              {processedUrl && (
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">İşlenmiş Ses</h2>
                  <Waveform audioUrl={processedUrl} color="#10B981" />
                  <a
                    href={`http://localhost:8000/api/download/${fileId}`}
                    className="mt-4 block w-full bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    İndir
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}