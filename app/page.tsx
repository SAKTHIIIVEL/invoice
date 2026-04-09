'use client';

import React, { useRef, useState, useCallback } from 'react';
import InvoiceForm    from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import GSTSummary     from './components/GSTSummary';
import AmountInWords  from './components/AmountInWords';
import PDFGenerator   from './components/PDFGenerator';
import { InvoiceData } from './types/invoice';
import { calculateTotals, generateId } from './lib/calculations';
import { defaultInvoiceData } from './lib/defaultData';

type Tab = 'form' | 'preview';

const createEmptyInvoiceData = (): InvoiceData => ({
  invoiceNumber: '',
  date: '',
  purchaseOrderNo: '',
  billTo: { name: '', address: '', gstin: '' },
  placeOfSupply: 'Tamil Nadu',
  discountPercent: 0,
  items: [
    { id: generateId(), description: '', hsnCode: '', quantity: '', unit: 'mtr', rate: '', amount: 0 },
  ],
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  company:     defaultInvoiceData.company,
  bankDetails: defaultInvoiceData.bankDetails,
});

export default function HomePage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(createEmptyInvoiceData);
  const [activeTab, setActiveTab]     = useState<Tab>('form');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const visibleInvoiceRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [invoiceHeight, setInvoiceHeight] = useState<number>(980);

  React.useEffect(() => {
    if (!visibleInvoiceRef.current) return;
    const ro = new ResizeObserver(() => {
       if (visibleInvoiceRef.current) {
          setInvoiceHeight(visibleInvoiceRef.current.offsetHeight);
       }
    });
    ro.observe(visibleInvoiceRef.current);
    return () => ro.disconnect();
  }, [activeTab]);

  React.useEffect(() => {
    const handleResize = () => {
      // Use offsetWidth of a parent or exact math
      const screenW = window.innerWidth;
      // Provide a more generous bounding box, some mobile layouts might be 400px.
      // app-main pad: 28, card pad: 20 -> 48px. Let's use 50px buffer.
      if (screenW < 860) {
        const availableWidth = screenW - 50;
        const scale = availableWidth / 750;
        setPreviewScale(scale < 1 ? scale : 1);
      } else {
        // Desktop
        const availableWidth = screenW - 440; // Approx sidebar width + padding
        const scale = availableWidth / 750;
        setPreviewScale(scale < 1 ? scale : 1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totals = calculateTotals(invoiceData.items, invoiceData.cgstPercent, invoiceData.sgstPercent);

  const handleChange = useCallback((data: InvoiceData) => { setInvoiceData(data); }, []);

  const resetForm = () => {
    if (confirm('Reset all invoice data? This will clear all fields.')) {
      setInvoiceData(createEmptyInvoiceData());
    }
  };

  const stats = [
    { label: 'Items',       value: invoiceData.items.length,                           icon: '📦' },
    { label: 'Invoice No.', value: invoiceData.invoiceNumber || '—',                   icon: '🔢' },
    { label: 'Date',        value: invoiceData.date || '—',                            icon: '📅' },
    { label: 'Client',      value: (invoiceData.billTo.name || '—').slice(0, 18),      icon: '👤' },
  ];

  return (
    <div className="app-wrapper">

      {/* ── Header ── */}
      <header className="no-print app-header">
        <div className="app-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="app-logo-icon">📄</div>
            <div>
              <div className="app-logo-text">
                InvoiceGen{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Pro</span>
              </div>
              <div className="app-logo-sub">Professional Invoice Generator</div>
            </div>
          </div>

          <button onClick={resetForm} className="header-reset-btn no-print" id="reset-btn">
            🔄 Reset
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">

        {/* Tab Bar */}
        <div className="no-print tab-bar-wrapper">
          {(['form', 'preview'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'tab-btn-active' : ''}`}
              id={`tab-${tab}`}
            >
              {tab === 'form' ? '✏️ Edit Invoice' : '👁️ Preview & PDF'}
            </button>
          ))}
        </div>

        {/* Hint bar */}
        {activeTab === 'form' && (
          <div className="no-print hint-bar">
            <span>💡</span>
            Fill in your invoice details below — switch to <strong>Preview &amp; PDF</strong> to download.
          </div>
        )}

        {/* Two-column layout */}
        <div className={`main-layout-grid${activeTab === 'preview' ? ' preview-mode' : ''}`} style={{ alignItems: 'stretch' }}>

          {/* LEFT — Form or Preview */}
          <div style={activeTab === 'preview' ? { display: 'flex', flexDirection: 'column' } : {}}>
            {activeTab === 'form' ? (
              <div className="fade-in-up">
                <InvoiceForm data={invoiceData} onChange={handleChange} />
              </div>
            ) : (
              <div className="fade-in-up" style={{ height: '100%' }}>
                <div className="invoice-preview-card" style={{ padding: '0', boxSizing: 'border-box' }}>
                  <div className="invoice-mobile-scroll" style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    overflow: 'hidden',
                    background: '#e2e8f0', // Clean backdrop for scaling
                    padding: '16px 0',
                    borderRadius: '8px'
                  }}>
                    {/* The scaled wrapper exact bounds */}
                    <div style={{ 
                         width: `${750 * previewScale}px`, 
                         height: `${invoiceHeight * previewScale}px`,
                         position: 'relative',
                         transition: 'all 0.15s ease-out'
                    }}>
                      {/* The absolutely positioned unscaled content */}
                      <div 
                         ref={visibleInvoiceRef}
                         style={{ 
                            transform: `scale(${previewScale})`, 
                            transformOrigin: 'top left', 
                            width: '750px',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                         }}>
                        <InvoicePreview data={invoiceData} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="sidebar-panel no-print">
            <GSTSummary data={invoiceData} />
            <AmountInWords amount={totals.grandTotal} />
            <PDFGenerator invoiceRef={invoiceRef} data={invoiceData} />

            {/* Quick Stats */}
            <div className="stats-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0,
                }}>📊</div>
                <span style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '12px',
                  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em',
                }}>Quick Stats</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(148,163,184,0.25), transparent)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stats.map(s => (
                  <div key={s.label} className="stat-item">
                    <span className="stat-label"><span>{s.icon}</span>{s.label}</span>
                    <span className="stat-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview CTA */}
            {activeTab === 'form' && (
              <button
                onClick={() => setActiveTab('preview')}
                className="btn-primary w-full justify-center"
                style={{ fontSize: '14px' }}
                id="preview-btn"
              >
                👁️ Preview &amp; Download Invoice
              </button>
            )}
          </div>
        </div>

        {/* Hidden invoice for PDF capture */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '750px' }}>
          <div style={{ background: 'white', padding: '16px' }}>
            <InvoicePreview data={invoiceData} forwardedRef={invoiceRef} />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="no-print app-footer">
        <p>InvoiceGen Pro &bull; Built with Next.js &bull; All calculations are auto-generated</p>
      </footer>
    </div>
  );
}
