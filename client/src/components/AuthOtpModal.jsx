import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, X, CheckCircle2, AlertTriangle, KeyRound, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function AuthOtpModal({ isOpen, onClose, onVerifySuccess, email, phone, name, role, generatedOtp }) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // If user pasted a multi-digit string (e.g. 6 digits)
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < cleaned.length; i++) {
        newDigits[i] = cleaned[i];
      }
      setOtpDigits(newDigits);
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`auth-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const fullEnteredOtp = otpDigits.join('');

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (fullEnteredOtp.length < 4) {
      setErrorMsg('Please enter the 6-digit verification OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          code: fullEnteredOtp,
          role,
          name
        })
      });

      setLoading(false);

      if (data && data.success) {
        setSuccessMsg('✅ Identity Verified & Account Activated!');
        setTimeout(() => {
          onVerifySuccess(data.user || { name, email, phone, role, verified: true });
          onClose();
        }, 800);
      } else {
        setErrorMsg(data?.error || 'Invalid OTP verification code. Please check the code sent to your email.');
      }
    } catch (err) {
      setLoading(false);
      // Fallback verification check
      if (generatedOtp && fullEnteredOtp === generatedOtp) {
        setSuccessMsg('✅ Identity Verified!');
        setTimeout(() => {
          onVerifySuccess({ name, email, phone, role, verified: true });
          onClose();
        }, 800);
      } else {
        setErrorMsg('Invalid verification code. Please enter the correct OTP.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0D1E36] rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-900 dark:text-white border border-slate-200 dark:border-navy-700 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#0A1628] text-[#00A86B] dark:text-emerald-400 border border-emerald-200/60 dark:border-navy-700 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Security OTP Verification Required
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-1">
              To verify your identity as a legitimate stakeholder, enter the 6-digit security OTP code.
            </p>
          </div>

          {/* Simulated Email/Phone Target Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A1628] border border-slate-200/80 dark:border-navy-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
            Target: <span className="text-[#00A86B] dark:text-emerald-400">{email || phone}</span>
          </div>

          {/* Generated Demo OTP Pill Helper */}
          {generatedOtp && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 text-xs font-mono font-extrabold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Security Code: {generatedOtp}</span>
            </div>
          )}
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                id={`auth-otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-black text-xl rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-[#0A1628] text-slate-900 dark:text-white focus:border-[#00A86B] dark:focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/30 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || fullEnteredOtp.length < 4}
            className={`
              w-full py-3.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md
              ${fullEnteredOtp.length >= 4 
                ? 'bg-[#00A86B] hover:bg-[#008f5a] text-white cursor-pointer' 
                : 'bg-slate-200 dark:bg-navy-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <span>Verifying OTP...</span>
            ) : (
              <>
                <span>Verify Identity & Activate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
