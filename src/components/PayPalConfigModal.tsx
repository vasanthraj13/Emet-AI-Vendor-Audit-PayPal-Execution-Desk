import React, { useState, useEffect } from 'react';
import { 
  X, Key, ExternalLink, Check, AlertCircle, Loader2, 
  CreditCard, Radio, Cpu, RefreshCw, Play, ShieldCheck 
} from 'lucide-react';
import { PayPalCredentials, PayPalOrderResponse, PayPalCaptureResponse, PayPalWebhookRecord } from '../types/invoice';

interface PayPalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: PayPalCredentials;
  onSave: (creds: PayPalCredentials) => void;
}

export const PayPalConfigModal: React.FC<PayPalConfigModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'creds' | 'orders' | 'webhooks' | 'langchain'>('creds');
  const [formData, setFormData] = useState<PayPalCredentials>(credentials);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  // Server credentials status
  const [serverStatus, setServerStatus] = useState<{
    configured: boolean;
    mode: string;
    source: string;
    clientIdMasked: string;
    features: string[];
  } | null>(null);

  // Orders & Capture state
  const [orderAmount, setOrderAmount] = useState<string>('45.00');
  const [orderCurrency, setOrderCurrency] = useState<string>('USD');
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<PayPalOrderResponse | null>(null);
  const [captureLoading, setCaptureLoading] = useState<boolean>(false);
  const [capturedPayment, setCapturedPayment] = useState<PayPalCaptureResponse | null>(null);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<PayPalWebhookRecord[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState<boolean>(false);
  const [simulateEventType, setSimulateEventType] = useState<string>('PAYMENT.CAPTURE.COMPLETED');

  // LangChain state
  const [langchainLoading, setLangchainLoading] = useState<boolean>(false);
  const [langchainResult, setLangchainResult] = useState<any>(null);

  // Fetch status on open & sync credentials
  useEffect(() => {
    if (!isOpen) return;

    setFormData(credentials);

    fetch('/api/paypal/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setServerStatus(data);
        }
      })
      .catch(() => {});

    fetchWebhooks();
  }, [isOpen, credentials]);

  const fetchWebhooks = async () => {
    setWebhooksLoading(true);
    try {
      const res = await fetch('/api/paypal/webhooks');
      const data = await res.json();
      if (data.success && data.webhooks) {
        setWebhooks(data.webhooks);
      }
    } catch {
      // ignore
    } finally {
      setWebhooksLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');

    try {
      const res = await fetch('/api/paypal/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: formData }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setTestMessage(`Authenticated with PayPal Sandbox API (Token active for ${Math.round(data.expiresIn / 3600)}h)`);
      } else {
        setTestStatus('failed');
        setTestMessage(data.error || data.message || 'Authentication failed. Check credentials.');
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(err?.message || 'Connection error');
    }
  };

  const handleCreateOrder = async () => {
    setOrderLoading(true);
    setCapturedPayment(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderAmount,
          currency: orderCurrency,
          description: 'Autonomous Vendor Order Settlement',
          referenceId: `REF-${Date.now().toString().slice(-6)}`,
          credentials: formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedOrder(data);
        fetchWebhooks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCaptureOrder = async () => {
    if (!createdOrder) return;
    setCaptureLoading(true);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.orderId,
          credentials: formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCapturedPayment(data);
        fetchWebhooks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCaptureLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    try {
      const res = await fetch('/api/paypal/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: simulateEventType,
          amount: orderAmount,
          currency: orderCurrency,
        }),
      });
      if (res.ok) {
        fetchWebhooks();
      }
    } catch {
      // ignore
    }
  };

  const handleRunLangChainAudit = async () => {
    setLangchainLoading(true);
    try {
      const res = await fetch('/api/audit/langchain-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: {
            vendor: { name: 'Café Panama' },
            invoiceNumber: 'CP-2026-941',
            gstin: '29AAACU1234F1Z8',
            currency: 'INR',
            items: [
              { name: 'Special Filter Coffee', quantity: 4, unitPrice: 45, total: 180 },
              { name: 'Mysore Masala Dosa', quantity: 2, unitPrice: 95, total: 190 },
            ],
            subtotal: 370,
            taxAmount: 18.5,
            grandTotal: 388.5,
          },
          departmentPolicy: {
            department: 'Engineering & Cloud Operations',
            autoApprovalCap: 35000,
            monthlyBudget: 500000,
            currentSpent: 182967,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLangchainResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLangchainLoading(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-default"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#141414] border border-[#262626] text-neutral-300">
              <Key className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100">PayPal Sandbox &amp; AI Agent Console</h3>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Live Sandbox
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Orders v2 · Payment Capture · Webhooks Stream · LangChain Agent
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#171717] rounded-lg transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('creds')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'creds'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Orders &amp; Capture</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'webhooks'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Webhooks ({webhooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('langchain')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'langchain'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>LangChain Agent</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB 1: CREDENTIALS */}
          {activeTab === 'creds' && (
            <div className="space-y-4">
              {/* Server-side active credentials indicator */}
              <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-300">Active Server Configuration</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Protected in .env
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400">
                  <div>
                    <span className="text-neutral-500">Client ID: </span>
                    <span className="text-neutral-200 font-bold">{serverStatus?.clientIdMasked || 'AebFDU..._VUR'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Mode: </span>
                    <span className="text-sky-400 font-bold">PayPal Sandbox</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Endpoint: </span>
                    <span className="text-neutral-300">api-m.sandbox.paypal.com</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">OAuth Scopes: </span>
                    <span className="text-neutral-300">Orders, Invoicing, Payouts</span>
                  </div>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Target Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'sandbox' })}
                    className={`p-3 rounded-xl border text-left transition active:scale-[0.98] cursor-pointer ${
                      formData.mode === 'sandbox'
                        ? 'bg-[#141414] border-neutral-600 text-neutral-100 ring-1 ring-neutral-500'
                        : 'bg-[#080808] border-[#1f1f1f] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-neutral-100">Live PayPal Sandbox</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Calls real PayPal Sandbox endpoints via server-side OAuth.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'demo' })}
                    className={`p-3 rounded-xl border text-left transition active:scale-[0.98] cursor-pointer ${
                      formData.mode === 'demo'
                        ? 'bg-[#141414] border-neutral-600 text-neutral-100 ring-1 ring-neutral-500'
                        : 'bg-[#080808] border-[#1f1f1f] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-neutral-100">Instant Demo Simulator</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      High-fidelity simulation without contacting external APIs.
                    </div>
                  </button>
                </div>
              </div>

              {/* Invoicer Email */}
              <div>
                <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Merchant Invoicer Email</label>
                <input
                  type="email"
                  value={formData.merchantEmail}
                  onChange={(e) => setFormData({ ...formData, merchantEmail: e.target.value })}
                  placeholder="sb-32osp53762475@business.example.com"
                  className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-neutral-100 font-mono text-xs focus:border-neutral-500 focus:outline-none"
                />
              </div>

              {/* Status Message */}
              {testStatus !== 'idle' && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testStatus === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : testStatus === 'failed'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : 'bg-[#080808] border border-[#1f1f1f] text-neutral-400'
                  }`}
                >
                  {testStatus === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {testStatus === 'failed' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {testStatus === 'testing' && <Loader2 className="w-4 h-4 text-neutral-300 animate-spin shrink-0 mt-0.5" />}
                  <span className="font-mono text-[11px] font-semibold">{testMessage || 'Testing connection...'}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS & CAPTURE */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-100">Create Sandbox Order (Orders v2 API)</span>
                  <span className="text-[10px] font-mono text-neutral-400">POST /v2/checkout/orders</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-1.5 text-neutral-100 font-mono text-xs focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Currency</label>
                    <select
                      value={orderCurrency}
                      onChange={(e) => setOrderCurrency(e.target.value)}
                      className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-1.5 text-neutral-100 font-mono text-xs focus:border-neutral-500 focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateOrder}
                  disabled={orderLoading}
                  className="w-full py-2 bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {orderLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>Execute Order Creation</span>
                </button>
              </div>

              {/* Order Created Feedback */}
              {createdOrder && (
                <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100">Order Created: #{createdOrder.orderId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      {createdOrder.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 space-y-1">
                    <div>Amount: <span className="text-neutral-100 font-bold">{createdOrder.amount.currency} {createdOrder.amount.value}</span></div>
                    {createdOrder.approvalUrl && (
                      <div className="pt-1">
                        <a
                          href={createdOrder.approvalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-sky-400 hover:text-sky-300 text-xs transition"
                        >
                          <span>Open PayPal Sandbox Approval URL</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Capture Button */}
                  <div className="pt-1 border-t border-[#1f1f1f]">
                    <button
                      onClick={handleCaptureOrder}
                      disabled={captureLoading || !!capturedPayment}
                      className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-neutral-200 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      {captureLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Capture Order Funds ({createdOrder.orderId})</span>
                    </button>
                  </div>

                  {capturedPayment && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Payment Captured: {capturedPayment.captureId}</span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-300">
                        Status: <span className="text-emerald-400 font-bold">{capturedPayment.status}</span> · Captured funds settled in Sandbox ledger.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEBHOOKS STREAM */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-100">Live Sandbox Webhook Stream</h4>
                  <p className="text-[11px] text-neutral-400">Listener: <code className="text-neutral-300 font-mono">POST /api/paypal/webhook</code></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchWebhooks}
                    className="p-1.5 rounded-lg bg-[#141414] border border-[#262626] text-neutral-300 hover:text-white cursor-pointer transition"
                    title="Refresh Webhooks"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${webhooksLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleSimulateWebhook}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-black text-[11px] font-semibold rounded-lg transition cursor-pointer"
                  >
                    Simulate Webhook
                  </button>
                </div>
              </div>

              {/* Webhooks List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {webhooks.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500 text-xs border border-dashed border-[#1f1f1f] rounded-xl">
                    No webhook events recorded yet. Click &quot;Simulate Webhook&quot; or execute an Order/Invoice to record live events.
                  </div>
                ) : (
                  webhooks.map((wh) => (
                    <div
                      key={wh.id}
                      className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-neutral-100">{wh.event_type}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {wh.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">{wh.summary}</p>
                      <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between pt-1 border-t border-[#171717]">
                        <span>Event ID: {wh.id}</span>
                        <span>{new Date(wh.received_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LANGCHAIN AGENT */}
          {activeTab === 'langchain' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100">LangChain Forensic Audit Pipeline</h4>
                    <p className="text-[11px] text-neutral-400">Runnable PromptTemplate with structured policy evaluation</p>
                  </div>
                  <button
                    onClick={handleRunLangChainAudit}
                    disabled={langchainLoading}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    {langchainLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Run Chain</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-neutral-400 bg-[#080808] p-2.5 rounded-lg border border-[#1a1a1a]">
                  Chain: <span className="text-neutral-200">PromptTemplate &rarr; Gemini 3.8 Flash &rarr; Policy Enforcement</span>
                </div>
              </div>

              {langchainResult && (
                <div className="p-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100">LangChain Evaluation Result</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      langchainResult.arithmeticVerdict === 'BALANCED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {langchainResult.arithmeticVerdict}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {langchainResult.executiveSummary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400 pt-1 border-t border-[#1a1a1a]">
                    <div>HITL Required: <span className={langchainResult.hitlRequired ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{String(langchainResult.hitlRequired)}</span></div>
                    <div>Action: <span className="text-neutral-200 font-bold">{langchainResult.settlementAction}</span></div>
                  </div>

                  {langchainResult.hitlReason && (
                    <div className="text-[11px] font-mono text-neutral-400">
                      Reason: <span className="text-neutral-300">{langchainResult.hitlReason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1c1c1c] text-neutral-200 text-xs font-medium rounded-lg border border-[#262626] transition active:scale-[0.98] cursor-pointer"
          >
            Verify Credentials
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition active:scale-[0.98] cursor-pointer shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

