"use client";

import { useState, useCallback } from "react";
import AudioUploader from "@/components/AudioUploader";
import Waveform from "@/components/Waveform";
import VolumeMeter from "@/components/VolumeMeter";
import SilenceAnalyzer from "@/components/SilenceAnalyzer";
import EffectsPanel, { EffectSettings } from "@/components/EffectsPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Scissors,
  Upload,
  FileAudio,
  Download,
  RotateCcw,
  Undo2,
  Redo2,
  Save,
  Settings,
  HelpCircle,
} from "lucide-react";

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

const menuItems = [
  { icon: Upload, label: "Upload", id: "upload" },
  { icon: FileAudio, label: "File", id: "file" },
];

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>("upload");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleUpload = (id: string, name: string, url: string) => {
    setFileId(id);
    setFilename(name);
    setAudioUrl(url);
    setProcessedUrl(null);
    setPreviewData(null);
  };

  const handleReset = () => {
    setAudioUrl(null);
    setProcessedUrl(null);
    setFileId(null);
    setFilename(null);
    setPreviewData(null);
    setActiveMenu("upload");
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
    setProcessingProgress(0);

    const progressInterval = setInterval(() => {
      setProcessingProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      const res = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, ...settings }),
      });
      const data = await res.json();
      setProcessedUrl(`http://localhost:8000${data.url}`);
      setProcessingProgress(100);
    } catch {
      console.error("İşleme başarısız");
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = ms / 1000;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFileFormat = () => {
    if (!filename) return null;
    const ext = filename.split(".").pop()?.toUpperCase();
    return ext;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-neutral-950 text-neutral-100">
        <Sidebar className="border-r border-neutral-800 bg-neutral-900" collapsible="icon">
          <SidebarHeader className="flex h-14 items-center justify-center border-b border-neutral-800 px-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-700">
                <Scissors className="h-4 w-4 text-neutral-200" />
              </div>
              <span className="font-mono text-sm font-bold">MAKAS</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeMenu === item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="mt-1 text-xs">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-neutral-800 p-2">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4" />
                <span className="ml-2">Ayarlar</span>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <HelpCircle className="h-4 w-4" />
                <span className="ml-2">Yardım</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-neutral-950">
          <header className="flex h-14 items-center border-b border-neutral-800 px-4">
            <SidebarTrigger />
            <div className="ml-4 flex items-center gap-3">
              <span className="font-mono text-sm text-neutral-400">
                {filename || "Makas Editor"}
              </span>
              {filename && (
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                  {getFileFormat()}
                </span>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={!audioUrl}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={!processedUrl}>
                <Redo2 className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={!audioUrl}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Sıfırla
              </Button>
            </div>
          </header>

          <main className="flex flex-1 overflow-hidden p-4">
            {!audioUrl ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-neutral-800 bg-neutral-900/50 p-8">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800">
                      <Upload className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h2 className="text-xl font-bold">Upload Audio File</h2>
                    <p className="text-sm text-neutral-400">
                      Supports WAV, MP3, OGG, FLAC formats
                    </p>
                  </div>
                  <AudioUploader onUpload={handleUpload} />
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full gap-4">
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col min-h-[300px] rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-mono text-sm text-neutral-400">WAVEFORM</h3>
                      {previewData && (
                        <span className="rounded bg-green-900/30 px-2 py-0.5 text-xs text-green-400">
                          {formatTime(previewData.keptEnd - previewData.keptStart)} / {formatTime(previewData.duration)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1">
                      <Waveform
                        audioUrl={audioUrl}
                        regions={previewData?.regions || []}
                        showRegions={!!previewData}
                        height={140}
                      />
                    </div>
                    <div className="mt-2">
                      <VolumeMeter audioUrl={audioUrl} />
                    </div>
                  </div>

                  <div className="flex flex-col min-h-[300px] rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-mono text-sm text-neutral-400">OUTPUT</h3>
                    </div>
                    <div className="flex flex-1">
                      {processedUrl ? (
                        <div className="flex h-full w-full flex-col gap-4">
                          <div className="flex flex-1">
                            <Waveform audioUrl={processedUrl} color="#10B981" height={140} />
                          </div>
                          <Button asChild className="w-full">
                            <a href={`http://localhost:8000/api/download/${fileId}`}>
                              <Download className="h-4 w-4 mr-2" />
                              Download MP3
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-500">
                          <span className="font-mono text-sm">
                            Will appear after processing
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-80 flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                  <div className="mb-4">
                    <h3 className="font-mono text-sm text-neutral-400">ANALYZER</h3>
                  </div>
                  <SilenceAnalyzer audioUrl={audioUrl} />
                  
                  <div className="mb-4 mt-4">
                    <h3 className="font-mono text-sm text-neutral-400">EFFECTS</h3>
                  </div>
                  <EffectsPanel
                    onApply={handleApplyEffects}
                    onPreview={handlePreview}
                    isProcessing={isProcessing}
                  />
                  {isProcessing && (
                    <div className="mt-4">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full bg-neutral-600 transition-all"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
<p className="mt-2 text-center text-xs text-neutral-500">
                          Processing audio...
                        </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}