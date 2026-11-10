import { InvoiceData } from '../types/invoice';

/**
 * Builds standard PayPal Invoicing API v2 request body
 * https://developer.paypal.com/docs/api/invoicing/v2/
 */
export function buildPayPalInvoiceV2Payload(invoice: InvoiceData, merchantEmail?: string) {
  const currency = invoice.currency || 'INR';

  return {
    detail: {
      invoice_number: invoice.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      reference: `VENDORBOT-${Date.now().toString().slice(-6)}`,
      invoice_date: invoice.invoiceDate || new Date().toISOString().split('T')[0],
      currency_code: currency,
      note: invoice.notes || 'Audited and verified with Vendor AI for PayPal India. Section 31 CGST Act compliant.',
      term_type: 'DUE_ON_RECEIPT',
      payment_term: {
        term_type: 'DUE_ON_RECEIPT'
      }
    },
    invoicer: {
      name: {
        given_name: invoice.vendor.name || 'Merchant Business'
      },
      email_address: merchantEmail || invoice.vendor.email || 'accounts.india@merchant.in',
      website: invoice.vendor.website || undefined,
      tax_id: invoice.vendor.taxId || undefined
    },
    primary_recipients: [
      {
        billing_info: {
          name: {
            given_name: invoice.customer.name || 'Accounts Payable Team'
          },
          email_address: invoice.customer.email || 'finance@customer.in'
        }
      }
    ],
    items: invoice.items.map((item) => ({
      name: item.name,
      description: item.hsnSacCode ? `[HSN: ${item.hsnSacCode}] ${item.description || item.name}` : (item.description || item.name),
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: currency,
        value: item.unitPrice.toFixed(2)
      },
      tax: item.taxRate ? {
        name: 'GST',
        percent: item.taxRate.toFixed(2)
      } : undefined
    })),
    amount: {
      currency_code: currency,
      value: invoice.grandTotal.toFixed(2),
      breakdown: {
        item_total: {
          currency_code: currency,
          value: invoice.subtotal.toFixed(2)
        },
        tax_total: invoice.taxAmount > 0 ? {
          currency_code: currency,
          value: invoice.taxAmount.toFixed(2)
        } : undefined,
        discount: invoice.discountAmount > 0 ? {
          invoice_discount: {
            amount: {
              currency_code: currency,
              value: invoice.discountAmount.toFixed(2)
            }
          }
        } : undefined,
        shipping: invoice.shippingOrTipAmount > 0 ? {
          amount: {
            currency_code: currency,
            value: invoice.shippingOrTipAmount.toFixed(2)
          }
        } : undefined
      }
    },
    configuration: {
      allow_tip: true,
      tax_calculated_after_discount: true,
      tax_inclusive: false
    }
  };
}
