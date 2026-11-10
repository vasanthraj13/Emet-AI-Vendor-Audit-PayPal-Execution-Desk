export interface LineItem {
  id: string;
  name: string;
  description?: string;
  hsnSacCode?: string; // HSN / SAC Code for Indian GST compliance
  quantity: number;
  unitPrice: number;
  taxRate?: number; // GST percentage, e.g. 18 for 18% (9% CGST + 9% SGST)
  total: number; // quantity * unitPrice
  confidence?: number; // 0 to 1
  category?: string;
}

export interface AuditIssue {
  id: string;
  type: 'math_error' | 'duplicate_item' | 'missing_field' | 'tax_discrepancy' | 'price_anomaly' | 'policy_warning';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetField?: string;
  targetItemId?: string;
  suggestedFix?: {
    action: string;
    patch: Partial<InvoiceData>;
    buttonLabel: string;
  };
  resolved?: boolean;
}

export interface BudgetPolicy {
  department: string;
  monthlyLimit: number; // in INR (₹)
  spentThisMonth: number;
  maxAutoApproveLimit: number; // e.g. ₹25,000 - items above this require HITL
  requireHumanInTheLoop: boolean;
  flagNewVendors: boolean;
  maxPriceVariancePercent: number; // e.g. 15%
}

export interface PolicyCheckResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AgentLogStep {
  id: string;
  stage: 'PERCEPTION' | 'AUDIT' | 'POLICY_CHECK' | 'DECISION' | 'EXECUTION';
  title: string;
  detail: string;
  status: 'success' | 'warning' | 'alert' | 'executing';
  timestamp: string;
}

export interface AgentDecision {
  status: 'AUTO_APPROVED' | 'NEEDS_HITL' | 'REJECTED' | 'EXECUTED';
  riskScore: number; // 0 - 100 (lower is safer)
  reasoningSummary: string;
  policyChecks: PolicyCheckResult[];
  recommendedAction: 'EXECUTE_PAYPAL_PAYOUT' | 'REQUEST_HUMAN_APPROVAL' | 'SEND_DISPUTE_NOTICE' | 'ISSUE_PAYPAL_INVOICE';
  logs: AgentLogStep[];
  decisionTimestamp: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string; // Defaults to 'INR' (₹)
  placeOfSupply?: string; // State / Region (e.g., '29-Karnataka', '27-Maharashtra')
  
  // Merchant / Vendor
  vendor: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string; // GSTIN / PAN (e.g. 29AAAAA0000A1Z5)
    panNumber?: string;
    website?: string;
    isVerifiedVendor?: boolean;
  };

  // Recipient / Customer
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    gstin?: string; // Buyer GSTIN
    companyName?: string;
  };

  // Items & Calculations
  items: LineItem[];
  subtotal: number;
  taxRate: number; // overall percentage if uniform
  taxAmount: number;
  discountAmount: number;
  shippingOrTipAmount: number;
  grandTotal: number;
  
  // Stated vs Recalculated (from OCR document)
  originalStatedTotal?: number;
  originalStatedSubtotal?: number;
  originalStatedTax?: number;

  notes?: string;
  terms?: string;

  // Audit Metrics
  auditScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  issues: AuditIssue[];
  auditStatus: 'pending' | 'flagged' | 'verified' | 'ready_for_paypal';
  
  // Agentic Decision & Execution
  agentDecision?: AgentDecision;

  // Image reference
  sourceImageUrl?: string;
  sourceDocumentName?: string;
}

export interface PayPalInvoiceResponse {
  success: boolean;
  invoiceId: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  qrCodeUrl: string;
  paymentLink: string;
  viewUrl: string;
  totalAmount: {
    currency_code: string;
    value: string;
  };
  recipientEmail: string;
  createdAt: string;
  isSandbox: boolean;
  mode: 'real_api' | 'sandbox_simulated';
  rawResponse?: any;
}

export interface PayPalPayoutResponse {
  success: boolean;
  payoutBatchId: string;
  payoutStatus: 'SUCCESS' | 'PENDING' | 'DENIED';
  recipientEmail: string;
  vendorName: string;
  amount: {
    currency: string;
    value: string;
  };
  senderBatchId: string;
  transactionId: string;
  executedAt: string;
  note: string;
  isSandbox: boolean;
  mode: 'real_api' | 'sandbox_simulated';
}

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live' | 'demo';
  merchantEmail: string;
}

export interface PayPalOrderResponse {
  success: boolean;
  orderId: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  approvalUrl: string;
  captureUrl?: string;
  amount: {
    currency: string;
    value: string;
  };
  mode: 'real_sandbox' | 'sandbox_simulated';
  rawResponse?: any;
}

export interface PayPalCaptureResponse {
  success: boolean;
  orderId: string;
  captureId: string;
  status: 'COMPLETED' | 'DECLINED' | 'PENDING';
  payer?: any;
  amount?: any;
  mode: 'real_sandbox' | 'sandbox_simulated';
}

export interface PayPalWebhookRecord {
  id: string;
  event_type: string;
  create_time: string;
  summary: string;
  status: string;
  resource_type?: string;
  resource?: any;
  received_at: string;
}

