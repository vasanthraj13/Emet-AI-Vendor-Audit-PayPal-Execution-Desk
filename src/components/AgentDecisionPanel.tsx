import React, { useState } from 'react';
import { 
  Bot, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, 
  Clock, Sparkles, ChevronDown, ChevronUp, Zap, Terminal, Sliders
} from 'lucide-react';
import { AgentDecision, BudgetPolicy, InvoiceData } from '../types/invoice';

interface AgentDecisionPanelProps {
  decision?: AgentDecision;
  policy: BudgetPolicy;
  invoice: InvoiceData;
  onOpenPolicyDrawer: () => void;
  onExecutePayout: () => void;
  onAutoFixAndApprove: () => void;
  isExecutingPayout: boolean;
}

export const AgentDecisionPanel: React.FC<AgentDecisionPanelProps> = ({
  decision,
  policy,
  invoice,
  onOpenPolicyDrawer,
  onExecutePayout,
  onAutoFixAndApprove,
  isExecutingPayout,
}) => {
  const [showLogs, setShowLogs] = useState<boolean>(true);

  if (!decision) return null;

  const isAutoApproved = decision.status === 'AUTO_APPROVED';
  const needsHITL = decision.status === 'NEEDS_HITL';
  const isRejected = decision.status === 'REJECTED';

  // Dynamic styling based on agent state in Dark Fintech palette
  const getDecisionContainerStyle = () => {
    if (isAutoApproved) {
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm';
    }
    if (needsHITL) {
      return 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm';
    }
    return 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-sm';
  };

  const getStatusBadge = () => {
    if (isAutoApproved) {
      return {
        label: 'Autonomous Clearance Granted',
        dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
        textColor: 'text-emerald-400',
      };
    }
    if (needsHITL) {
      return {
        label: 'Human-in-the-Loop Guardrail Active',
        dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
        textColor: 'text-amber-400',
      };
    }
    return {
      label: 'Policy Violation / Halt',
      dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
      textColor: 'text-rose-400',
    };
  };

  const statusBadge = getStatusBadge();

  // Helper for log stage colors in Fintech Dark Terminal
  const getStageTag = (stage: string) => {
    const s = stage.toUpperCase();
    if (s.includes('PERCEPTION') || s.includes('VISION')) {
      return { text: 'text-sky-400', dot: 'bg-sky-400 shadow-[0_0_6px_#38bdf8]', border: 'border-sky-500/30' };
    }
    if (s.includes('AUDIT') || s.includes('ARITHMETIC') || s.includes('GUARDRAIL')) {
      return { text: 'text-amber-400', dot: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]', border: 'border-amber-500/30' };
    }
    if (s.includes('PAYPAL') || s.includes('PAYOUT') || s.includes('SETTLEMENT')) {
      return { text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]', border: 'border-emerald-500/30' };
    }
    return { text: 'text-slate-300', dot: 'bg-slate-400', border: 'border-slate-700' };
  };

  return (
    <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header: Agent Mode & Department Policy Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#141414] border border-[#262626] text-neutral-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-neutral-100">
                Emet Decision Matrix
              </span>
              <span className="text-[10px] text-neutral-400">
                Agentic Commerce
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Autonomous quote audit &amp; programmatic payout evaluation
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPolicyDrawer}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1c1c1c] px-3 py-1.5 rounded-lg border border-[#262626] transition cursor-pointer"
          >
            <span>Policy: {policy.department}</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300 font-mono">₹{policy.maxAutoApproveLimit.toLocaleString('en-IN')} Cap</span>
          </button>
        </div>
      </div>

      {/* Decision Summary Card */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isAutoApproved
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
          : needsHITL
          ? 'bg-[#151108] border-[#3f2c0d] text-amber-400'
          : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
      }`}>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${
              isAutoApproved ? 'bg-emerald-400' : needsHITL ? 'bg-amber-400' : 'bg-rose-400'
            }`} />
            <h4 className="text-xs sm:text-sm font-bold">
              {statusBadge.label}
            </h4>
            <span className="text-[11px] text-neutral-400 font-normal">
              Risk Index: {decision.riskScore}%
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl font-normal">
            {decision.reasoningSummary}
          </p>
        </div>

        {/* Action Button: White button with black text from screenshot */}
        <div className="shrink-0 flex items-center gap-2.5">
          {needsHITL && invoice.issues.length > 0 && (
            <button
              onClick={onAutoFixAndApprove}
              className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-lg transition active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Reconcile &amp; Approve</span>
            </button>
          )}

          {isAutoApproved && (
            <button
              onClick={onExecutePayout}
              disabled={isExecutingPayout}
              className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-lg transition active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-black" />
              <span>{isExecutingPayout ? 'Dispatching...' : 'Execute PayPal Payout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Policy Verification Micro-Checks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {decision.policyChecks.map((check) => (
          <div
            key={check.id}
            className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-xs flex items-start gap-2.5"
          >
            <span
              className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                check.passed ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold text-neutral-200 text-xs truncate">
                {check.name}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono leading-tight">
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Trace & Logs Section */}
      <div className="border border-[#1a1a1a] rounded-xl overflow-hidden bg-[#080808]">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-medium text-neutral-200">
              Autonomous Execution Trace ({decision.logs.length} stages)
            </span>
          </div>

          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
          >
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Terminal Trace Body */}
        {showLogs && (
          <div className="p-4 space-y-2.5 font-mono text-xs bg-[#080808]">
            {decision.logs.map((log) => {
              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 py-1 border-b border-[#141414] last:border-0"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        [{log.stage}]
                      </span>
                      <span className="text-neutral-200 text-xs font-semibold">
                        {log.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                      {log.detail}
                    </p>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-mono shrink-0 pl-4 sm:pl-0 sm:text-right">
                    {log.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
