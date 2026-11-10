import React from 'react';
import { Wand2, Check, ShieldCheck } from 'lucide-react';
import { AuditIssue } from '../types/invoice';

interface AuditAlertsProps {
  issues: AuditIssue[];
  onApplyFix: (issue: AuditIssue) => void;
  currency: string;
}

export const AuditAlerts: React.FC<AuditAlertsProps> = ({
  issues,
  onApplyFix,
}) => {
  if (issues.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#0d0d0d] border border-[#1f1f1f] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-neutral-200 text-xs">
              Audit Clearance: 100% Verified
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Line items arithmetic verified · Statutory GSTIN compliant · PayPal Invoicing ready
            </div>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          PASSED
        </span>
      </div>
    );
  }

  const getSeverityDot = (severity: AuditIssue['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-neutral-400';
    }
  };

  const getSeverityBadge = (severity: AuditIssue['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-neutral-300 bg-neutral-800 border-neutral-700';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-200 tracking-tight">
            Audit Findings
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-xs font-mono text-neutral-400 font-medium">
            {issues.length} {issues.length === 1 ? 'discrepancy' : 'discrepancies'} flagged
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-3.5 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] hover:bg-[#121212] hover:border-neutral-700 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${getSeverityDot(issue.severity)} shrink-0`} />
                  <span className="text-xs font-bold text-neutral-200 truncate">
                    {issue.title}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${getSeverityBadge(issue.severity)}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed pl-4.5 font-normal">
                  {issue.description}
                </p>
              </div>

              {/* 1-Click Fix Button */}
              {issue.suggestedFix && (
                <button
                  onClick={() => onApplyFix(issue)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1c1c1c] text-neutral-200 rounded-lg text-xs font-medium border border-[#262626] hover:border-neutral-700 transition-all active:scale-[0.98] cursor-pointer"
                  title={issue.suggestedFix.buttonLabel}
                >
                  <Wand2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs">{issue.suggestedFix.buttonLabel}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
