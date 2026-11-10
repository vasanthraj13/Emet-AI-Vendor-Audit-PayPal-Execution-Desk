import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { InvoiceData } from '../types/invoice';
import { getCurrencySymbol } from '../utils/auditRules';

interface DocumentViewerProps {
  imageUrl?: string;
  invoice: InvoiceData;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  imageUrl,
  invoice,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const sym = getCurrencySymbol(invoice.currency || 'INR');
  const hasMathMismatch = invoice.issues.some((i) => i.type === 'math_error');

  return (
    <div
      className={`flex flex-col bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-sm ${
        isFullscreen ? 'fixed inset-4 z-50 bg-black' : 'h-[590px]'
      }`}
    >
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f] bg-[#0a0a0a] text-xs">
        <div className="flex items-center gap-2.5 text-neutral-200 font-medium">
          <FileText className="w-4 h-4 text-neutral-400" />
          <span className="truncate max-w-[160px] sm:max-w-none text-xs text-neutral-100 font-bold">
            {invoice.sourceDocumentName || invoice.vendor.name || 'Source Bill Document'}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono tabular-nums bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle OCR Highlights */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showOverlays
                ? 'bg-white text-black shadow-xs'
                : 'text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626]'
            }`}
            title="Toggle OCR Visual Markers"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OCR Markers</span>
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#171717] transition active:scale-[0.98] cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#171717] transition active:scale-[0.98] cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#171717] transition active:scale-[0.98] cursor-pointer"
            title="Rotate Clockwise (R)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#171717] transition active:scale-[0.98] cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Document View Canvas */}
      <div className="relative flex-1 overflow-auto bg-[#080808] p-6 flex items-center justify-center select-none">
        <div
          className="relative transition-transform duration-150 ease-out flex items-center justify-center max-w-full"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {imageUrl && !imageError ? (
            <div className="relative flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Audited Receipt Document"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="max-h-[500px] max-w-full rounded-xl border border-[#222] object-contain shadow-2xl bg-black"
              />

              {/* OCR Visual Annotations Badge overlay */}
              {showOverlays && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                  {/* Header OCR detection marker */}
                  <div className="flex justify-between items-start">
                    <div className="bg-[#0a0a0a]/95 text-neutral-100 text-[10px] font-mono px-2.5 py-1 rounded-md border border-[#262626] shadow-md font-semibold">
                      {invoice.vendor.name}
                    </div>
                    {invoice.invoiceNumber && (
                      <div className="bg-white text-black text-[10px] font-mono px-2 py-1 rounded-md shadow-md font-bold">
                        #{invoice.invoiceNumber}
                      </div>
                    )}
                  </div>

                  {/* Stated Total Badge with error warning if math differs */}
                  <div className="flex justify-end items-end">
                    <div
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border shadow-lg ${
                        hasMathMismatch
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      Stated: {sym} {(invoice.originalStatedTotal ?? invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Dark Digital Receipt Simulation */
            <div className="w-[340px] sm:w-[380px] bg-[#0d0d0d] text-neutral-100 p-6 rounded-xl shadow-2xl border border-[#1f1f1f] font-mono text-xs space-y-3 relative select-text">
              {/* Receipt Header */}
              <div className="border-b-2 border-dashed border-[#222] pb-3 text-center space-y-1">
                <div className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  TAX INVOICE · GST COMPLIANT
                </div>
                <div className="text-base font-bold text-white uppercase tracking-tight">
                  {invoice.vendor.name || 'CAFÉ PANAMA'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {invoice.vendor.address || 'Todi Mills, Lower Parel, Mumbai'}
                </div>
                <div className="text-[11px] font-bold text-neutral-300">
                  GSTIN: {invoice.vendor.taxId || '27AABCP1234F1Z0'}
                </div>
                <div className="text-[10px] text-neutral-400 flex justify-between px-2 pt-1">
                  <span>Bill: #{invoice.invoiceNumber}</span>
                  <span>Date: {invoice.invoiceDate}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 py-2 border-b border-dashed border-[#222]">
                <div className="flex justify-between text-[11px] font-bold text-neutral-400 uppercase pb-1">
                  <span>Particulars</span>
                  <span>Amount ({sym})</span>
                </div>
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-neutral-200">
                    <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                    <span className="font-bold text-white shrink-0 font-mono">
                      {sym} {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stated vs Real Math Breakdown */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Stated Subtotal:</span>
                  <span className={`font-semibold font-mono ${hasMathMismatch ? 'text-rose-400 underline' : 'text-neutral-200'}`}>
                    {sym} {(invoice.originalStatedSubtotal ?? invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {hasMathMismatch && (
                  <div className="flex justify-between text-[11px] text-rose-400 font-bold bg-rose-500/10 p-1.5 rounded border border-rose-500/30">
                    <span>Forensic Math Error:</span>
                    <span>-₹{Math.abs((invoice.originalStatedSubtotal ?? invoice.subtotal) - invoice.items.reduce((s, i) => s + i.total, 0)).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-400">
                  <span>GST ({invoice.taxRate}%):</span>
                  <span className="font-mono text-neutral-300">{sym} {invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {(invoice.shippingOrTipAmount || 0) > 0 && (
                  <div className="flex justify-between text-neutral-400">
                    <span>Service Charge:</span>
                    <span className="font-mono text-neutral-300">{sym} {invoice.shippingOrTipAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t-2 border-dashed border-[#222]">
                  <span>BILL TOTAL:</span>
                  <span className={`font-mono ${hasMathMismatch ? 'text-rose-400 font-bold' : 'text-white font-bold'}`}>
                    {sym} {(invoice.originalStatedTotal ?? invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Barcode / Footer */}
              <div className="pt-3 text-center space-y-1.5 border-t border-[#1f1f1f]">
                <div className="text-[10px] text-neutral-400 font-medium">
                  Audited by Emet AI · PayPal Compliance
                </div>
                <div className="h-6 flex items-center justify-center gap-0.5">
                  <div className="w-1 h-full bg-neutral-400" />
                  <div className="w-2 h-full bg-neutral-400" />
                  <div className="w-0.5 h-full bg-neutral-400" />
                  <div className="w-1.5 h-full bg-neutral-400" />
                  <div className="w-2 h-full bg-neutral-400" />
                  <div className="w-0.5 h-full bg-neutral-400" />
                  <div className="w-1.5 h-full bg-neutral-400" />
                  <div className="w-1 h-full bg-neutral-400" />
                  <div className="w-2 h-full bg-neutral-400" />
                  <div className="w-0.5 h-full bg-neutral-400" />
                  <div className="w-1 h-full bg-neutral-400" />
                  <div className="w-2 h-full bg-neutral-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viewer Footer Status */}
      <div className="px-4 py-2.5 border-t border-[#1f1f1f] bg-[#0a0a0a] text-xs text-neutral-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-neutral-300 font-medium">Vision AI Pipeline · Multi-Modal OCR</span>
        </span>
        <button
          onClick={handleResetZoom}
          className="text-neutral-300 hover:text-white transition cursor-pointer font-medium"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
};
