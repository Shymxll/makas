"use client";

import { useState } from "react";

export interface EffectSettings {
  silenceThreshold: number;
  silenceMinLen: number;
  silencePadding: number;
  reduceNoise: boolean;
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
    reduceNoise: false,
  });

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Ses İşleme Ayarları</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sessizlik Eşiği (dB): {settings.silenceThreshold}
        </label>
        <input
          type="range"
          min="-60"
          max="-20"
          value={settings.silenceThreshold}
          onChange={(e) => setSettings({ ...settings, silenceThreshold: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Minimum Sessizlik Süresi (ms): {settings.silenceMinLen}
        </label>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={settings.silenceMinLen}
          onChange={(e) => setSettings({ ...settings, silenceMinLen: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Padding (ms): {settings.silencePadding}
        </label>
        <input
          type="range"
          min="0"
          max="500"
          step="50"
          value={settings.silencePadding}
          onChange={(e) => setSettings({ ...settings, silencePadding: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="noise"
          checked={settings.reduceNoise}
          onChange={(e) => setSettings({ ...settings, reduceNoise: e.target.checked })}
        />
        <label htmlFor="noise" className="text-sm font-medium text-gray-700">
          Gürültü Azaltma
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPreview(settings)}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Önizle
        </button>
        <button
          onClick={() => onApply(settings)}
          disabled={isProcessing}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
        >
          {isProcessing ? "İşleniyor..." : "İşleme Uygula"}
        </button>
      </div>
    </div>
  );
}