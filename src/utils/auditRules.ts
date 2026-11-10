import { InvoiceData, AuditIssue, LineItem, BudgetPolicy, AgentDecision, AgentLogStep, PolicyCheckResult } from '../types/invoice';

export const getCurrencySymbol = (currency: string = 'INR'): string => {
  switch (currency.toUpperCase()) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'SGD':
      return 'S$';
    case 'AUD':
      return 'A$';
    case 'CAD':
      return 'C$';
    case 'JPY':
      return '¥';
    default:
      return currency;
  }
};

export const DEFAULT_BUDGET_POLICY: BudgetPolicy = {
  department: 'Engineering & Cloud Operations (Bengaluru HQ)',
  monthlyLimit: 500000, // ₹5,00,000 monthly ceiling
  spentThisMonth: 182400, // ₹1,82,400 spent
  maxAutoApproveLimit: 35000, // ₹35,000 auto-approval threshold without HITL
  requireHumanInTheLoop: false,
  flagNewVendors: true,
  maxPriceVariancePercent: 15,
};

/**
 * Performs deep financial verification and PayPal India compliance audit on an invoice.
 */
export function runAuditChecks(
  invoice: InvoiceData,
  policy: BudgetPolicy = DEFAULT_BUDGET_POLICY
): { issues: AuditIssue[]; auditScore: number; agentDecision: AgentDecision } {
  const issues: AuditIssue[] = [];
  let penalty = 0;
  const policyChecks: PolicyCheckResult[] = [];
  const logs: AgentLogStep[] = [];
  const sym = getCurrencySymbol(invoice.currency || 'INR');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Step 1: Perception Log
  logs.push({
    id: 'log-perception',
    stage: 'PERCEPTION',
    title: 'Multi-Modal Ingestion Complete',
    detail: `Extracted ${invoice.items.length} line items from ${invoice.vendor.name || 'Vendor'} (GSTIN: ${invoice.vendor.taxId || 'Not specified'} · Invoice #${invoice.invoiceNumber || 'NEW'}).`,
    status: 'success',
    timestamp: now
  });

  // 1. Line Item Math Check
  let calculatedSubtotal = 0;
  let hasMathError = false;

  invoice.items.forEach((item, index) => {
    const expectedItemTotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const itemTotal = Math.round(item.total * 100) / 100;
    
    if (Math.abs(expectedItemTotal - itemTotal) > 0.02) {
      penalty += 15;
      hasMathError = true;
      const diff = Math.abs(expectedItemTotal - itemTotal);
      issues.push({
        id: `math-item-${item.id || index}`,
        type: 'math_error',
        severity: 'high',
        title: `Arithmetic Mismatch: "${item.name}"`,
        description: `Quantity (${item.quantity}) × Rate (${sym} ${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) should equal ${sym} ${expectedItemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, but document lists ${sym} ${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (gap: ${sym} ${diff.toFixed(2)}).`,
        targetItemId: item.id,
        suggestedFix: {
          action: 'fix_item_math',
          patch: {
            items: invoice.items.map(it => it.id === item.id ? { ...it, total: expectedItemTotal } : it)
          },
          buttonLabel: `Recalculate to ${sym} ${expectedItemTotal.toFixed(2)}`
        }
      });
    }

    calculatedSubtotal += expectedItemTotal;
  });

  calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

  // 2. Subtotal Sum Check
  const statedSubtotal = Math.round(invoice.subtotal * 100) / 100;
  if (Math.abs(calculatedSubtotal - statedSubtotal) > 0.05) {
    penalty += 20;
    hasMathError = true;
    const diff = Math.abs(calculatedSubtotal - statedSubtotal);
    issues.push({
      id: 'subtotal-sum-mismatch',
      type: 'math_error',
      severity: 'high',
      title: 'Taxable Subtotal Calculation Discrepancy',
      description: `Sum of line items is ${sym} ${calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, but stated subtotal is ${sym} ${statedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (discrepancy: ${sym} ${diff.toFixed(2)}).`,
      targetField: 'subtotal',
      suggestedFix: {
        action: 'correct_subtotal',
        patch: { subtotal: calculatedSubtotal },
        buttonLabel: `Set Subtotal to ${sym} ${calculatedSubtotal.toFixed(2)}`
      }
    });
  }

  // 3. Duplicate Line Item Detection
  let hasDuplicate = false;
  const seenNames = new Map<string, number>();
  invoice.items.forEach(item => {
    const norm = item.name.trim().toLowerCase();
    if (norm.length > 2) {
      seenNames.set(norm, (seenNames.get(norm) || 0) + 1);
    }
  });

  seenNames.forEach((count, name) => {
    if (count > 1) {
      penalty += 12;
      hasDuplicate = true;
      issues.push({
        id: `duplicate-${name}`,
        type: 'duplicate_item',
        severity: 'medium',
        title: `Possible Duplicate Charge: "${name}"`,
        description: `This line item appears ${count} times on the bill. Was this service/item delivered twice or erroneously billed?`,
        suggestedFix: {
          action: 'deduplicate',
          patch: {
            items: invoice.items.reduce<LineItem[]>((acc, item) => {
              if (item.name.trim().toLowerCase() === name) {
                const existing = acc.find(x => x.name.trim().toLowerCase() === name);
                if (existing) {
                  existing.quantity += item.quantity;
                  existing.total = Math.round(existing.quantity * existing.unitPrice * 100) / 100;
                  return acc;
                }
              }
              acc.push({ ...item });
              return acc;
            }, [])
          },
          buttonLabel: `Consolidate (${count}×) into single line item`
        }
      });
    }
  });

  // 4. GST Tax Verification (CGST/SGST/IGST)
  if (invoice.taxRate > 0) {
    const expectedTax = Math.round(calculatedSubtotal * (invoice.taxRate / 100) * 100) / 100;
    const statedTax = Math.round(invoice.taxAmount * 100) / 100;
    if (Math.abs(expectedTax - statedTax) > 0.1) {
      penalty += 10;
      const gstLabel = invoice.taxRate === 18 ? '18% GST (9% CGST + 9% SGST)' : invoice.taxRate === 5 ? '5% GST' : `${invoice.taxRate}% GST`;
      issues.push({
        id: 'tax-rate-mismatch',
        type: 'tax_discrepancy',
        severity: 'medium',
        title: 'GST Calculation Mismatch',
        description: `Stated GST is ${sym} ${statedTax.toFixed(2)}, but ${gstLabel} on taxable ${sym} ${calculatedSubtotal.toFixed(2)} is ${sym} ${expectedTax.toFixed(2)}.`,
        targetField: 'taxAmount',
        suggestedFix: {
          action: 'fix_tax',
          patch: { taxAmount: expectedTax },
          buttonLabel: `Adjust GST to ${sym} ${expectedTax.toFixed(2)}`
        }
      });
    }
  }

  // 5. Grand Total Integrity Check
  const expectedGrandTotal = Math.round(
    (calculatedSubtotal + (invoice.taxAmount || 0) - (invoice.discountAmount || 0) + (invoice.shippingOrTipAmount || 0)) * 100
  ) / 100;
  const statedGrandTotal = Math.round(invoice.grandTotal * 100) / 100;

  if (Math.abs(expectedGrandTotal - statedGrandTotal) > 0.05) {
    penalty += 25;
    hasMathError = true;
    const diff = Math.abs(expectedGrandTotal - statedGrandTotal);
    issues.push({
      id: 'grand-total-mismatch',
      type: 'math_error',
      severity: 'high',
      title: 'Invoice Grand Total Does Not Balance',
      description: `Calculated total (Taxable ${sym} ${calculatedSubtotal.toFixed(2)} + GST ${sym} ${invoice.taxAmount.toFixed(2)} - Discount) = ${sym} ${expectedGrandTotal.toFixed(2)}, but document claims ${sym} ${statedGrandTotal.toFixed(2)} (variance: ${sym} ${diff.toFixed(2)}).`,
      targetField: 'grandTotal',
      suggestedFix: {
        action: 'rebalance_grand_total',
        patch: { grandTotal: expectedGrandTotal },
        buttonLabel: `Balance Total to ${sym} ${expectedGrandTotal.toFixed(2)}`
      }
    });
  }

  // 6. GSTIN & Tax Compliance Check (Indian Section 31 CGST Act)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (invoice.vendor.taxId && !gstinRegex.test(invoice.vendor.taxId.trim()) && invoice.vendor.taxId.length !== 10) {
    penalty += 5;
    issues.push({
      id: 'invalid-gstin-format',
      type: 'policy_warning',
      severity: 'low',
      title: 'Non-Standard GSTIN Format',
      description: `Vendor GSTIN "${invoice.vendor.taxId}" does not conform to the 15-character statutory GST format (e.g. 29AAAAA0000A1Z5). Verify vendor registration on the GST portal.`,
      targetField: 'vendor.taxId'
    });
  }

  // Step 2: Audit Engine Log
  logs.push({
    id: 'log-audit',
    stage: 'AUDIT',
    title: 'GST & Arithmetic Forensic Audit',
    detail: hasMathError 
      ? `Detected arithmetic variances (${issues.filter(i => i.type === 'math_error').length} math discrepancies). Stated Total: ${sym} ${statedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Calculated: ${sym} ${expectedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`
      : 'All line item rates, GST brackets, and invoice totals match 100% with zero variance.',
    status: hasMathError ? 'alert' : 'success',
    timestamp: now
  });

  // 7. Policy & Budget Rail Checks
  // A. Budget Limit Check
  const projectedSpend = policy.spentThisMonth + invoice.grandTotal;
  const isWithinBudget = projectedSpend <= policy.monthlyLimit;
  policyChecks.push({
    id: 'policy-budget',
    name: 'Department Monthly Budget',
    passed: isWithinBudget,
    message: isWithinBudget
      ? `Within budget: ${sym} ${projectedSpend.toLocaleString('en-IN')} of ${sym} ${policy.monthlyLimit.toLocaleString('en-IN')} ceiling.`
      : `Exceeds monthly cap by ${sym} ${(projectedSpend - policy.monthlyLimit).toLocaleString('en-IN')}!`,
    severity: isWithinBudget ? 'info' : 'critical'
  });

  // B. Auto-Approval Threshold Check
  const isUnderAutoThreshold = invoice.grandTotal <= policy.maxAutoApproveLimit;
  policyChecks.push({
    id: 'policy-threshold',
    name: 'Autonomous Approval Ceiling',
    passed: isUnderAutoThreshold,
    message: isUnderAutoThreshold
      ? `Invoice total ${sym} ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} is within auto-payout threshold (${sym} ${policy.maxAutoApproveLimit.toLocaleString('en-IN')}).`
      : `Invoice total ${sym} ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} exceeds autonomous cap (${sym} ${policy.maxAutoApproveLimit.toLocaleString('en-IN')}). Escalated to Human-in-the-Loop review.`,
    severity: isUnderAutoThreshold ? 'info' : 'warning'
  });

  // C. Recipient PayPal Routing Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidRecipientEmail = invoice.customer?.email && emailRegex.test(invoice.customer.email.trim());
  policyChecks.push({
    id: 'policy-paypal-routing',
    name: 'PayPal India Settlement Endpoint',
    passed: !!hasValidRecipientEmail,
    message: hasValidRecipientEmail 
      ? `Verified PayPal settlement email: ${invoice.customer.email}.`
      : 'Missing recipient email address required for PayPal transaction routing.',
    severity: hasValidRecipientEmail ? 'info' : 'critical'
  });

  if (!hasValidRecipientEmail) {
    penalty += 15;
    issues.push({
      id: 'missing-customer-email',
      type: 'missing_field',
      severity: 'high',
      title: 'Missing Recipient Email (PayPal Requirement)',
      description: 'PayPal Invoicing & Payouts API requires a valid recipient email address to route the transaction.',
      targetField: 'customer.email',
      suggestedFix: {
        action: 'add_default_email',
        patch: {
          customer: {
            ...invoice.customer,
            email: invoice.customer?.email || 'accounts.india@acme-enterprises.in'
          }
        },
        buttonLabel: 'Set Official Email (accounts.india@acme-enterprises.in)'
      }
    });
  }

  // Step 3: Policy Check Log
  logs.push({
    id: 'log-policy',
    stage: 'POLICY_CHECK',
    title: 'Corporate Budget & GST Guardrails',
    detail: `Department: "${policy.department}". Auto-limit: ${sym} ${policy.maxAutoApproveLimit.toLocaleString('en-IN')}. Cleared ${policyChecks.filter(p => p.passed).length}/${policyChecks.length} compliance checks.`,
    status: policyChecks.every(p => p.passed) ? 'success' : 'warning',
    timestamp: now
  });

  // Calculate final score
  const finalScore = Math.max(10, Math.min(100, 100 - penalty));

  // Step 4: Autonomous Decision Matrix
  let agentStatus: AgentDecision['status'] = 'AUTO_APPROVED';
  let recommendedAction: AgentDecision['recommendedAction'] = 'EXECUTE_PAYPAL_PAYOUT';
  let reasoningSummary = '';

  if (hasMathError || hasDuplicate || !hasValidRecipientEmail) {
    agentStatus = 'NEEDS_HITL';
    recommendedAction = 'REQUEST_HUMAN_APPROVAL';
    reasoningSummary = `HITL Guardrail Activated: ${issues.length} discrepancies flagged (arithmetic/GST gap). Autonomous payout paused until accountant approves reconciled numbers.`;
  } else if (!isUnderAutoThreshold || policy.requireHumanInTheLoop) {
    agentStatus = 'NEEDS_HITL';
    recommendedAction = 'REQUEST_HUMAN_APPROVAL';
    reasoningSummary = `Human Oversight Triggered: Total (${sym} ${invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) exceeds auto-approval ceiling (${sym} ${policy.maxAutoApproveLimit.toLocaleString('en-IN')}). Manual sign-off required prior to PayPal dispatch.`;
  } else if (!isWithinBudget) {
    agentStatus = 'REJECTED';
    recommendedAction = 'SEND_DISPUTE_NOTICE';
    reasoningSummary = `Department Budget Cap Breached: Projected spend (${sym} ${projectedSpend.toLocaleString('en-IN')}) exceeds allocated limit (${sym} ${policy.monthlyLimit.toLocaleString('en-IN')}).`;
  } else {
    agentStatus = 'AUTO_APPROVED';
    recommendedAction = 'EXECUTE_PAYPAL_PAYOUT';
    reasoningSummary = `Autonomous Clearance Granted: Math verified, GST compliant, valid PayPal routing, and within ₹${policy.maxAutoApproveLimit.toLocaleString('en-IN')} ceiling. Ready for programmatic PayPal Payout.`;
  }

  logs.push({
    id: 'log-decision',
    stage: 'DECISION',
    title: `Agentic Decision: ${agentStatus.replace('_', ' ')}`,
    detail: reasoningSummary,
    status: agentStatus === 'AUTO_APPROVED' ? 'success' : 'warning',
    timestamp: now
  });

  const agentDecision: AgentDecision = {
    status: agentStatus,
    riskScore: 100 - finalScore,
    reasoningSummary,
    policyChecks,
    recommendedAction,
    logs,
    decisionTimestamp: new Date().toISOString()
  };

  return { issues, auditScore: finalScore, agentDecision };
}

/**
 * Applies all automated fixes simultaneously to produce a verified, balanced invoice.
 */
export function autoFixAllDiscrepancies(
  invoice: InvoiceData,
  policy: BudgetPolicy = DEFAULT_BUDGET_POLICY
): InvoiceData {
  // 1. Recalculate line items
  let newItems = invoice.items.map(item => ({
    ...item,
    total: Math.round(item.quantity * item.unitPrice * 100) / 100
  }));

  // 2. Deduplicate duplicate names if any
  const itemMap = new Map<string, LineItem>();
  newItems.forEach(item => {
    const key = item.name.trim().toLowerCase();
    if (itemMap.has(key)) {
      const existing = itemMap.get(key)!;
      existing.quantity += item.quantity;
      existing.total = Math.round(existing.quantity * existing.unitPrice * 100) / 100;
    } else {
      itemMap.set(key, { ...item });
    }
  });
  newItems = Array.from(itemMap.values());

  // 3. Recalculate subtotal
  const newSubtotal = Math.round(newItems.reduce((acc, it) => acc + it.total, 0) * 100) / 100;

  // 4. Recalculate tax
  const taxRate = invoice.taxRate || (invoice.subtotal > 0 && invoice.taxAmount > 0 ? (invoice.taxAmount / invoice.subtotal) * 100 : 0);
  const roundedTaxRate = Math.round(taxRate * 10) / 10;
  const newTaxAmount = Math.round(newSubtotal * (roundedTaxRate / 100) * 100) / 100;

  // 5. Grand total
  const newGrandTotal = Math.round(
    (newSubtotal + newTaxAmount - (invoice.discountAmount || 0) + (invoice.shippingOrTipAmount || 0)) * 100
  ) / 100;

  // 6. Ensure customer email
  const customerEmail = invoice.customer.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.customer.email)
    ? invoice.customer.email
    : 'accounts.india@acme-enterprises.in';

  const updated: InvoiceData = {
    ...invoice,
    items: newItems,
    subtotal: newSubtotal,
    taxRate: roundedTaxRate,
    taxAmount: newTaxAmount,
    grandTotal: newGrandTotal,
    currency: invoice.currency || 'INR',
    customer: {
      ...invoice.customer,
      email: customerEmail,
      name: invoice.customer.name || 'Accounts Payable Team'
    },
    invoiceNumber: invoice.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    auditStatus: 'verified'
  };

  const reAudit = runAuditChecks(updated, policy);
  updated.issues = reAudit.issues;
  updated.auditScore = reAudit.auditScore;
  updated.agentDecision = reAudit.agentDecision;

  return updated;
}
