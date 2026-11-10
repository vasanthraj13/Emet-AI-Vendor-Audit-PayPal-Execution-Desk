import React, { useState } from 'react';
import { X, Sliders, ShieldCheck } from 'lucide-react';
import { BudgetPolicy } from '../types/invoice';

interface BudgetPolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  policy: BudgetPolicy;
  onSavePolicy: (policy: BudgetPolicy) => void;
}

export const BudgetPolicyDrawer: React.FC<BudgetPolicyDrawerProps> = ({
  isOpen,
  onClose,
  policy,
  onSavePolicy,
}) => {
  const [formData, setFormData] = useState<BudgetPolicy>(policy);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePolicy(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#141414] border border-[#262626] text-neutral-300">
              <Sliders className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                Corporate Budget &amp; Guardrails (India)
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Deterministic Agentic Payout Thresholds
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#171717] rounded-lg transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              Department Ledger / Entity
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-neutral-200 font-medium focus:border-neutral-500 focus:outline-none transition cursor-pointer"
            >
              <option value="Engineering & Cloud Operations (Bengaluru HQ)" className="bg-[#171717] text-neutral-100">Engineering &amp; Cloud Operations (Bengaluru HQ)</option>
              <option value="IT Infrastructure & Hardware (Whitefield)" className="bg-[#171717] text-neutral-100">IT Infrastructure &amp; Hardware (Whitefield)</option>
              <option value="Enterprise Consulting & Finance (Mumbai BKC)" className="bg-[#171717] text-neutral-100">Enterprise Consulting &amp; Finance (Mumbai BKC)</option>
              <option value="Procurement & Facilities (Gurugram / NCR)" className="bg-[#171717] text-neutral-100">Procurement &amp; Facilities (Gurugram / NCR)</option>
            </select>
          </div>

          {/* Monthly Budget Cap */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              Monthly Department Spend Ceiling (INR)
            </label>
            <div className="flex items-center gap-2 bg-[#121212] border border-[#262626] rounded-xl px-3 py-2">
              <span className="text-neutral-400 font-mono font-bold text-sm">₹</span>
              <input
                type="number"
                value={formData.monthlyLimit}
                onChange={(e) => setFormData({ ...formData, monthlyLimit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent text-neutral-100 font-mono font-bold text-xs focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Current MTD Spend: ₹{formData.spentThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Autonomous Approval Limit */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              Autonomous Approval Ceiling (Max ₹ without Manual Review)
            </label>
            <div className="flex items-center gap-2 bg-[#121212] border border-[#262626] rounded-xl px-3 py-2">
              <span className="text-neutral-400 font-mono font-bold text-sm">₹</span>
              <input
                type="number"
                value={formData.maxAutoApproveLimit}
                onChange={(e) => setFormData({ ...formData, maxAutoApproveLimit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-transparent text-neutral-100 font-mono font-bold text-xs focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Vendor bills under ₹{formData.maxAutoApproveLimit.toLocaleString('en-IN')} with 0 arithmetic errors trigger autonomous PayPal Payouts.
            </p>
          </div>

          {/* Human in the loop toggle */}
          <div className="pt-3 border-t border-[#1f1f1f] space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.requireHumanInTheLoop}
                onChange={(e) => setFormData({ ...formData, requireHumanInTheLoop: e.target.checked })}
                className="rounded border-[#333] bg-[#1a1a1a] text-white focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-neutral-200 font-medium">
                Enforce strict Human-in-the-Loop review for all disbursements
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.flagNewVendors}
                onChange={(e) => setFormData({ ...formData, flagNewVendors: e.target.checked })}
                className="rounded border-[#333] bg-[#1a1a1a] text-white focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-neutral-200 font-medium">
                Flag unverified suppliers without registered GSTIN
              </span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between">
          <button
            onClick={() => setFormData(policy)}
            className="text-xs text-neutral-400 hover:text-white font-mono font-medium transition cursor-pointer"
          >
            Reset Default
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition active:scale-[0.98] cursor-pointer shadow-xs"
            >
              Apply Guardrails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
