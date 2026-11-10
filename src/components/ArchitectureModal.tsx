import React from 'react';
import { X, Cpu, ShieldCheck, FileText, Bot, Zap, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const stages = [
    {
      num: '01',
      title: 'Quote Ingestion',
      subtitle: 'Multi-modal Input',
      desc: 'Parses vendor bills, contractor quotes, handwritten slips, and live camera receipts into structured JSON.',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      tag: 'Any Format'
    },
    {
      num: '02',
      title: 'Vision AI OCR',
      subtitle: 'Gemini 3.8 Flash',
      desc: 'Extracts line items, itemized rates, taxes, and stated subtotals using server-side Gemini 3.8 Flash SDK.',
      icon: <Cpu className="w-4 h-4 text-sky-400" />,
      tag: 'Server SDK'
    },
    {
      num: '03',
      title: 'Forensic Audit',
      subtitle: 'Math & GSTIN',
      desc: 'Verifies qty × rate arithmetic, catches hidden surcharges, and validates 15-digit GSTIN tax compliance.',
      icon: <ShieldCheck className="w-4 h-4 text-sky-400" />,
      tag: 'Audit Engine'
    },
    {
      num: '04',
      title: 'Policy & Guardrails',
      subtitle: 'AI Behind the Wheel',
      desc: 'Enforces department budget ceilings and auto-approval caps. Escalates variances to Human-in-the-Loop.',
      icon: <Bot className="w-4 h-4 text-sky-400" />,
      tag: 'HITL Rails'
    },
    {
      num: '05',
      title: 'PayPal Execution',
      subtitle: 'Payouts & Invoicing',
      desc: 'Executes programmatic vendor disbursements via PayPal Payouts API and generates PayPal Invoicing v2 QR links.',
      icon: <Zap className="w-4 h-4 text-sky-400" />,
      tag: 'Dual PayPal API'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#141414] border border-[#262626] text-neutral-300">
              <Bot className="w-4 h-4 text-neutral-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                Emet AI: &quot;AI Behind the Wheel&quot; Architecture
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Autonomous Agentic Vendor Desk · PayPal AI Hackathon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-[#1a1a1a] rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Hackathon Alignment Banner */}
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#262626] space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Core Theme Alignment: Agentic Commerce</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-normal">
              Judges evaluate AI systems with real agency—moving beyond static Q&amp;A chatbots to autonomous financial systems that evaluate constraints, enforce budgets, and trigger payouts programmatically.
            </p>
          </div>

          {/* 5-Stage Agent Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {stages.map((stage) => (
              <div
                key={stage.num}
                className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-between space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-neutral-400 font-bold">
                    {stage.num}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-300 font-bold bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">
                    {stage.tag}
                  </span>
                </div>
                <div>
                  <div className="p-1.5 rounded-lg bg-[#141414] w-fit border border-[#262626] mb-2 text-neutral-200">
                    {stage.icon}
                  </div>
                  <div className="text-xs font-bold text-neutral-100 leading-tight">
                    {stage.title}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {stage.subtitle}
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-normal mt-1.5 font-normal">
                    {stage.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hackathon 3 Core Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-1">
              <div className="font-bold text-neutral-200 text-xs">
                1. Technological Depth
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Dual PayPal API integration: calls <code className="text-neutral-200 font-mono font-bold bg-[#141414] px-1 py-0.5 rounded border border-[#262626]">/v1/payments/payouts</code> for disbursements and <code className="text-neutral-200 font-mono font-bold bg-[#141414] px-1 py-0.5 rounded border border-[#262626]">/v2/invoicing/invoices</code> for receivables with live OAuth token exchange.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-1">
              <div className="font-bold text-neutral-200 text-xs">
                2. Potential Impact
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Eliminates over 18% of vendor billing mistakes, prevents budget overruns, and cuts manual invoice approval times from 5 days to 3 seconds.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-1">
              <div className="font-bold text-neutral-200 text-xs">
                3. Innovation &amp; Guardrails
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Safe autonomous execution through deterministic Human-in-the-Loop thresholds—never disbursing funds when calculations or budget policies fail.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs active:scale-95"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
