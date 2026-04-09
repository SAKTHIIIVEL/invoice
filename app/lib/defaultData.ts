import { InvoiceData } from '../types/invoice';
import { generateId } from './calculations';

export const defaultInvoiceData: InvoiceData = {
  invoiceNumber: '351',
  date: '30.3.2026',
  purchaseOrderNo: '',
  billTo: {
    name: 'YOUNG CREATIONS,',
    address: 'No. 54, Bunder street, 1st Floor,\nChennai-600 001.',
    gstin: '33AEWPT2676R2Z7',
  },
  placeOfSupply: '',
  items: [
    {
      id: generateId(),
      description: 'SLE DARK GREY',
      hsnCode: '',
      quantity: 210,
      unit: 'mtr',
      rate: 70,
      amount: 14700,
    },
    {
      id: generateId(),
      description: 'SRE DARK GREY',
      hsnCode: '',
      quantity: 460,
      unit: 'mtr',
      rate: 70,
      amount: 32200,
    },
  ],
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  company: {
    name: 'VEL TEX',
    address: '10, New Manickam Street,\nPurasawalkam, Chennai-600 007.',
    city: 'Chennai',
    phone1: '9940045045',
    phone2: '9003111944',
    gstin: '33ANQPS5104A1ZA',
    signatory: 'Vel Tex',
  },
  bankDetails: {
    bankName: 'Karur Vysya Bank',
    accountNo: '1153115000022045',
    ifscCode: 'KVBL0001153',
    branch: 'Main Branch',
  },
};
