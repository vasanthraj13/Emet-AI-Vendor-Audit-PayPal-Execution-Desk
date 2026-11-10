import React from 'react';
import { Layers, Search, ChevronRight, Bot, Sliders } from 'lucide-react';
import { PayPalCredentials, BudgetPolicy } from '../types/invoice';

interface HeaderProps {
  credentials: PayPalCredentials;
  invoiceNumber: string;
  policy: BudgetPolicy;
  onOpenConfig: () => void;
  onOpenArchitecture: () => void;
  onOpenPolicyDrawer: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  credentials,
  invoiceNumber,
  policy,
  onOpenConfig,
  onOpenArchitecture,
  onOpenPolicyDrawer,
  onOpenCommandPalette,
}) => {
  const isLive = credentials.mode === 'live';

  return (
    <header className="border-b border-[#1f1f1f] bg-black/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between transition-all">
      {/* Left: Brand & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Minimalist Agent Mark - Emerald Robot Icon */}
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none">
          <Bot className="w-4 h-4" />
        </div>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <span className="font-bold text-white tracking-tight text-xs sm:text-sm">
            Emet AI
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-400 hover:text-neutral-200 transition-colors hidden sm:inline font-medium">
            Autonomous Desk
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600 hidden sm:inline" />
          <span className="font-mono text-neutral-300 font-medium bg-[#141414] px-2 py-0.5 rounded border border-[#262626] text-[11px] truncate max-w-[130px] sm:max-w-none">
            {invoiceNumber || 'NEW_ENTRY'}
          </span>
        </nav>
      </div>

      {/* Center: Search / Command Palette affordance */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-[#181818] text-neutral-400 hover:text-neutral-200 text-xs border border-[#242424] hover:border-neutral-700 transition-all active:scale-[0.98] w-72 justify-between cursor-pointer group"
        >
          <span className="flex items-center gap-2 text-neutral-400 group-hover:text-neutral-300 transition-colors">
            <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
            <span className="text-xs">Search policies &amp; quotes...</span>
          </span>
          <kbd className="font-mono text-[10px] text-neutral-500 bg-[#1c1c1c] px-1.5 py-0.5 rounded border border-[#2c2c2c]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Engine & Integration Actions */}
      <div className="flex items-center gap-2.5">
        {/* Guardrails / Policy Button */}
        <button
          onClick={onOpenPolicyDrawer}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] text-neutral-300 text-xs font-medium border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] cursor-pointer"
          title="Configure Department Budget Limits & Guardrails (⌘P)"
        >
          <Sliders className="w-3.5 h-3.5 text-neutral-400" />
          <span>Guardrails</span>
          <kbd className="hidden lg:inline font-mono text-[9px] text-neutral-500 bg-[#1c1c1c] px-1.5 py-0.5 rounded border border-[#2c2c2c]">
            ⌘P
          </kbd>
        </button>

        {/* Architecture flow toggle */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] text-neutral-300 text-xs font-medium border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] cursor-pointer"
          title="Inspect 'AI Behind the Wheel' Architecture Blueprint"
        >
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Agentic Flow</span>
        </button>

        {/* PayPal Sandbox Pill Indicator with Dot */}
        <button
          onClick={onOpenConfig}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] text-neutral-300 text-xs font-medium border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] cursor-pointer"
          title="Configure PayPal Credentials & Environment (⌘,)"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLive ? 'bg-emerald-400' : 'bg-sky-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLive ? 'bg-emerald-500' : 'bg-sky-400'
              }`}
            />
          </span>
          <span className="font-mono text-xs tracking-tight text-neutral-200">
            {isLive ? 'PayPal Live' : 'PayPal Sandbox'}
          </span>
          <kbd className="hidden sm:inline font-mono text-[10px] text-neutral-500 bg-[#1c1c1c] px-1 rounded border border-[#2c2c2c]">
            ⌘,
          </kbd>
        </button>
      </div>
    </header>
  );
};
