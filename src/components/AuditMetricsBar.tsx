import React from 'react';
import { Wand2, Check, ShieldCheck } from 'lucide-react';
import { InvoiceData } from '../types/invoice';
import { getCurrencySymbol } from '../utils/auditRules';

interface AuditMetricsBarProps {
  invoice: InvoiceData;
  onAutoFixAll: () => void;
}

export const AuditMetricsBar: React.FC<AuditMetricsBarProps> = ({
  invoice,
  onAutoFixAll,
}) => {
  const issues = invoice.issues || [];
  const highSeverityCount = issues.filter((i) => i.severity === 'high').length;
  const mediumSeverityCount = issues.filter((i) => i.severity === 'medium').length;
  const sym = getCurrencySymbol(invoice.currency || 'INR');

  const stated = invoice.originalStatedTotal ?? invoice.grandTotal;
  const actual = invoice.grandTotal;
  const variance = Math.abs(stated - actual);

  const getStatusDot = (score: number) => {
    if (score >= 90 && issues.length === 0) return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
    if (score >= 70) return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
    return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
  };

  const getStatusText = (score: number) => {
    if (score >= 90 && issues.length === 0) return 'Verified Ledger';
    if (score >= 70) return 'Warnings Present';
    return 'Discrepancies Flagged';
  };

  return (
    <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-4 sm:px-5 sm:py-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Metric Group */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-5 sm:gap-8 divide-x-0 sm:divide-x divide-[#1f1f1f]">
          {/* Status & Integrity Score */}
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${getStatusDot(invoice.auditScore)} shrink-0`} />
            <div>
              <div className="text-[11px] text-neutral-400">
                Audit Status
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-100 font-mono mt-0.5 flex items-center gap-1.5">
                <span>{getStatusText(invoice.auditScore)}</span>
                <span className="text-neutral-400 font-normal text-xs">({invoice.auditScore}%)</span>
              </div>
            </div>
          </div>

          {/* Anomalies Detected */}
          <div className="sm:pl-8 flex items-center gap-2.5">
            <div>
              <div className="text-[11px] text-neutral-400">
                Anomalies
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-100 font-mono mt-0.5">
                {issues.length === 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>0 issues</span>
                  </span>
                ) : (
                  <span>
                    <strong className="text-rose-400 font-bold">{highSeverityCount}</strong> critical
                    {mediumSeverityCount > 0 && (
                      <span className="text-neutral-400 font-normal text-xs">, {mediumSeverityCount} warn</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stated Variance */}
          <div className="sm:pl-8 flex items-center gap-2.5">
            <div>
              <div className="text-[11px] text-neutral-400">
                Variance
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-100 font-mono mt-0.5">
                {variance > 0.01 ? (
                  <span className="text-rose-400 font-bold">
                    Gap ({sym}{variance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                ) : (
                  <span className="text-neutral-300 font-normal">Balanced ({sym}0.00)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Solid White Button with Black text from screenshot */}
        <div className="flex items-center justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1f1f1f]">
          {issues.length > 0 ? (
            <button
              onClick={onAutoFixAll}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition active:scale-[0.98] cursor-pointer shadow-xs"
              title="Automatically reconcile math errors, deduplicate, and balance totals (A)"
            >
              <Wand2 className="w-3.5 h-3.5 text-black" />
              <span>Auto-Fix All ({issues.length})</span>
              <kbd className="font-mono text-[10px] text-neutral-700 bg-neutral-200 px-1.5 py-0.5 rounded ml-1 font-bold">
                A
              </kbd>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Audit Passed · Ready to Disburse</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
