#app

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { AuditMetricsBar } from './components/AuditMetricsBar';
import { AgentDecisionPanel } from './components/AgentDecisionPanel';
import { BudgetPolicyDrawer } from './components/BudgetPolicyDrawer';
import { DocumentViewer } from './components/DocumentViewer';
import { AuditAlerts } from './components/AuditAlerts';
import { InvoiceEditor } from './components/InvoiceEditor';
import { PayPalCheckoutModal } from './components/PayPalCheckoutModal';
import { PayPalPayoutModal } from './components/PayPalPayoutModal';
import { PayPalConfigModal } from './components/PayPalConfigModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SAMPLE_PRESETS, SamplePreset } from './utils/sampleData';
import { runAuditChecks, autoFixAllDiscrepancies, DEFAULT_BUDGET_POLICY } from './utils/auditRules';
import { buildPayPalInvoiceV2Payload } from './utils/paypalApi';
import { 
  InvoiceData, AuditIssue, PayPalInvoiceResponse, PayPalCredentials, 
  BudgetPolicy, PayPalPayoutResponse 
} from './types/invoice';
import { X, FileJson, Check, Copy, Search, Wand2, Zap, Bot } from 'lucide-react';

export default function App() {
  const [policy, setPolicy] = useState<BudgetPolicy>(DEFAULT_BUDGET_POLICY);

  // Initialize with the first sample preset (Café Panama with math error)
  const initialPreset = SAMPLE_PRESETS[0];
  const initialAudited = {
    ...initialPreset.data,
    sourceImageUrl: initialPreset.imageUrl,
    sourceDocumentName: initialPreset.title,
  };
  const auditResult = runAuditChecks(initialAudited, policy);
  initialAudited.issues = auditResult.issues;
  initialAudited.auditScore = auditResult.auditScore;
  initialAudited.agentDecision = auditResult.agentDecision;

  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData>(initialAudited);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSendingPayPal, setIsSendingPayPal] = useState<boolean>(false);
  const [isExecutingPayout, setIsExecutingPayout] = useState<boolean>(false);
  
  // Modals state
  const [paypalResponse, setPaypalResponse] = useState<PayPalInvoiceResponse | null>(null);
  const [payoutResponse, setPayoutResponse] = useState<PayPalPayoutResponse | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isPolicyDrawerOpen, setIsPolicyDrawerOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // PayPal credentials
  const [credentials, setCredentials] = useState<PayPalCredentials>({
    clientId: '',
    clientSecret: '',
    mode: 'demo',
    merchantEmail: 'merchant@example.com',
  });

  // Handle preset selection
  const handleSelectPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    const audited = {
      ...preset.data,
      sourceImageUrl: preset.imageUrl,
      sourceDocumentName: preset.title,
    };
    const { issues, auditScore, agentDecision } = runAuditChecks(audited, policy);
    audited.issues = issues;
    audited.auditScore = auditScore;
    audited.agentDecision = agentDecision;
    setCurrentInvoice(audited);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // ⌘K / Ctrl+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // ⌘P / Ctrl+P: Policy Drawer
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPolicyDrawerOpen(true);
        return;
      }

      // ⌘, : Open Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsConfigModalOpen(true);
        return;
      }

      // Escape: Close all modals
      if (e.key === 'Escape') {
        setIsCheckoutModalOpen(false);
        setIsPayoutModalOpen(false);
        setIsConfigModalOpen(false);
        setIsPolicyDrawerOpen(false);
        setIsArchitectureModalOpen(false);
        setIsJsonModalOpen(false);
        setIsCommandPaletteOpen(false);
        return;
      }

      if (isInput) return;

      // Shift + Enter: Issue PayPal Invoice
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleSendPayPalInvoice();
        return;
      }

      // 'a' or 'A': Auto-Fix All
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAutoFixAll();
        return;
      }

      // '1', '2', '3': Select Presets
      if (e.key === '1' && SAMPLE_PRESETS[0]) handleSelectPreset(SAMPLE_PRESETS[0]);
      if (e.key === '2' && SAMPLE_PRESETS[1]) handleSelectPreset(SAMPLE_PRESETS[1]);
      if (e.key === '3' && SAMPLE_PRESETS[2]) handleSelectPreset(SAMPLE_PRESETS[2]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInvoice, credentials, policy]);

  // Process uploaded or camera image via Emet AI Vision & Forensic Engine
  const processImageWithAI = async (base64: string, fileName?: string, mimeType?: string) => {
    setIsProcessing(true);
    setSelectedPresetId('custom-upload');

    try {
      // Auto-detect MIME type from data URL if not passed
      let detectedMime = mimeType || 'image/jpeg';
      if (!mimeType && base64.startsWith('data:')) {
        const match = base64.match(/^data:([a-zA-Z0-9/+-]+);base64,/);
        if (match && match[1]) {
          detectedMime = match[1];
        }
      }

      const res = await fetch('/api/audit/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: detectedMime,
          fileName: fileName || 'Uploaded Document',
        }),
      });

      const result = await res.json();
      if (res.ok && result.success && result.invoice) {
        const invoiceData: InvoiceData = {
          ...result.invoice,
          sourceImageUrl: base64,
          sourceDocumentName: fileName || 'Uploaded Document',
        };
        const { issues, auditScore, agentDecision } = runAuditChecks(invoiceData, policy);
        invoiceData.issues = issues;
        invoiceData.auditScore = auditScore;
        invoiceData.agentDecision = agentDecision;
        setCurrentInvoice(invoiceData);
      } else {
        console.error('Audit OCR Error:', result);
      }
    } catch (err: any) {
      console.error('OCR Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      processImageWithAI(base64, file.name, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (base64: string) => {
    processImageWithAI(base64, 'Live Camera Capture', 'image/jpeg');
  };

  // Auto-Fix All Discrepancies
  const handleAutoFixAll = () => {
    const fixed = autoFixAllDiscrepancies(currentInvoice, policy);
    setCurrentInvoice(fixed);
  };

  // Apply single audit issue suggested fix
  const handleApplyFix = (issue: AuditIssue) => {
    if (!issue.suggestedFix?.patch) return;
    const updated = {
      ...currentInvoice,
      ...issue.suggestedFix.patch,
    };
    const { issues, auditScore, agentDecision } = runAuditChecks(updated, policy);
    updated.issues = issues;
    updated.auditScore = auditScore;
    updated.agentDecision = agentDecision;
    setCurrentInvoice(updated);
  };

  // User manually edits invoice fields or line items
  const handleInvoiceChange = (updated: InvoiceData) => {
    const { issues, auditScore, agentDecision } = runAuditChecks(updated, policy);
    setCurrentInvoice({
      ...updated,
      issues,
      auditScore,
      agentDecision,
    });
  };

  // Save updated policy and re-run audit on current invoice
  const handleSavePolicy = (updatedPolicy: BudgetPolicy) => {
    setPolicy(updatedPolicy);
    const { issues, auditScore, agentDecision } = runAuditChecks(currentInvoice, updatedPolicy);
    setCurrentInvoice({
      ...currentInvoice,
      issues,
      auditScore,
      agentDecision,
    });
  };

  // Execute Autonomous PayPal Payout (Disbursement API)
  const handleExecutePayPalPayout = async () => {
    const targetEmail = currentInvoice.customer?.email || currentInvoice.vendor?.email || 'vendor-payout@example.com';
    setIsExecutingPayout(true);

    try {
      const res = await fetch('/api/paypal/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: currentInvoice.vendor?.name || 'Vendor',
          vendorEmail: targetEmail,
          amount: currentInvoice.grandTotal,
          currency: currentInvoice.currency || 'INR',
          note: `Autonomous payout for verified invoice #${currentInvoice.invoiceNumber}`,
          invoiceNumber: currentInvoice.invoiceNumber,
          credentials,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPayoutResponse(data);
        setIsPayoutModalOpen(true);
      } else {
        alert(data.error || 'Failed to execute PayPal Payout: ' + (data.details || ''));
      }
    } catch (err: any) {
      console.error('PayPal Payout Error:', err);
      alert('Error executing PayPal Payout: ' + err.message);
    } finally {
      setIsExecutingPayout(false);
    }
  };

  // Send or Generate PayPal Invoicing v2 (Receivables API)
  const handleSendPayPalInvoice = async () => {
    let invoiceToSend = { ...currentInvoice };
    if (!invoiceToSend.customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceToSend.customer.email)) {
      const email = prompt('PayPal requires a recipient email address to route the invoice:', 'customer@example.in');
      if (!email) return;
      invoiceToSend = {
        ...invoiceToSend,
        customer: { ...invoiceToSend.customer, email },
      };
      setCurrentInvoice(invoiceToSend);
    }

    setIsSendingPayPal(true);
    try {
      const payload = buildPayPalInvoiceV2Payload(invoiceToSend, credentials.merchantEmail);

      const res = await fetch('/api/paypal/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: payload,
          credentials,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaypalResponse(data);
        setIsCheckoutModalOpen(true);
      } else {
        alert(data.error || 'Failed to issue PayPal Invoice. ' + (data.details || ''));
      }
    } catch (err: any) {
      console.error('PayPal Invoicing error:', err);
      alert('Error connecting to PayPal Invoicing API: ' + err.message);
    } finally {
      setIsSendingPayPal(false);
    }
  };

  const handleShowQrCode = () => {
    if (!paypalResponse) {
      const invoiceNumber = currentInvoice.invoiceNumber || `INV2-${Date.now().toString().slice(-6)}`;
      const simulatedInvoiceId = `INV2-SANDBOX-${Math.floor(100000 + Math.random() * 900000)}`;
      setPaypalResponse({
        success: true,
        invoiceId: simulatedInvoiceId,
        invoiceNumber,
        status: 'SENT',
        qrCodeUrl: '',
        paymentLink: `https://www.sandbox.paypal.com/invoice/p/#${simulatedInvoiceId}`,
        viewUrl: `https://www.sandbox.paypal.com/invoice/payerView/details/${simulatedInvoiceId}`,
        totalAmount: {
          currency_code: currentInvoice.currency || 'INR',
          value: currentInvoice.grandTotal.toFixed(2),
        },
        recipientEmail: currentInvoice.customer.email || 'accounts@example.in',
        createdAt: new Date().toISOString(),
        isSandbox: true,
        mode: 'sandbox_simulated',
      });
    }
    setIsCheckoutModalOpen(true);
  };

  const currentPayloadJson = JSON.stringify(
    buildPayPalInvoiceV2Payload(currentInvoice, credentials.merchantEmail),
    null,
    2
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(currentPayloadJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-white selection:text-black">

      {/* Top Floating Navigation */}
      <Header
        credentials={credentials}
        invoiceNumber={currentInvoice.invoiceNumber}
        policy={policy}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenPolicyDrawer={() => setIsPolicyDrawerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* Sample Datasets & Upload Ingestion Strip */}
        <UploadZone
          onSelectPreset={handleSelectPreset}
          onFileUpload={handleFileUpload}
          onCameraCapture={handleCameraCapture}
          isProcessing={isProcessing}
          selectedPresetId={selectedPresetId}
        />

        {/* Real-Time Audit Metrics Bar */}
        <AuditMetricsBar
          invoice={currentInvoice}
          onAutoFixAll={handleAutoFixAll}
        />

        {/* Autonomous Agent Decision Matrix ("AI Behind the Wheel") */}
        <AgentDecisionPanel
          decision={currentInvoice.agentDecision}
          policy={policy}
          invoice={currentInvoice}
          onOpenPolicyDrawer={() => setIsPolicyDrawerOpen(true)}
          onExecutePayout={handleExecutePayPalPayout}
          onAutoFixAndApprove={handleAutoFixAll}
          isExecutingPayout={isExecutingPayout}
        />

        {/* Two-Column Audit Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Document Viewer & Anomaly Alerts */}
          <div className="lg:col-span-5 space-y-4">
            <DocumentViewer
              imageUrl={currentInvoice.sourceImageUrl}
              invoice={currentInvoice}
            />

            <AuditAlerts
              issues={currentInvoice.issues}
              onApplyFix={handleApplyFix}
              currency={currentInvoice.currency}
            />
          </div>

          {/* Right: Invoice Ledger & Financial Controller */}
          <div className="lg:col-span-7">
            <InvoiceEditor
              invoice={currentInvoice}
              onChange={handleInvoiceChange}
              onSendPayPalInvoice={handleSendPayPalInvoice}
              onShowQrCode={handleShowQrCode}
              onExportJson={() => setIsJsonModalOpen(true)}
              isSendingPayPal={isSendingPayPal}
            />
          </div>
        </div>
      </main>

      {/* PayPal Payout Execution Modal (Disbursement) */}
      <PayPalPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        payoutResponse={payoutResponse}
      />

      {/* PayPal Checkout & QR Code Modal (Invoicing v2) */}
      <PayPalCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        paypalResponse={paypalResponse}
        invoice={currentInvoice}
      />

      {/* Budget Policy & Guardrails Drawer */}
      <BudgetPolicyDrawer
        isOpen={isPolicyDrawerOpen}
        onClose={() => setIsPolicyDrawerOpen(false)}
        policy={policy}
        onSavePolicy={handleSavePolicy}
      />

      {/* PayPal API Credentials Settings Modal */}
      <PayPalConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        credentials={credentials}
        onSave={(updated) => {
          setCredentials(updated);
          setIsConfigModalOpen(false);
        }}
      />

      {/* Hackathon Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Command Palette (⌘K) Modal */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in duration-100">
            <div className="flex items-center px-4 border-b border-[#1f1f1f] bg-[#0a0a0a]">
              <Search className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type command or test fixture name..."
                className="w-full bg-transparent py-3.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />
              <kbd className="font-mono text-[10px] text-neutral-400 bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">
                ESC
              </kbd>
            </div>
            <div className="p-2.5 space-y-1.5 max-h-72 overflow-y-auto text-xs">
              <div className="text-[10px] uppercase font-semibold text-neutral-400 px-2 py-1 tracking-wider">
                Preset Test Fixtures
              </div>
              {SAMPLE_PRESETS.filter((p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    handleSelectPreset(preset);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#171717] flex items-center justify-between text-neutral-200 transition cursor-pointer"
                >
                  <span className="truncate font-medium">{preset.title}</span>
                  <span className="text-[11px] font-mono text-neutral-400 font-medium">{preset.category}</span>
                </button>
              ))}

              <div className="text-[10px] uppercase font-semibold text-neutral-400 px-2 py-1 tracking-wider pt-2 border-t border-[#1f1f1f]">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  handleExecutePayPalPayout();
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#171717] flex items-center justify-between text-neutral-200 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execute Programmatic PayPal Payout</span>
                </span>
              </button>
              <button
                onClick={() => {
                  handleAutoFixAll();
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#171717] flex items-center justify-between text-neutral-200 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Wand2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Auto-Fix All Discrepancies</span>
                </span>
                <kbd className="font-mono text-[9px] text-neutral-400 bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">A</kbd>
              </button>
              <button
                onClick={() => {
                  setIsPolicyDrawerOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#171717] flex items-center justify-between text-neutral-200 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Configure Budget Guardrails</span>
                </span>
                <kbd className="font-mono text-[9px] text-neutral-400 bg-[#171717] px-1.5 py-0.5 rounded border border-[#262626]">⌘P</kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payload JSON Inspector Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0a0a0a]">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-100">
                <FileJson className="w-4 h-4 text-neutral-400" />
                <span>PayPal Invoicing API v2 Request Payload</span>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#171717] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 bg-[#080808] flex-1 overflow-auto font-mono text-xs text-neutral-300 border-y border-[#1f1f1f]">
              <pre>{currentPayloadJson}</pre>
            </div>
            <div className="px-5 py-3.5 bg-[#0a0a0a] flex justify-between items-center text-xs">
              <button
                onClick={handleCopyJson}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-2 transition active:scale-[0.98] cursor-pointer border border-[#262626]"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg text-xs transition active:scale-[0.98] cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Footer - Emet AI */}
      <footer className="border-t border-[#1f1f1f] bg-black/90 py-4 px-4 sm:px-6 lg:px-8 text-xs text-neutral-400 font-mono relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-neutral-200">Emet AI</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300">Autonomous Vendor Audit &amp; PayPal Execution Desk</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400">PayPal AI Hackathon</span>
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-300 font-medium">Agentic Commerce · PayPal Payouts &amp; Invoicing v2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
