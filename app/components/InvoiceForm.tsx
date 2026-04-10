'use client';

import React, { useRef, useState } from 'react';
import { InvoiceData, LineItem } from '../types/invoice';
import { calculateItemAmount, generateId } from '../lib/calculations';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

// Convert YYYY-MM-DD (from <input type="date">) → DD.M.YYYY
function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

// Convert DD.M.YYYY / DD-M-YYYY / DD/M/YYYY → YYYY-MM-DD
function displayToIso(display: string): string {
  if (!display) return '';
  const parts = display.split(/[.\-\/]/);
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const SectionHeader = ({ title, icon, rightElement }: { title: string; icon: string; rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
    <div className="flex items-center flex-1 gap-3">
      <div className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <span className="text-[20px]">{icon}</span>
      </div>
      <h2 className="text-[15px] font-bold text-slate-100 tracking-[0.14em] uppercase m-0 leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {title}
      </h2>
      <div className="hidden sm:block flex-1 h-[2px] bg-gradient-to-r from-indigo-500/40 via-indigo-500/5 to-transparent ml-4 rounded-full"></div>
    </div>
    {rightElement && (
      <div className="pl-4">
        {rightElement}
      </div>
    )}
  </div>
);

const EditButton = ({ isEditing, onClick }: { isEditing: boolean; onClick: () => void }) => (
  <button 
    className={`px-4 py-2 text-[13.5px] font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:-translate-y-0.5 whitespace-nowrap ${
      isEditing 
        ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/40 hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:text-emerald-300' 
        : 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-indigo-300 hover:border-indigo-500/50 hover:shadow-[0_4px_12px_rgba(99,102,241,0.15)] hover:text-indigo-200'
    }`}
    onClick={onClick}
  >
    {isEditing ? (
      <>
        <span className="text-base leading-none">💾</span> Save Setup
      </>
    ) : (
      <>
        <span className="text-base leading-none">✏️</span> Edit Details
      </>
    )}
  </button>
);


export default function InvoiceForm({ data, onChange }: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isCompanyEdit, setIsCompanyEdit] = useState(false);
  const [isBankEdit, setIsBankEdit] = useState(false);
  const update = (path: string, value: unknown) => {
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(data)) as InvoiceData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = newData;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const addItem = () => {
    const newItem: LineItem = { id: generateId(), description: '', hsnCode: '', quantity: 1, unit: 'mtr', rate: 0, amount: 0 };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const items = data.items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.amount = calculateItemAmount(
          field === 'quantity' ? value : item.quantity,
          field === 'rate' ? value : item.rate
        );
      }
      return updated;
    });
    onChange({ ...data, items });
  };

  const inp = "form-input";
  const lbl = "form-label";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Company Details */}
      <div className="glass-card relative">
        <SectionHeader 
          title="Company Details" 
          icon="🏢" 
          rightElement={<EditButton isEditing={isCompanyEdit} onClick={() => setIsCompanyEdit(!isCompanyEdit)} />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-5 sm:gap-x-6">
          <div>
            <label className={lbl}>Company Name</label>
            <input 
              className={inp} 
              value={data.company.name} 
              onChange={e => update('company.name', e.target.value)} 
              placeholder="VEL TEX" 
              readOnly={!isCompanyEdit}
              style={{ opacity: isCompanyEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>GSTIN</label>
            <input 
              className={inp} 
              value={data.company.gstin} 
              onChange={e => update('company.gstin', e.target.value)} 
              placeholder="33ANQPS5104A1ZA"
              readOnly={!isCompanyEdit}
              style={{ opacity: isCompanyEdit ? 1 : 0.65 }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={lbl}>Address</label>
            <textarea 
              className={inp} 
              rows={2} 
              value={data.company.address} 
              onChange={e => update('company.address', e.target.value)} 
              placeholder="Street, City, PIN"
              readOnly={!isCompanyEdit}
              style={{ opacity: isCompanyEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>Phone 1</label>
            <input 
              className={inp} 
              value={data.company.phone1} 
              onChange={e => update('company.phone1', e.target.value)} 
              placeholder="9940045045"
              readOnly={!isCompanyEdit}
              style={{ opacity: isCompanyEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>Phone 2</label>
            <input 
              className={inp} 
              value={data.company.phone2} 
              onChange={e => update('company.phone2', e.target.value)} 
              placeholder="9382883116"
              readOnly={!isCompanyEdit}
              style={{ opacity: isCompanyEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>Authorized Signatory</label>
            <input 
              className={inp} 
              value={data.company.signatory} 
              onChange={e => update('company.signatory', e.target.value)} 
              placeholder="For Vel Tex"
              readOnly={!isCompanyEdit}
              style={{ opacity: isCompanyEdit ? 1 : 0.65 }}
            />
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="glass-card">
        <SectionHeader title="Invoice Details" icon="📋" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-5 sm:gap-x-6">
          <div>
            <label className={lbl}>Invoice Number</label>
            <input className={inp} value={data.invoiceNumber} onChange={e => update('invoiceNumber', e.target.value)} placeholder="351" />
          </div>
          <div>
            <label className={lbl}>Date</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* Visible text input — user can also type manually */}
              <input
                className={inp}
                value={data.date}
                onChange={e => update('date', e.target.value)}
                placeholder="DD.M.YYYY"
                style={{ paddingRight: '42px' }}
              />
              {/* Calendar icon — visible button */}
              <span style={{
                position: 'absolute', right: '11px',
                fontSize: '17px', pointerEvents: 'none', zIndex: 2,
                color: '#6366f1', lineHeight: 1,
              }}>📅</span>
              {/* Invisible native date input overlaid on the icon area */}
              <input
                ref={dateInputRef}
                type="date"
                tabIndex={-1}
                onChange={e => { if (e.target.value) update('date', isoToDisplay(e.target.value)); }}
                style={{
                  position: 'absolute', right: 0, top: 0,
                  width: '42px', height: '100%',
                  opacity: 0, cursor: 'pointer', zIndex: 3,
                }}
                onFocus={() => {
                  const iso = displayToIso(data.date);
                  if (iso && dateInputRef.current) dateInputRef.current.value = iso;
                }}
              />
            </div>
          </div>
          <div>
            <label className={lbl}>Purchase Order No.</label>
            <input className={inp} value={data.purchaseOrderNo} onChange={e => update('purchaseOrderNo', e.target.value)} placeholder="PO-001" />
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label className={lbl}>Place of Supply</label>
            <input className={inp} value={data.placeOfSupply} onChange={e => update('placeOfSupply', e.target.value)} placeholder="Tamil Nadu" />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="glass-card">
        <SectionHeader title="Bill To" icon="👤" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-5 sm:gap-x-6">
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={lbl}>Client Name</label>
            <input className={inp} value={data.billTo.name} onChange={e => update('billTo.name', e.target.value)} placeholder="YOUNG CREATIONS," />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={lbl}>Client Address</label>
            <textarea className={inp} rows={2} value={data.billTo.address} onChange={e => update('billTo.address', e.target.value)} placeholder="No. 54, Bunder street..." />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={lbl}>Client GSTIN</label>
            <input className={inp} value={data.billTo.gstin} onChange={e => update('billTo.gstin', e.target.value)} placeholder="33AEWPT2676R2Z7" />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="glass-card">
        <SectionHeader title="Line Items" icon="📦" />
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={item.id} className="item-card" style={{ padding: '20px' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="item-badge">Item #{index + 1}</span>
                {data.items.length > 1 && (
                  <button className="btn-danger" onClick={() => removeItem(item.id)}>✕ Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-y-[14px] gap-x-4 sm:gap-x-5">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className={lbl}>Description</label>
                  <input className={inp} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Description of Service" />
                </div>
                <div>
                  <label className={lbl}>HSN Code</label>
                  <input className={inp} value={item.hsnCode} onChange={e => updateItem(item.id, 'hsnCode', e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className={lbl}>Unit</label>
                  <input className={inp} value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} placeholder="mtr / nos / kg" />
                </div>
                <div>
                  <label className={lbl}>Quantity</label>
                  <input type="number" className={inp} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} min="0" step="any" />
                </div>
                <div>
                  <label className={lbl}>Rate (₹)</label>
                  <input type="number" className={inp} value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} min="0" step="any" />
                </div>
              </div>
              <div className="flex justify-end">
                <div className="item-amount-box">
                  <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Amount</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#a7f3d0', fontVariantNumeric: 'tabular-nums' }}>₹{item.amount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
          <button className="add-item-btn" onClick={addItem}>
            <span style={{ fontSize: '20px', lineHeight: 1 }}>＋</span> Add Line Item
          </button>
        </div>
      </div>

      {/* Discount & GST */}
      <div className="glass-card">
        <SectionHeader title="Discount & GST Configuration" icon="🧾" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-5 sm:gap-x-6">
          <div>
            <label className={lbl}>Discount %</label>
            <input type="number" className={inp} value={data.discountPercent ?? ''} onChange={e => update('discountPercent', e.target.value)} min="0" max="100" step="0.5" />
          </div>
          <div>
            <label className={lbl}>CGST %</label>
            <input type="number" className={inp} value={data.cgstPercent} onChange={e => update('cgstPercent', e.target.value)} min="0" max="100" step="0.5" />
          </div>
          <div>
            <label className={lbl}>SGST %</label>
            <input type="number" className={inp} value={data.sgstPercent} onChange={e => update('sgstPercent', e.target.value)} min="0" max="100" step="0.5" />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="glass-card relative">
        <SectionHeader 
          title="Bank Details" 
          icon="🏦" 
          rightElement={<EditButton isEditing={isBankEdit} onClick={() => setIsBankEdit(!isBankEdit)} />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-5 sm:gap-x-6">
          <div>
            <label className={lbl}>Bank Name</label>
            <input 
              className={inp} 
              value={data.bankDetails.bankName} 
              onChange={e => update('bankDetails.bankName', e.target.value)} 
              placeholder="Indian Bank" 
              readOnly={!isBankEdit}
              style={{ opacity: isBankEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>Account No.</label>
            <input 
              className={inp} 
              value={data.bankDetails.accountNo} 
              onChange={e => update('bankDetails.accountNo', e.target.value)} 
              placeholder="123456789" 
              readOnly={!isBankEdit}
              style={{ opacity: isBankEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>IFSC Code</label>
            <input 
              className={inp} 
              value={data.bankDetails.ifscCode} 
              onChange={e => update('bankDetails.ifscCode', e.target.value)} 
              placeholder="IDIB000C001" 
              readOnly={!isBankEdit}
              style={{ opacity: isBankEdit ? 1 : 0.65 }}
            />
          </div>
          <div>
            <label className={lbl}>Branch</label>
            <input 
              className={inp} 
              value={data.bankDetails.branch} 
              onChange={e => update('bankDetails.branch', e.target.value)} 
              placeholder="Chennai Branch" 
              readOnly={!isBankEdit}
              style={{ opacity: isBankEdit ? 1 : 0.65 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
