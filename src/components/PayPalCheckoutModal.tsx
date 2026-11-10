import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  X, Check, QrCode, ExternalLink, Copy, 
  Smartphone, ChevronDown, ChevronUp, FileText, CheckCircle2
} from 'lucide-react';
import { PayPalInvoiceResponse, InvoiceData } from '../types/invoice';
import { getCurrencySymbol } from '../utils/auditRules';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  paypalResponse: PayPalInvoiceResponse | null;
  invoice: InvoiceData;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  paypalResponse,
  invoice,
}) => {
  const sym = getCurrencySymbol(invoice.currency || 'INR');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (paypalResponse?.paymentLink) {
      QRCode.toDataURL(paypalResponse.paymentLink, {
        width: 240,
        margin: 2,
        color: {
          dark: '#12140c',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
    setIsPaid(false);
  }, [paypalResponse]);

  if (!isOpen || !paypalResponse) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paypalResponse.paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="border-b border-[#1f1f1f] px-6 py-4 flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-sky-400'} shrink-0`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100">
                  PayPal Official Invoice Dispatched
                </h3>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                  isPaid ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-neutral-300 bg-neutral-800 border-neutral-700'
                }`}>
                  {isPaid ? 'PAID' : 'SENT'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {paypalResponse.invoiceNumber} · {paypalResponse.isSandbox ? 'PayPal Sandbox Mode' : 'PayPal Live'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#171717] rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Payment Status Banner */}
          {isPaid ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs">Payment completed · Reconciled on ledger</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-400">
                TXN-{Date.now().toString().slice(-8)}
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-between text-neutral-400 text-xs">
              <span>
                Delivered to <strong className="text-neutral-200 font-mono">{paypalResponse.recipientEmail}</strong>
              </span>
              <span className="font-mono text-neutral-300 font-medium">Due on Receipt</span>
            </div>
          )}

          {/* QR Code & Direct Link Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#080808] p-5 rounded-xl border border-[#1f1f1f]">
            {/* Left: Dynamic QR Code */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="p-2.5 bg-white rounded-xl shadow-md border border-neutral-700">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="PayPal Checkout QR Code"
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-neutral-500">
                    <QrCode className="w-6 h-6 animate-pulse text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Scan with phone camera to pay</span>
              </div>
            </div>

            {/* Right: Payment Details & Direct Link */}
            <div className="space-y-3.5">
              <div>
                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                  Total Balance Due
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-0.5">
                  {sym} {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Invoice ID: {paypalResponse.invoiceId}
                </div>
              </div>

              {/* Copy Direct Link */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-semibold block">
                  Hosted Checkout Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={paypalResponse.paymentLink}
                    className="flex-1 bg-[#121212] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-500 select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-200 rounded-lg text-xs font-medium border border-[#262626] transition active:scale-[0.98] cursor-pointer shrink-0"
                    title="Copy payment URL"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 space-y-2">
                {!isPaid && (
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition active:scale-[0.98] cursor-pointer shadow-xs"
                  >
                    Simulate Payer Instant Payment
                  </button>
                )}

                <a
                  href={paypalResponse.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] text-neutral-200 font-medium text-xs border border-[#262626] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Open PayPal Sandbox View</span>
                </a>
              </div>
            </div>
          </div>

          {/* Line Items Breakdown */}
          <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#0a0a0a]">
            <div className="px-4 py-2.5 bg-[#080808] border-b border-[#1f1f1f] text-xs font-bold text-neutral-200 flex items-center justify-between">
              <span>Itemized Breakdown ({invoice.items.length})</span>
              <span className="font-mono text-white font-bold tabular-nums">
                {sym} {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 divide-y divide-[#181818] max-h-40 overflow-y-auto">
              {invoice.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex justify-between text-xs">
                  <span className="text-neutral-200 font-medium">
                    {it.quantity}× {it.name}
                  </span>
                  <span className="font-mono text-neutral-300 font-bold tabular-nums">
                    {sym} {it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible PayPal v2 Payload JSON */}
          <div className="border border-[#1f1f1f] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowJson(!showJson)}
              className="w-full px-4 py-2.5 bg-[#0a0a0a] flex items-center justify-between text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>PayPal Invoicing v2 Response Payload</span>
              </div>
              {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showJson && (
              <div className="p-3.5 bg-[#080808] text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48 border-t border-[#1f1f1f]">
                <pre>{JSON.stringify(paypalResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0a0a0a] px-6 py-3.5 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Invoicing API v2 Endpoint</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
