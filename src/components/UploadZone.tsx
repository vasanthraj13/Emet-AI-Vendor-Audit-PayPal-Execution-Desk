import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, FileText, X, Loader2, CloudUpload } from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../utils/sampleData';

interface UploadZoneProps {
  onSelectPreset: (preset: SamplePreset) => void;
  onFileUpload: (file: File) => void;
  onCameraCapture: (imageDataBase64: string) => void;
  isProcessing: boolean;
  selectedPresetId?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onSelectPreset,
  onFileUpload,
  onCameraCapture,
  isProcessing,
  selectedPresetId,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          onFileUpload(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  // Camera functionality
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access denied:', err);
      setCameraError('Unable to access camera. Check device permissions or upload a file instead.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      onCameraCapture(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Test Sample Presets Strip */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider text-[11px]">
              SAMPLE DATASETS
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 hidden sm:inline font-normal">
              Pre-configured test fixtures
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Keys 1-3
          </span>
        </div>

        {/* 3 Preset Fixture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PRESETS.map((preset, idx) => {
            const isSelected = selectedPresetId === preset.id;
            const isCritical = preset.badge.includes('Critical');
            const isDuplicate = preset.badge.includes('Duplicate');

            const dotColor = isCritical
              ? 'bg-rose-500'
              : isDuplicate
              ? 'bg-amber-500'
              : 'bg-emerald-500';

            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                disabled={isProcessing}
                className={`group relative p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                  isSelected
                    ? 'bg-[#141414] border-neutral-600 ring-1 ring-neutral-500'
                    : 'bg-[#0d0d0d] border-[#1f1f1f] hover:border-neutral-700 hover:bg-[#121212]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                    <span className="text-[11px] text-neutral-400 truncate font-medium">
                      {preset.category}
                    </span>
                  </div>
                  <kbd className="font-mono text-[9px] text-neutral-500 bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">
                    {idx + 1}
                  </kbd>
                </div>

                <div className="text-xs font-bold text-neutral-100 truncate">
                  {preset.title}
                </div>

                <div className="text-[11px] text-neutral-400 truncate mt-1">
                  {preset.anomalySummary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload & Drag Drop Ingestion Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-[#1f1f1f] rounded-xl p-4 sm:p-5 text-center transition-all duration-150 bg-[#0d0d0d] hover:border-neutral-700`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2.5">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <div className="text-sm font-bold text-neutral-100">
              Auditing with Vision AI...
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Extracting line items · verifying statutory GSTIN · forensic arithmetic check
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-neutral-400 shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-neutral-200">
                  Drop receipt or invoice image here
                </div>
                <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <span>PNG, JPG, PDF</span>
                  <span>·</span>
                  <span>Paste clipboard (⌘V)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-[#141414] hover:bg-[#1c1c1c] text-neutral-200 text-xs font-medium rounded-lg border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Browse</span>
                <kbd className="hidden sm:inline font-mono text-[9px] text-neutral-500 bg-[#1f1f1f] px-1 py-0.5 rounded border border-[#2d2d2d]">
                  O
                </kbd>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-[#141414] hover:bg-[#1c1c1c] text-neutral-200 text-xs font-medium rounded-lg border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-neutral-400" />
                <span>Capture</span>
                <kbd className="hidden sm:inline font-mono text-[9px] text-neutral-500 bg-[#1f1f1f] px-1 py-0.5 rounded border border-[#2d2d2d]">
                  C
                </kbd>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Camera Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 max-w-md w-full shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-50">Capture Physical Receipt</h3>
              </div>
              <button
                onClick={stopCamera}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                {cameraError}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-4 border border-dashed border-sky-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                      Align document within frame
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-sky-500/20"
                  >
                    Capture &amp; Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
