import React, { useState } from 'react';
import { logoutFirebase } from '../firebase';
import AuthModal from '../components/AuthModal';

export default function ProfilePage({ user, setUser, lang }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Kumar Thale');
  const [phone, setPhone] = useState(user?.phone || '9848022338');
  const [org, setOrg] = useState(user?.org || 'Royal Convention & Catering');
  const [address, setAddress] = useState(user?.address || 'Beach Road, Visakhapatnam, AP');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      name,
      phone,
      org,
      address
    }));
    setIsEditing(false);
    alert('✅ Profile details updated successfully!');
  };

  const handleLogout = async () => {
    await logoutFirebase();
    setUser(null);
    alert('👋 Logged out successfully.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Auth Modal when requested */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(newUserData) => {
          setUser(newUserData);
          alert(`Welcome, ${newUserData.name}!`);
        }}
      />

      {/* Top Profile Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#00A86B]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between flex-wrap gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#00A86B] shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#00A86B]/20 border-2 border-[#00A86B] text-[#00A86B] font-black text-3xl flex items-center justify-center shadow-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-[#00A86B] text-white p-1 rounded-lg text-xs shadow" title="Verified Account">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name || 'Kumar Thale'}</h2>
                <span className="px-3 py-1 bg-[#00A86B]/20 border border-[#00A86B]/40 text-[#00A86B] text-xs font-black rounded-full">
                  Verified {user?.role ? user.role.toUpperCase() : 'DONOR'}
                </span>
              </div>
              <p className="text-slate-300 text-xs font-semibold mt-1">{user?.email || 'kumar.thale@foodrescue.org'}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-medium flex-wrap">
                <span>📍 Visakhapatnam, AP</span>
                <span>📞 {user?.phone || '+91 98480 22338'}</span>
                <span>🆔 <strong className="font-mono text-slate-200">{user?.id || 'DONOR-001'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/20 shadow transition-all cursor-pointer"
                >
                  ✏️ {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow transition-all cursor-pointer"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                🔑 Sign In / Register Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      {isEditing && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm animate-fade-in">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Edit Profile & Organisation Details</h3>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Organisation / Hotel / NGO Name</label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Default Pickup / Operation Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow transition-all"
              >
                💾 Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Activity & Impact Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🍱</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">+18% this month</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">1,248</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Total Meals Rescued</div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🌱</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">Eco Impact</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">312 kg</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">CO₂ Emissions Prevented</div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🏛️</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">Proximity Matches</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">14 NGOs</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Connected Shelter Partners</div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🏅</span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">Trust Score</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">99.4%</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">FSSAI Audit Safety Pass Rate</div>
        </div>
      </div>

      {/* Account Setup & Authentication Info Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>🔥 Firebase Authentication Setup</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Your project supports Firebase Google Sign-In and Email Authentication. To connect your live Firebase project, paste your credentials into <code className="bg-slate-100 dark:bg-[#0A1628] px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-mono font-bold">client/.env</code>:
        </p>

        <div className="bg-slate-50 dark:bg-[#0A1628] p-4 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-800 space-y-1 overflow-x-auto">
          <div><span className="text-blue-500">VITE_FIREBASE_API_KEY</span>=your-api-key</div>
          <div><span className="text-blue-500">VITE_FIREBASE_AUTH_DOMAIN</span>=your-app.firebaseapp.com</div>
          <div><span className="text-blue-500">VITE_FIREBASE_PROJECT_ID</span>=your-app-id</div>
          <div><span className="text-blue-500">VITE_FIREBASE_STORAGE_BUCKET</span>=your-app.appspot.com</div>
          <div><span className="text-blue-500">VITE_FIREBASE_MESSAGING_SENDER_ID</span>=1234567890</div>
          <div><span className="text-blue-500">VITE_FIREBASE_APP_ID</span>=1:1234567890:web:abcdef123456</div>
        </div>
      </div>
    </div>
  );
}
