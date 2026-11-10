import React from 'react';
import { 
  Plus, Trash2, QrCode, Send, AlertTriangle, 
  FileJson, Mail, Building2, UserCheck, Calendar, MapPin
} from 'lucide-react';
import { InvoiceData, LineItem } from '../types/invoice';
import { getCurrencySymbol } from '../utils/auditRules';

interface InvoiceEditorProps {
  invoice: InvoiceData;
  onChange: (updated: InvoiceData) => void;
  onSendPayPalInvoice: () => void;
  onShowQrCode: () => void;
  onExportJson: () => void;
  isSendingPayPal: boolean;
}

const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'];

const INDIAN_STATES = [
  '29-Karnataka',
  '27-Maharashtra',
  '07-Delhi',
  '33-Tamil Nadu',
  '36-Telangana',
  '24-Gujarat',
  '19-West Bengal',
  '09-Uttar Pradesh',
  '06-Haryana',
  '32-Kerala'
];

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onSendPayPalInvoice,
  onShowQrCode,
  onExportJson,
  isSendingPayPal,
}) => {
  const sym = getCurrencySymbol(invoice.currency || 'INR');

  // Line item handlers
  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...invoice.items];
    const item = { ...updatedItems[index], [field]: value };

    // Auto-calculate item total if quantity or unitPrice changed
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.total = Math.round(q * p * 100) / 100;
    }

    updatedItems[index] = item;

    // Recalculate invoice totals
    const newSubtotal = Math.round(updatedItems.reduce((sum, it) => sum + it.total, 0) * 100) / 100;
    const newTax = invoice.taxRate > 0 ? Math.round(newSubtotal * (invoice.taxRate / 100) * 100) / 100 : invoice.taxAmount;
    const newGrandTotal = Math.round((newSubtotal + newTax - (invoice.discountAmount || 0) + (invoice.shippingOrTipAmount || 0)) * 100) / 100;

    onChange({
      ...invoice,
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTax,
      grandTotal: newGrandTotal,
    });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: 'Chef Tasting Platter / Artisanal Course',
      hsnSacCode: '996331',
      quantity: 1,
      unitPrice: 650.00,
      total: 650.00,
      category: 'Dining'
    };
    const updatedItems = [...invoice.items, newItem];
    const newSubtotal = Math.round(updatedItems.reduce((sum, it) => sum + it.total, 0) * 100) / 100;
    const newTax = invoice.taxRate > 0 ? Math.round(newSubtotal * (invoice.taxRate / 100) * 100) / 100 : invoice.taxAmount;
    const newGrandTotal = Math.round((newSubtotal + newTax - (invoice.discountAmount || 0) + (invoice.shippingOrTipAmount || 0)) * 100) / 100;

    onChange({
      ...invoice,
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTax,
      grandTotal: newGrandTotal,
    });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    const newSubtotal = Math.round(updatedItems.reduce((sum, it) => sum + it.total, 0) * 100) / 100;
    const newTax = invoice.taxRate > 0 ? Math.round(newSubtotal * (invoice.taxRate / 100) * 100) / 100 : invoice.taxAmount;
    const newGrandTotal = Math.round((newSubtotal + newTax - (invoice.discountAmount || 0) + (invoice.shippingOrTipAmount || 0)) * 100) / 100;

    onChange({
      ...invoice,
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTax,
      grandTotal: newGrandTotal,
    });
  };

  const handleTaxRateChange = (newRate: number) => {
    const taxAmount = Math.round(invoice.subtotal * (newRate / 100) * 100) / 100;
    const grandTotal = Math.round((invoice.subtotal + taxAmount - (invoice.discountAmount || 0) + (invoice.shippingOrTipAmount || 0)) * 100) / 100;
    onChange({
      ...invoice,
      taxRate: newRate,
      taxAmount,
      grandTotal,
    });
  };

  const handleDiscountChange = (discount: number) => {
    const grandTotal = Math.round((invoice.subtotal + invoice.taxAmount - discount + (invoice.shippingOrTipAmount || 0)) * 100) / 100;
    onChange({
      ...invoice,
      discountAmount: discount,
      grandTotal,
    });
  };

  const handleTipShippingChange = (tipOrShipping: number) => {
    const grandTotal = Math.round((invoice.subtotal + invoice.taxAmount - (invoice.discountAmount || 0) + tipOrShipping) * 100) / 100;
    onChange({
      ...invoice,
      shippingOrTipAmount: tipOrShipping,
      grandTotal,
    });
  };

  const isEmailMissing = !invoice.customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.customer.email);

  return (
    <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 text-neutral-100">
      {/* Top Bar: Invoice Reference, Currency & Place of Supply */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 pb-4 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#141414] border border-[#262626] text-neutral-300 font-mono text-sm font-bold">
            {sym}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Tax Invoice # (GST Compliant)
            </div>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => onChange({ ...invoice, invoiceNumber: e.target.value })}
              className="text-base font-mono font-bold text-neutral-100 bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-neutral-400 focus:outline-none transition"
              placeholder="INV-MUM-2026-001"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Place of Supply */}
          <div className="flex items-center gap-1.5 bg-[#121212] px-2.5 py-1.5 rounded-lg border border-[#262626]">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={invoice.placeOfSupply || '27-Maharashtra'}
              onChange={(e) => onChange({ ...invoice, placeOfSupply: e.target.value })}
              className="bg-transparent text-xs font-mono font-medium text-neutral-200 focus:outline-none cursor-pointer"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s} className="bg-[#171717] text-neutral-100">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-1.5 bg-[#121212] px-2.5 py-1.5 rounded-lg border border-[#262626]">
            <span className="text-[10px] text-neutral-400 font-bold">CUR</span>
            <select
              value={invoice.currency || 'INR'}
              onChange={(e) => onChange({ ...invoice, currency: e.target.value })}
              className="bg-transparent text-xs font-mono font-medium text-neutral-200 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-[#171717] text-neutral-100">
                  {c} {c === 'INR' ? '(₹)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-[#121212] px-2.5 py-1.5 rounded-lg border border-[#262626]">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => onChange({ ...invoice, invoiceDate: e.target.value })}
              className="bg-transparent text-xs font-mono text-neutral-200 font-semibold focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Merchant & Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Merchant Card */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 tracking-tight">
            <Building2 className="w-4 h-4 text-neutral-400" />
            <span>Supplier / Merchant (India)</span>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Registered Legal Entity</label>
              <input
                type="text"
                value={invoice.vendor.name}
                onChange={(e) => onChange({
                  ...invoice,
                  vendor: { ...invoice.vendor, name: e.target.value }
                })}
                className="w-full text-xs font-semibold text-neutral-100 bg-[#121212] border border-[#262626] rounded-lg px-3 py-1.5 focus:border-neutral-500 focus:outline-none transition"
                placeholder="Café Panama / Enterprise LLP"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Accounts Email</label>
                <input
                  type="email"
                  value={invoice.vendor.email || ''}
                  onChange={(e) => onChange({
                    ...invoice,
                    vendor: { ...invoice.vendor, email: e.target.value }
                  })}
                  className="w-full text-xs text-neutral-100 bg-[#121212] border border-[#262626] rounded-lg px-2.5 py-1.5 focus:border-neutral-500 focus:outline-none font-mono transition"
                  placeholder="billing@cafepanama.in"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">GSTIN / PAN</label>
                <input
                  type="text"
                  value={invoice.vendor.taxId || ''}
                  onChange={(e) => onChange({
                    ...invoice,
                    vendor: { ...invoice.vendor, taxId: e.target.value }
                  })}
                  className="w-full text-xs text-neutral-200 font-bold bg-[#121212] border border-[#262626] rounded-lg px-2.5 py-1.5 focus:border-neutral-500 focus:outline-none font-mono transition"
                  placeholder="27AABCP1234F1Z0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer / Recipient Card */}
        <div className={`p-4 rounded-xl bg-[#0a0a0a] border space-y-2.5 transition-all ${
          isEmailMissing ? 'border-amber-500/50' : 'border-[#1f1f1f]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 tracking-tight">
              <UserCheck className="w-4 h-4 text-neutral-400" />
              <span>Recipient (Billed To)</span>
            </div>
            {isEmailMissing && (
              <span className="text-[11px] font-mono text-amber-400 font-medium flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Required for PayPal Payout
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Client / Organization Name</label>
              <input
                type="text"
                value={invoice.customer.name}
                onChange={(e) => onChange({
                  ...invoice,
                  customer: { ...invoice.customer, name: e.target.value }
                })}
                className="w-full text-xs font-semibold text-neutral-100 bg-[#121212] border border-[#262626] rounded-lg px-3 py-1.5 focus:border-neutral-500 focus:outline-none transition"
                placeholder="Client Corporate Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">
                  Recipient PayPal Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
                  <input
                    type="email"
                    value={invoice.customer.email}
                    onChange={(e) => onChange({
                      ...invoice,
                      customer: { ...invoice.customer, email: e.target.value }
                    })}
                    className={`w-full text-xs text-neutral-100 bg-[#121212] border rounded-lg pl-8 pr-2.5 py-1.5 font-mono focus:outline-none transition ${
                      isEmailMissing ? 'border-amber-500 focus:border-amber-400' : 'border-[#262626] focus:border-neutral-500'
                    }`}
                    placeholder="accounts@client.in"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 font-semibold block mb-0.5">Buyer GSTIN (Optional)</label>
                <input
                  type="text"
                  value={invoice.customer.gstin || ''}
                  onChange={(e) => onChange({
                    ...invoice,
                    customer: { ...invoice.customer, gstin: e.target.value }
                  })}
                  className="w-full text-xs text-neutral-200 font-bold bg-[#121212] border border-[#262626] rounded-lg px-2.5 py-1.5 focus:border-neutral-500 focus:outline-none font-mono transition"
                  placeholder="27AABCS1234F1Z8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Density Line Items Data Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-200 tracking-tight">
              Itemized Particulars
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs font-mono text-neutral-400">
              {invoice.items.length} {invoice.items.length === 1 ? 'line item' : 'line items'}
            </span>
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-[#141414] hover:bg-[#1e1e1e] border border-[#262626] rounded-lg transition active:scale-[0.98] cursor-pointer"
            title="Add new line item (N)"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-400" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#0a0a0a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-neutral-400 font-semibold border-b border-[#1f1f1f]">
                <tr>
                  <th className="py-2.5 px-3.5 text-[11px]">Particulars / Service Description</th>
                  <th className="py-2.5 px-2 w-24 text-[11px] font-mono">HSN/SAC</th>
                  <th className="py-2.5 px-2 w-16 text-center text-[11px]">Qty</th>
                  <th className="py-2.5 px-2 w-28 text-right text-[11px]">Rate ({sym})</th>
                  <th className="py-2.5 px-3.5 w-32 text-right text-[11px]">Amount ({sym})</th>
                  <th className="py-2.5 px-2 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {invoice.items.map((item, idx) => {
                  const expectedTotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
                  const hasMathMismatch = Math.abs(expectedTotal - item.total) > 0.02;

                  return (
                    <tr key={item.id || idx} className="hover:bg-[#121212] transition-colors">
                      {/* Name */}
                      <td className="py-2 px-3.5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="w-full bg-transparent text-neutral-100 font-medium focus:bg-[#181818] focus:outline-none px-2 py-1 rounded"
                          placeholder="Item or course description"
                        />
                      </td>

                      {/* HSN/SAC Code */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.hsnSacCode || ''}
                          onChange={(e) => handleItemChange(idx, 'hsnSacCode', e.target.value)}
                          className="w-20 bg-[#121212] border border-[#262626] text-neutral-300 font-mono text-[11px] px-2 py-1 rounded focus:border-neutral-500 focus:outline-none"
                          placeholder="996331"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-[#121212] border border-[#262626] text-center text-neutral-100 font-mono text-xs px-1.5 py-1 rounded focus:border-neutral-500 focus:outline-none tabular-nums font-medium"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-neutral-500 font-mono text-[11px]">{sym}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-[#121212] border border-[#262626] text-right text-neutral-100 font-mono text-xs px-2 py-1 rounded focus:border-neutral-500 focus:outline-none tabular-nums font-medium"
                          />
                        </div>
                      </td>

                      {/* Item Total */}
                      <td className="py-2 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasMathMismatch && (
                            <span
                              className="w-2 h-2 rounded-full bg-rose-500 shrink-0 cursor-help"
                              title={`Arithmetic mismatch: ${item.quantity} × ${item.unitPrice} = ${expectedTotal}`}
                            />
                          )}
                          <span className="font-mono font-bold text-neutral-100 tabular-nums">
                            {sym} {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleDeleteItem(idx)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-[#181818] rounded-lg transition cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Summary & Breakdown */}
      <div className="flex flex-col sm:flex-row justify-between gap-5 pt-3 border-t border-[#1f1f1f]">
        {/* Notes & Terms */}
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            GST &amp; Payment Compliance Notes
          </label>
          <textarea
            value={invoice.notes || ''}
            onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
            rows={4}
            className="w-full text-xs text-neutral-200 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-3 focus:border-neutral-500 focus:outline-none resize-none font-mono"
            placeholder="Section 31 CGST Act notes, table reference, or corporate reimbursement terms"
          />
        </div>

        {/* Calculation Totals */}
        <div className="w-full sm:w-88 space-y-2 p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f]">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Taxable Value:</span>
            <span className="font-mono font-bold text-neutral-100 tabular-nums">
              {sym} {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span>GST Bracket:</span>
              <select
                value={invoice.taxRate}
                onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
                className="bg-[#141414] border border-[#262626] text-xs text-neutral-200 font-medium rounded px-2 py-0.5 font-mono cursor-pointer"
              >
                <option value={0}>0% (Nil)</option>
                <option value={5}>5% GST (2.5% CGST + 2.5% SGST)</option>
                <option value={12}>12% GST (6% CGST + 6% SGST)</option>
                <option value={18}>18% GST (9% CGST + 9% SGST / IGST)</option>
                <option value={28}>28% GST (14% CGST + 14% SGST)</option>
              </select>
            </div>
            <span className="font-mono font-bold text-neutral-100 tabular-nums">
              {sym} {invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Special Discount:</span>
            <div className="flex items-center gap-1">
              <span className="text-neutral-500 font-mono">-</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={invoice.discountAmount}
                onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                className="w-24 bg-[#141414] border border-[#262626] text-right text-xs text-neutral-200 font-mono font-medium rounded px-2 py-0.5 tabular-nums focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Service Charge / Handling:</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={invoice.shippingOrTipAmount}
              onChange={(e) => handleTipShippingChange(parseFloat(e.target.value) || 0)}
              className="w-24 bg-[#141414] border border-[#262626] text-right text-xs text-neutral-200 font-mono font-medium rounded px-2 py-0.5 tabular-nums focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div className="pt-2.5 border-t border-[#1f1f1f] flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-200 text-sm">Net Invoice Total:</span>
            <span className="font-mono font-bold text-base text-white tabular-nums">
              {sym} {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Center Buttons */}
      <div className="pt-3.5 border-t border-[#1f1f1f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onShowQrCode}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-200 text-xs font-medium rounded-lg border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] cursor-pointer"
            title="Generate scannable QR code for instant customer payment"
          >
            <QrCode className="w-3.5 h-3.5 text-neutral-400" />
            <span>UPI / PayPal QR Code</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-300 hover:text-white text-xs font-medium rounded-lg border border-[#262626] hover:border-neutral-700 transition active:scale-[0.98] cursor-pointer"
            title="Inspect PayPal Invoicing v2 Request Payload"
          >
            <FileJson className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Inspect JSON</span>
          </button>
        </div>

        {/* Primary Action Button: Clean Solid White with Black Text */}
        <button
          onClick={onSendPayPalInvoice}
          disabled={isSendingPayPal}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5 text-black" />
          <span>{isSendingPayPal ? 'Calling PayPal API...' : 'Issue PayPal India Invoice'}</span>
          <kbd className="hidden sm:inline font-mono text-[10px] text-neutral-700 bg-neutral-200 px-1.5 py-0.5 rounded ml-1 font-bold">
            Shift + ↵
          </kbd>
        </button>
      </div>
    </div>
  );
};
