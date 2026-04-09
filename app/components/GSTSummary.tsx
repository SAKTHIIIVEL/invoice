'use client';

import React from 'react';
import { InvoiceData } from '../types/invoice';
import { calculateTotals } from '../lib/calculations';

interface Props { data: InvoiceData; }

function fmt(n: number) {
  return '₹' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function GSTSummary({ data }: Props) {
  const totals = calculateTotals(data.items, data.cgstPercent, data.sgstPercent, data.discountPercent);
  const cgstPct = parseFloat(String(data.cgstPercent)) || 0;
  const sgstPct = parseFloat(String(data.sgstPercent)) || 0;

  const rows = [];
  if (totals.discountAmount > 0) {
    rows.push({ label: 'Gross Total', value: totals.grossTotal, grand: false });
    rows.push({ label: `Discount @ ${parseFloat(String(data.discountPercent))}%`, value: -totals.discountAmount, grand: false });
    rows.push({ label: 'Taxable Value', value: totals.subtotal, grand: false });
  } else {
    rows.push({ label: 'Subtotal (Taxable Value)', value: totals.subtotal, grand: false });
  }

  rows.push({ label: `CGST @ ${cgstPct}%`,        value: totals.cgstAmount, grand: false });
  rows.push({ label: `SGST @ ${sgstPct}%`,        value: totals.sgstAmount, grand: false });
  rows.push({ label: 'Grand Total',               value: totals.grandTotal, grand: true  });

  return (
    <div className="sidebar-gst-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
          border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>💰</div>
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '12px',
          color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Tax Summary</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(99,102,241,0.4), transparent)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {rows.map((row) => (
          <div key={row.label} className={row.grand ? 'gst-row gst-grand' : 'gst-row'}>
            <span className="gst-label">{row.label}</span>
            <span className="gst-value">{fmt(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
