import React, { useState } from 'react';

export default function FssaiModal({ isOpen, onClose, onConfirm, donationTitle }) {
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(true);
  const [c3, setC3] = useState(true);
  const [c4, setC4] = useState(true);

  if (!isOpen) return null;

  const allChecked = c1 && c2 && c3 && c4;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-extrabold text-emerald-950 mb-2">📋 FSSAI Food Safety Audit</h3>
        <p className="text-sm text-gray-600 mb-4">
          Statutory 4-point verification required under FSSAI Redistribution Guidelines for <strong>{donationTitle}</strong>.
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={c1} onChange={(e) => setC1(e.target.checked)} className="mt-0.5 accent-emerald-600 w-4 h-4" />
            <span><strong>Sensory Inspection:</strong> Normal smell, appearance, and texture with zero spoilage.</span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={c2} onChange={(e) => setC2(e.target.checked)} className="mt-0.5 accent-emerald-600 w-4 h-4" />
            <span><strong>Cooked Time Window:</strong> Prepared within last 4 hours and within active freshness timer.</span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={c3} onChange={(e) => setC3(e.target.checked)} className="mt-0.5 accent-emerald-600 w-4 h-4" />
            <span><strong>Hygiene & Container:</strong> Covered stainless steel or sealed food-grade packaging.</span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold cursor-pointer">
            <input type="checkbox" checked={c4} onChange={(e) => setC4(e.target.checked)} className="mt-0.5 accent-emerald-600 w-4 h-4" />
            <span><strong>Transit Plan:</strong> Safe logistics arranged to deliver to shelter within 60 minutes.</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button 
            disabled={!allChecked} 
            onClick={onConfirm} 
            className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
          >
            ✓ Pass Audit & Accept
          </button>
        </div>
      </div>
    </div>
  );
}
