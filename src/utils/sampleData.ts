import { InvoiceData } from '../types/invoice';

export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  anomalySummary: string;
  imageUrl: string;
  data: InvoiceData;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'cafe-panama-mumbai',
    title: 'Café Panama',
    category: 'Artisanal Bistro & Dining · 5% GST',
    badge: '3 Critical Errors',
    description: 'Mumbai artisanal café dining bill with manual addition arithmetic bug and missing corporate GSTIN email.',
    anomalySummary: 'Arithmetic overcharge: items sum to ₹1,800.00, but written subtotal reads ₹2,100.00 (₹300 overcharge)! Missing PayPal recipient email.',
    imageUrl: '/src/assets/images/cafe_panama_receipt_1794154268921.jpg',
    data: {
      id: 'inv-sample-1',
      invoiceNumber: 'CP-2026-2478',
      invoiceDate: '2026-11-08',
      dueDate: '2026-11-08',
      currency: 'INR',
      placeOfSupply: '27-Maharashtra',
      vendor: {
        name: 'Café Panama',
        email: 'billing@cafepanama.in',
        phone: '+91 22 2345 6789',
        address: 'Todi Mills, Mathuradas Compound, Lower Parel, Mumbai, Maharashtra - 400013',
        taxId: '27AABCP1234F1Z0'
      },
      customer: {
        name: 'Corporate Team Dinner',
        email: '', // MISSING - triggers PayPal compliance check
        phone: '+91 98200 45678',
        companyName: 'Zepto Executive Team'
      },
      items: [
        { id: 'cp-1', name: 'Cafe Latte', quantity: 1, unitPrice: 240.00, total: 240.00, hsnSacCode: '996331' },
        { id: 'cp-2', name: 'Iced Hibiscus Tea', quantity: 1, unitPrice: 220.00, total: 220.00, hsnSacCode: '996331' },
        { id: 'cp-3', name: 'Smashed Avocado Toast', quantity: 1, unitPrice: 550.00, total: 550.00, hsnSacCode: '996331' },
        { id: 'cp-4', name: 'Peri Peri Fries', quantity: 1, unitPrice: 310.00, total: 310.00, hsnSacCode: '996331' },
        { id: 'cp-5', name: 'Chocolate Fondant', quantity: 1, unitPrice: 480.00, total: 480.00, hsnSacCode: '996331' }
      ],
      subtotal: 2100.00, // Error: Actual sum is 1,800.00 (₹300 overcharge)
      taxRate: 5.0,
      taxAmount: 105.00, // 5% on 2100 = 105.00
      discountAmount: 0,
      shippingOrTipAmount: 90.00, // Service Charge
      grandTotal: 2295.00, // Error: Actual should be 1,800 + 90 (tax) + 90 (svc) = 1,980.00
      originalStatedSubtotal: 2100.00,
      originalStatedTotal: 2295.00,
      notes: 'Table 12 Dine-In. Customer requested GST tax invoice for executive dining reimbursement.',
      auditScore: 52,
      confidenceScore: 96,
      auditStatus: 'flagged',
      issues: []
    }
  },
  {
    id: 'apex-hardware-duplicate',
    title: 'Apex IT Hardware Solutions Pvt Ltd',
    category: 'IT AMC & Enterprise Hardware · 18% GST',
    badge: 'Duplicate Line Item',
    description: 'Hardware maintenance work order with duplicate diagnostic labor charge and 18% GST discrepancy.',
    anomalySummary: 'Duplicate line item: "Server Diagnostic & Health Check" was invoiced twice (₹2,500 x 2).',
    imageUrl: '/src/assets/images/apex_hardware_invoice_1794154294033.jpg',
    data: {
      id: 'inv-sample-2',
      invoiceNumber: 'APX-BLR-4920',
      invoiceDate: '2026-11-07',
      dueDate: '2026-11-21',
      currency: 'INR',
      placeOfSupply: '29-Karnataka',
      vendor: {
        name: 'Apex IT Hardware Solutions Pvt Ltd',
        email: 'billing@apexhardware.in',
        phone: '+91 80 4112 8900',
        address: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka - 560066',
        taxId: '29AABCA5678G1Z2'
      },
      customer: {
        name: 'Rohan Deshmukh',
        email: 'rohan.it@tcs-partner.co.in',
        phone: '+91 99001 88220',
        companyName: 'TCS Partner Labs',
        gstin: '29AABCT1992M1ZK'
      },
      items: [
        { id: 'apx-1', name: 'Server Diagnostic & Health Check', quantity: 1, unitPrice: 2500.00, total: 2500.00, hsnSacCode: '998713' },
        { id: 'apx-2', name: '1TB NVMe Enterprise SSD Upgrade', quantity: 2, unitPrice: 8500.00, total: 17000.00, hsnSacCode: '847170' },
        { id: 'apx-3', name: 'Server Diagnostic & Health Check', quantity: 1, unitPrice: 2500.00, total: 2500.00, hsnSacCode: '998713' },
        { id: 'apx-4', name: 'Thermal Paste & Fan Servicing', quantity: 1, unitPrice: 1200.00, total: 1200.00, hsnSacCode: '998713' }
      ],
      subtotal: 23200.00,
      taxRate: 18.0,
      taxAmount: 4176.00,
      discountAmount: 0,
      shippingOrTipAmount: 0,
      grandTotal: 27376.00,
      originalStatedSubtotal: 23200.00,
      originalStatedTotal: 27376.00,
      notes: 'Diagnostic and NVMe upgrade for Dell PowerEdge R740. Payable via PayPal India Payouts.',
      auditScore: 68,
      confidenceScore: 97,
      auditStatus: 'flagged',
      issues: []
    }
  },
  {
    id: 'hyperscale-cloud-mumbai',
    title: 'HyperScale Cloud Consulting LLP',
    category: 'Enterprise SaaS Retainer · 18% IGST',
    badge: '100% Verified Ready',
    description: 'Corporate B2B retainer verified without errors. Cleared for programmatic PayPal India Payout.',
    anomalySummary: 'Perfect audit! Arithmetic balanced, 18% GST verified, PAN/GSTIN validated, ready for 1-click settlement.',
    imageUrl: '/src/assets/images/hyperscale_b2b_invoice_1794154310657.jpg',
    data: {
      id: 'inv-sample-3',
      invoiceNumber: 'HSC-MUM-2026-104',
      invoiceDate: '2026-11-08',
      dueDate: '2026-11-15',
      currency: 'INR',
      placeOfSupply: '27-Maharashtra',
      vendor: {
        name: 'HyperScale Cloud Consulting LLP',
        email: 'accounts@hyperscalecloud.in',
        phone: '+91 22 6123 9000',
        address: 'One BKC, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
        taxId: '27AAAFH9876K1Z4',
        panNumber: 'AAAFH9876K'
      },
      customer: {
        name: 'Pooja Iyer',
        email: 'pooja.finance@swiggy-labs.in',
        companyName: 'Swiggy Tech Labs India',
        phone: '+91 80 4991 7000',
        gstin: '29AAECS4910N1ZW'
      },
      items: [
        { id: 'hsc-1', name: 'Cloud Architecture & Security Sprint (Hrs)', quantity: 15, unitPrice: 4500.00, total: 67500.00, hsnSacCode: '998313' },
        { id: 'hsc-2', name: 'PayPal India Payout API Integration Audit', quantity: 1, unitPrice: 35000.00, total: 35000.00, hsnSacCode: '998314' },
        { id: 'hsc-3', name: 'Kubernetes Production Cluster Hardening', quantity: 1, unitPrice: 45000.00, total: 45000.00, hsnSacCode: '998313' }
      ],
      subtotal: 147500.00,
      taxRate: 18.0,
      taxAmount: 23895.00,
      discountAmount: 14750.00,
      shippingOrTipAmount: 0,
      grandTotal: 156645.00,
      originalStatedSubtotal: 147500.00,
      originalStatedTotal: 156645.00,
      notes: 'Deliverables completed for Sprint 42. Compliant with PayPal India Invoicing & Payouts.',
      terms: 'Payment due on receipt. Acceptable via PayPal India, NEFT/RTGS, or Corporate UPI.',
      auditScore: 100,
      confidenceScore: 99,
      auditStatus: 'verified',
      issues: []
    }
  }
];
