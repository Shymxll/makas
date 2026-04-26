"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EffectSettings {
  silenceThreshold: number;
  silenceMinLen: number;
  silencePadding: number;
  bitrate: number;
}

interface EffectsPanelProps {
  onApply: (settings: EffectSettings) => void;
  onPreview: (settings: EffectSettings) => void;
  isProcessing: boolean;
}

export default function EffectsPanel({ onApply, onPreview, isProcessing }: EffectsPanelProps) {
  const [settings, setSettings] = useState<EffectSettings>({
    silenceThreshold: -40,
    silenceMinLen: 500,
    silencePadding: 100,
    bitrate: 192,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Silence Threshold</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {settings.silenceThreshold} dB
            </span>
          </div>
          <Slider
            value={[settings.silenceThreshold]}
            onValueChange={([v]) => setSettings({ ...settings, silenceThreshold: v })}
            min={-60}
            max={-20}
            step={1}
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            Lower = more sensitive (removes more)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Min Silence Duration</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {settings.silenceMinLen} ms
            </span>
          </div>
          <Slider
            value={[settings.silenceMinLen]}
            onValueChange={([v]) => setSettings({ ...settings, silenceMinLen: v })}
            min={100}
            max={2000}
            step={100}
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            Shorter silences are ignored
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Padding</Label>
            <span className="text-sm font-medium text-muted-foreground">
              {settings.silencePadding} ms
            </span>
          </div>
          <Slider
            value={[settings.silencePadding]}
            onValueChange={([v]) => setSettings({ ...settings, silencePadding: v })}
            min={0}
            max={500}
            step={50}
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            Gap added before/after audio segments
          </p>
        </div>

        <div className="space-y-2">
          <Label>Bitrate</Label>
          <Select
            value={settings.bitrate.toString()}
            onValueChange={(v) => setSettings({ ...settings, bitrate: Number(v) })}
            disabled={isProcessing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="128">128 kbps (Smallest file)</SelectItem>
              <SelectItem value="192">192 kbps (Standard)</SelectItem>
              <SelectItem value="256">256 kbps (High)</SelectItem>
              <SelectItem value="320">320 kbps (Best quality)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Higher = better quality, larger file
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onPreview(settings)}
          disabled={isProcessing}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          className="flex-1"
          onClick={() => onApply(settings)}
          disabled={isProcessing}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
}