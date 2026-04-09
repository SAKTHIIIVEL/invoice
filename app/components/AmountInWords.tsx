'use client';

import React from 'react';
import { numberToWords } from '../lib/calculations';

interface Props { amount: number; }

export default function AmountInWords({ amount }: Props) {
  const words = numberToWords(amount);
  return (
    <div className="amount-words-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.15))',
          border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>📝</div>
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '12px',
          color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Amount in Words</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(16,185,129,0.4), transparent)' }} />
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
        border: '1px solid rgba(16,185,129,0.22)',
        borderRadius: '12px',
        padding: '14px 16px',
        textAlign: 'center',
        boxShadow: 'inset 0 1px 0 rgba(16,185,129,0.1)',
      }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#6ee7b7',
          lineHeight: 1.6,
          fontStyle: 'italic',
          margin: 0,
        }}>
          &ldquo;{words}&rdquo;
        </p>
      </div>
    </div>
  );
}
