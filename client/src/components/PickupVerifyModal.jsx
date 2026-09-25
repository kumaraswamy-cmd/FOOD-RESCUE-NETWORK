import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function PickupVerifyModal({ isOpen, onClose, onVerify, donation }) {
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !donation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter the full 4-digit pickup OTP provided by the Donor.');
      return;
    }
    setErrorMsg('');
    onVerify(otpCode);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0D1E36] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-navy-700 relative text-slate-900 dark:text-white">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 border border-amber-300 dark:border-amber-800 shadow-inner">
            <KeyRound className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">4-Digit Pickup OTP Verification</h3>
          <p className="text-slate-500 dark:text-slate-300 text-xs font-medium mt-1">
            Request the 4-digit pickup code from <strong>{donation.donor_name || 'Food Donor'}</strong> to confirm food handoff.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#0A1628] rounded-2xl border border-slate-200 dark:border-navy-800 mb-5">
          <div className="text-xs font-black text-slate-900 dark:text-white">{donation.food_type}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {donation.quantity} Servings &bull; {donation.pickup_address}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-2 text-center">
              Enter 4-Digit Pickup Code
            </label>
            <input 
              type="text" 
              maxLength={4} 
              value={otpCode} 
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
              placeholder="e.g. 7429" 
              className="w-full p-4 rounded-2xl text-center text-3xl font-black font-mono tracking-widest bg-slate-50 dark:bg-[#0A1628] border-2 border-amber-400/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" 
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-1/3 py-3 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-2xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-2/3 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Confirm Pickup</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
