import React, { useState } from 'react';
import { Camera, X, CheckCircle2, Upload, Utensils } from 'lucide-react';

export default function DeliveryProofModal({ isOpen, onClose, onConfirm, donation }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [beneficiary, setBeneficiary] = useState('Shelter Beneficiaries');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !donation) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onConfirm({
      delivery_photo_url: photoUrl,
      beneficiary_name: beneficiary
    });
    setLoading(false);
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
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-[#00A86B] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 border border-emerald-300 dark:border-emerald-800 shadow-inner">
            <Camera className="w-7 h-7 text-[#00A86B]" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Delivery Proof Photo Upload</h3>
          <p className="text-slate-500 dark:text-slate-300 text-xs font-medium mt-1">
            Upload a photo of the delivered food at <strong>{donation.ngo_name || donation.assigned_ngo_name || 'Shelter'}</strong>.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#0A1628] rounded-2xl border border-slate-200 dark:border-navy-800 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#00A86B] flex items-center justify-center font-bold shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white">{donation.food_type}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{donation.quantity} Servings</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Recipients / Shelter Name
            </label>
            <input 
              type="text" 
              value={beneficiary} 
              onChange={(e) => setBeneficiary(e.target.value)} 
              placeholder="e.g. Asha Shelter Children" 
              className="w-full p-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Food Delivery Proof Photo
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-4 text-center space-y-3 bg-slate-50/50 dark:bg-[#0A1628]/50">
              {photoUrl ? (
                <div className="relative">
                  <img src={photoUrl} alt="Delivery Proof" className="w-full h-40 object-cover rounded-xl border border-emerald-500 shadow-md" />
                  <button 
                    type="button" 
                    onClick={() => setPhotoUrl('')} 
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2 py-4">
                  <Upload className="w-8 h-8 text-[#00A86B] mx-auto" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to capture / upload delivery photo</div>
                  <div className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
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
              disabled={loading}
              className="w-2/3 py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Confirm Delivery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
