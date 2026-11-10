import React from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Copy, Check, ShieldCheck } from 'lucide-react';
import { PayPalPayoutResponse } from '../types/invoice';
import { getCurrencySymbol } from '../utils/auditRules';

interface PayPalPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutResponse: PayPalPayoutResponse | null;
}

export const PayPalPayoutModal: React.FC<PayPalPayoutModalProps> = ({
  isOpen,
  onClose,
  payoutResponse,
}) => {
  const [copiedTxn, setCopiedTxn] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && payoutResponse) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.55 },
      });
    }
  }, [isOpen, payoutResponse]);

  if (!isOpen || !payoutResponse) return null;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(payoutResponse.transactionId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                PayPal Programmatic Payout Executed
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                API Endpoint: /v1/payments/payouts
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#171717] rounded-lg transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Main Success Callout */}
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-emerald-400">
              Vendor Payout Disbursed
            </div>
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {getCurrencySymbol(payoutResponse.amount.currency)} {parseFloat(payoutResponse.amount.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Sent to: <span className="text-neutral-200 font-bold">{payoutResponse.recipientEmail}</span>
            </div>
          </div>

          {/* Ledger Details Table */}
          <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#0a0a0a] divide-y divide-[#181818] font-mono text-xs">
            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Transaction ID:</span>
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <span>{payoutResponse.transactionId}</span>
                <button
                  onClick={handleCopyTxn}
                  className="text-neutral-400 hover:text-white transition"
                  title="Copy Transaction ID"
                >
                  {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Sender Batch ID:</span>
              <span className="text-neutral-200 font-bold">{payoutResponse.senderBatchId}</span>
            </div>

            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Payout Status:</span>
              <span className="text-emerald-400 font-bold">{payoutResponse.payoutStatus}</span>
            </div>

            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Execution Mode:</span>
              <span className="text-neutral-200 font-semibold">{payoutResponse.isSandbox ? 'PayPal Sandbox' : 'PayPal Live'}</span>
            </div>

            <div className="p-3 flex justify-between">
              <span className="text-neutral-400">Executed At:</span>
              <span className="text-neutral-200 font-semibold">{new Date(payoutResponse.executedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#080808] border border-[#1f1f1f] text-xs text-neutral-400 leading-relaxed">
            <span className="font-bold text-neutral-200">Agentic Commerce Note: </span>
            Emet AI evaluated vendor invoice against departmental budget policies, resolved line-item arithmetic discrepancies, and executed programmatic disbursement with zero manual human bottleneck.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Logged to PayPal Ledger</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
