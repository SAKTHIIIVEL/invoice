'use client';

import React from 'react';
import { InvoiceData } from '../types/invoice';
import { calculateTotals, numberToWords, formatCurrency } from '../lib/calculations';

interface Props {
  data: InvoiceData;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
}

const ROW_H = '28px';
const CELL_PAD = '7px 11px';
const BORDER = '1px solid #d1d5db';
const FONT_BASE = '12px';
const FONT_SMALL = '10.5px';
const FONT_LABEL = '9.5px';
const HEADER_STYLE: React.CSSProperties = {
  fontSize: FONT_LABEL, fontWeight: 700, color: '#000000ff',
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px',
};

export default function InvoicePreview({ data, forwardedRef }: Props) {
  const totals        = calculateTotals(data.items, data.cgstPercent, data.sgstPercent, data.discountPercent);
  const amountInWords = numberToWords(totals.grandTotal);
  const cgstPct       = parseFloat(String(data.cgstPercent)) || 0;
  const sgstPct       = parseFloat(String(data.sgstPercent)) || 0;

  // Pad items so invoice fills the A4 page
  const minRows    = 13;
  const paddingRows = Math.max(0, minRows - data.items.length);

  return (
    <div
      ref={forwardedRef}
      className="invoice-wrapper"
      style={{ width: '100%', maxWidth: '750px', margin: '0 auto', fontSize: FONT_BASE, display: 'flex', flexDirection: 'column', minHeight: '980px' }}
    >
      <div
        className="invoice-outer-border"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '960px' }}
      >
        {/* Title */}
        <div className="invoice-title">INVOICE</div>

        {/* Company Header */}
        <div className="invoice-company-section">
          <div style={{ zIndex: 1, position: 'relative', flex: '1 1 0' }}>
            <div className="invoice-company-name">{data.company.name}</div>
            <div className="invoice-company-address" style={{ whiteSpace: 'pre-line' }}>{data.company.address}</div>
            <div className="invoice-company-cell">Cell: {data.company.phone1} / {data.company.phone2}</div>
          </div>
          {/* Diagonal gold bar */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '98px', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', right: '-8px', top: 0, bottom: 0, width: '98px', background: 'linear-gradient(180deg, #e8c86a 0%, #d4a843 55%, #b8942c 100%)', transform: 'skewX(-20deg)', transformOrigin: 'bottom right' }} />
          </div>
          <div style={{ zIndex: 1, position: 'relative', textAlign: 'right', flexShrink: 0 }}>
            <div className="invoice-gstin-badge">GSTIN: {data.company.gstin}</div>
          </div>
        </div>

        {/* ── Bill To / Place of Supply / Invoice No / Dated  (combined label+value) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 65px 95px', borderBottom: BORDER }}>

          {/* Bill To */}
          <div style={{ padding: CELL_PAD, borderRight: BORDER, fontSize: FONT_BASE, minHeight: '78px' }}>
            <div style={HEADER_STYLE}>Bill to</div>
            <div style={{ fontWeight: 700 }}>{data.billTo.name}</div>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}>{data.billTo.address}</div>
          </div>

          {/* Place of Supply + PO */}
          <div style={{ padding: CELL_PAD, borderRight: BORDER, fontSize: FONT_BASE }}>
            <div style={HEADER_STYLE}>Place of Supply</div>
            <div style={{ fontWeight: 500 }}>{data.placeOfSupply}</div>
            <div style={{ fontWeight: 700, marginTop: '8px' }}>Purchase Order No:</div>
            <div>{data.purchaseOrderNo}</div>
          </div>

          {/* Invoice No */}
          <div style={{ padding: CELL_PAD, borderRight: BORDER, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ ...HEADER_STYLE, textAlign: 'center', marginBottom: 0 }}>INVOICE<br />No</div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{data.invoiceNumber}</div>
          </div>

          {/* Dated */}
          <div style={{ padding: '7px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ ...HEADER_STYLE, textAlign: 'center', marginBottom: 0 }}>Dated</div>
            <div style={{ fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap' }}>{data.date}</div>
          </div>
        </div>

        {/* GST Tin row */}
        <div style={{ borderBottom: BORDER, padding: '6px 11px 6px 11px', fontSize: FONT_BASE }}>
          <span style={{ fontWeight: 600 }}>GST Tin No:-</span>&nbsp;&nbsp;{data.billTo.gstin}
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="col-desc">Description of Service</th>
              <th className="col-hsn" style={{ textAlign: 'center' }}>HSN<br />CODE</th>
              <th className="col-qty" style={{ textAlign: 'center' }}>QTY</th>
              <th className="col-unit" style={{ textAlign: 'center' }}>Units<br />in mtr</th>
              <th className="col-rate" style={{ textAlign: 'right' }}>RATE</th>
              <th className="col-amount" style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => {
              const hasNoRate = !item.rate || Number(item.rate) === 0 || isNaN(Number(item.rate));
              const hasNoAmount = !item.amount || Number(item.amount) === 0 || isNaN(Number(item.amount));
              const hasNoUnit = !item.unit || item.unit.trim() === '';
              
              // If unit, rate, and amount are all blank/zero, treat it as a bold header/note.
              const isHeaderDesc = hasNoUnit && hasNoRate && hasNoAmount;
              
              // We also hide qty if it's 0 or empty so we don't display a random 0.
              const renderQty = (!item.quantity || Number(item.quantity) === 0) ? '' : item.quantity;
              
              return (
                <tr key={item.id}>
                  <td className="col-desc" style={{ fontWeight: isHeaderDesc ? 700 : 400 }}>{item.description}</td>
                  <td className="col-hsn" style={{ textAlign: 'center' }}>{item.hsnCode}</td>
                  <td className="col-qty" style={{ textAlign: 'center' }}>{isHeaderDesc ? '' : renderQty}</td>
                  <td className="col-unit" style={{ textAlign: 'center' }}>{item.unit}</td>
                  <td className="col-rate" style={{ textAlign: 'right' }}>{hasNoRate ? '' : parseFloat(String(item.rate)).toFixed(2)}</td>
                  <td className="col-amount" style={{ textAlign: 'right' }}>{hasNoAmount ? '' : formatCurrency(item.amount)}</td>
                </tr>
              );
            })}
            {/* Padding rows */}
            {Array.from({ length: paddingRows }).map((_, i) => (
              <tr key={`pad-${i}`} style={{ height: ROW_H }}>
                <td className="col-desc">&nbsp;</td>
                <td className="col-hsn"></td>
                <td className="col-qty"></td>
                <td className="col-unit"></td>
                <td className="col-rate"></td>
                <td className="col-amount"></td>
              </tr>
            ))}

            {/* Discount rows (Optional) */}
            {totals.discountAmount > 0 ? (
              <>
                <tr className="invoice-total-row" style={{ borderTop: '2px solid #374151' }}>
                  <td className="col-desc" style={{ fontWeight: 600 }}>Gross Total</td>
                  <td className="col-hsn"></td><td className="col-qty"></td><td className="col-unit"></td><td className="col-rate"></td>
                  <td className="col-amount" style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totals.grossTotal)}</td>
                </tr>
                <tr>
                  <td className="col-desc" style={{ fontWeight: 500, color: '#dc2626' }}>Less: Discount {parseFloat(String(data.discountPercent))}%</td>
                  <td className="col-hsn"></td><td className="col-qty"></td><td className="col-unit"></td><td className="col-rate"></td>
                  <td className="col-amount" style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(totals.discountAmount)}</td>
                </tr>
                <tr className="invoice-total-row">
                  <td className="col-desc" style={{ fontWeight: 700 }}>
                    <div>Total</div>
                    <div style={{ fontWeight: 400, fontSize: '10px', color: '#555' }}>Taxable Value</div>
                  </td>
                  <td className="col-hsn"></td><td className="col-qty"></td><td className="col-unit"></td><td className="col-rate"></td>
                  <td className="col-amount" style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(totals.subtotal)}</td>
                </tr>
              </>
            ) : (
              <tr className="invoice-total-row" style={{ borderTop: '2px solid #374151' }}>
                <td className="col-desc" style={{ fontWeight: 700 }}>
                  <div>Total</div>
                  <div style={{ fontWeight: 400, fontSize: '10px', color: '#555' }}>Taxable Value</div>
                </td>
                <td className="col-hsn"></td><td className="col-qty"></td><td className="col-unit"></td><td className="col-rate"></td>
                <td className="col-amount" style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(totals.subtotal)}</td>
              </tr>
            )}

            {cgstPct > 0 && (
              <tr>
                <td className="col-desc" style={{ fontWeight: 500 }}>CGST {cgstPct}%</td>
                <td className="col-hsn"></td><td className="col-qty"></td><td className="col-unit"></td><td className="col-rate"></td>
                <td className="col-amount" style={{ textAlign: 'right' }}>{formatCurrency(totals.cgstAmount)}</td>
              </tr>
            )}

            {sgstPct > 0 && (
              <tr>
                <td className="col-desc" style={{ fontWeight: 500 }}>SGST {sgstPct}%</td>
                <td className="col-hsn"></td><td className="col-qty"></td><td className="col-unit"></td><td className="col-rate"></td>
                <td className="col-amount" style={{ textAlign: 'right' }}>{formatCurrency(totals.sgstAmount)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Grand Total */}
        <div style={{ borderTop: '2px solid #374151', display: 'grid', gridTemplateColumns: '1fr 160px', borderBottom: BORDER }}>
          <div style={{ padding: '7px 11px', borderRight: BORDER, fontWeight: 700, fontSize: '13px' }}>Total</div>
          <div style={{ padding: '7px 11px', fontWeight: 700, fontSize: '14px', textAlign: 'right' }}>{formatCurrency(totals.grandTotal)}</div>
        </div>

        {/* Amount in Words */}
        <div style={{ borderBottom: BORDER, padding: '6px 11px' }}>
          <div style={{ fontSize: FONT_SMALL, color: '#555', marginBottom: '2px' }}>Amount Chargeable (in words)</div>
          <div style={{ fontSize: '11px', fontStyle: 'italic' }}>{amountInWords}</div>
        </div>

        {/* Bank Details + Signature — flex:1 fills remaining space */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', flex: 1, minHeight: '90px' }}>
          <div style={{ padding: '10px 11px', fontSize: FONT_BASE, borderRight: BORDER }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Bank Details</div>
            <table style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '2px 0', width: '80px', color: '#555' }}>Bank Name:</td>
                  <td style={{ fontWeight: 600 }}>{data.bankDetails.bankName}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#555' }}>A/c No:</td>
                  <td style={{ fontWeight: 600 }}>{data.bankDetails.accountNo}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#555' }}>IFSC Code:</td>
                  <td style={{ fontWeight: 600 }}>{data.bankDetails.ifscCode}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: '#555' }}>Branch:</td>
                  <td style={{ fontWeight: 600 }}>{data.bankDetails.branch}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 11px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>For {data.company.signatory}</div>
            <div style={{ fontSize: FONT_SMALL, textAlign: 'right', width: '100%' }}>
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
