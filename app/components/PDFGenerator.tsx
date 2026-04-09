'use client';

import React, { useState } from 'react';
import { InvoiceData } from '../types/invoice';

interface Props {
  invoiceRef: React.RefObject<HTMLDivElement | null>;
  data: InvoiceData;
}

export default function PDFGenerator({ invoiceRef, data }: Props) {
  const [loading, setLoading]   = useState(false);
  const [printing, setPrinting] = useState(false);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF }   = await import('jspdf');

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, 
        useCORS: true, 
        backgroundColor: '#ffffff', 
        logging: false,
        windowWidth: 1024 // Forces desktop viewport calculation, preventing mobile layout compression
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgW  = pageW - margin * 2;
      const imgH  = (canvas.height * imgW) / canvas.width;

      let y = margin, remaining = imgH;
      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH - margin * 2);
        pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH, '', 'FAST');
        remaining -= sliceH;
        if (remaining > 0) { pdf.addPage(); y = -(imgH - sliceH - margin); }
      }

      const filename = `Invoice_${data.invoiceNumber || 'draft'}_${
        data.billTo.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 200);
  };

  return (
    <div className="actions-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))',
          border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>⚡</div>
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '12px',
          color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Actions</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(139,92,246,0.4), transparent)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Download PDF */}
        <button
          className="btn-primary w-full justify-center"
          onClick={downloadPDF}
          disabled={loading}
          id="download-pdf-btn"
          style={{ fontSize: '14px', padding: '13px 20px' }}
        >
          {loading ? (
            <>
              <span style={{
                width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.7s linear infinite',
              }} />
              Generating PDF…
            </>
          ) : (
            <><span>📄</span> Download Invoice PDF</>
          )}
        </button>

        {/* Print */}
        <button
          className="btn-outline w-full justify-center"
          onClick={handlePrint}
          disabled={printing}
          id="print-btn"
          style={{ fontSize: '14px', padding: '12px 20px' }}
        >
          {printing ? '⏳ Preparing…' : <><span>🖨️</span> Print Invoice</>}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
