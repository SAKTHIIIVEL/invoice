export interface LineItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number | string;
  unit: string;
  rate: number | string;
  amount: number;
}

export interface BillTo {
  name: string;
  address: string;
  gstin: string;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  city: string;
  phone1: string;
  phone2: string;
  gstin: string;
  signatory: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  purchaseOrderNo: string;
  billTo: BillTo;
  placeOfSupply: string;
  items: LineItem[];
  discountPercent?: number | string;
  cgstPercent: number | string;
  sgstPercent: number | string;
  company: CompanyDetails;
  bankDetails: BankDetails;
}

export interface InvoiceTotals {
  grossTotal: number;
  discountAmount: number;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
}
