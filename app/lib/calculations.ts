import { LineItem, InvoiceTotals } from '../types/invoice';

export function calculateItemAmount(quantity: number | string, rate: number | string): number {
  const qty = parseFloat(String(quantity)) || 0;
  const r = parseFloat(String(rate)) || 0;
  return parseFloat((qty * r).toFixed(2));
}

export function calculateTotals(
  items: LineItem[],
  cgstPercent: number | string,
  sgstPercent: number | string,
  discountPercent?: number | string
): InvoiceTotals {
  const grossTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountPct = parseFloat(String(discountPercent)) || 0;
  const discountAmount = parseFloat(((grossTotal * discountPct) / 100).toFixed(2));
  const subtotal = parseFloat((grossTotal - discountAmount).toFixed(2)); // Taxable Value
  
  const cgst = parseFloat(String(cgstPercent)) || 0;
  const sgst = parseFloat(String(sgstPercent)) || 0;
  const cgstAmount = parseFloat(((subtotal * cgst) / 100).toFixed(2));
  const sgstAmount = parseFloat(((subtotal * sgst) / 100).toFixed(2));
  const grandTotal = parseFloat((subtotal + cgstAmount + sgstAmount).toFixed(2));
  return { grossTotal, discountAmount, subtotal, cgstAmount, sgstAmount, grandTotal };
}

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertHundreds(n % 100) : '');
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees only';
  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  let result = '';
  let remaining = intPart;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundred = remaining;

  if (crore) result += convertHundreds(crore) + ' Crore ';
  if (lakh) result += convertHundreds(lakh) + ' Lakh ';
  if (thousand) result += convertHundreds(thousand) + ' Thousand ';
  if (hundred) result += convertHundreds(hundred);

  result = result.trim();
  result += ' Rupees';
  if (decPart) result += ' and ' + convertHundreds(decPart) + ' Paise';
  result += ' only';

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
