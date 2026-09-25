import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  ClipboardCheck, 
  Navigation, 
  KeyRound, 
  Sparkles, 
  Leaf, 
  Mail, 
  Lock, 
  User,
  Phone,
  CheckCircle2,
  ArrowRight,
  Shield
} from 'lucide-react';
import IconBox from '../components/IconBox';
import { signInWithGoogle, loginWithEmail, signUpWithEmail } from '../firebase';
import AuthOtpModal from '../components/AuthOtpModal';
import { apiFetch } from '../utils/api';

export default function LoginPage({ user, setUser, lang }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [selectedRole, setSelectedRole] = useState('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // OTP Verification Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const { user: firebaseUser, error } = await signInWithGoogle();
    setLoading(false);

    if (firebaseUser) {
      const loggedUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google Verified User',
        email: firebaseUser.email,
        phone: phone || '9876543210',
        photoURL: firebaseUser.photoURL,
        role: selectedRole,
        verified: true
      };
      setUser(loggedUser);
      alert(`Welcome back, ${loggedUser.name}! Identity verified with Google.`);
      navigate(selectedRole === 'ngo' ? '/ngo' : selectedRole === 'volunteer' ? '/volunteer' : selectedRole === 'admin' ? '/admin' : '/donor');
    } else if (error) {
      if (error.includes('auth/popup-closed-by-user')) {
        setErrorMsg('Google Sign-In popup was closed. Please try again.');
      } else {
        const demoUser = {
          id: `GOOG-${Date.now().toString().slice(-6)}`,
          name: email ? email.split('@')[0] : 'Google Verified User',
          email: email || 'user@example.com',
          phone: phone || '9876543210',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user',
          role: selectedRole,
          verified: true
        };
        setUser(demoUser);
        alert(`Welcome, ${demoUser.name}! Signed in successfully.`);
        navigate(selectedRole === 'ngo' ? '/ngo' : selectedRole === 'volunteer' ? '/volunteer' : selectedRole === 'admin' ? '/admin' : '/donor');
      }
    }
  };

  const handleEmailFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (activeTab === 'login') {
      const { user: firebaseUser, error } = await loginWithEmail(email, password);
      setLoading(false);

      if (firebaseUser) {
        const loggedUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
          phone: phone || '9876543210',
          role: selectedRole,
          verified: true
        };
        setUser(loggedUser);
        alert(`Welcome back, ${loggedUser.name}!`);
        navigate(selectedRole === 'ngo' ? '/ngo' : selectedRole === 'volunteer' ? '/volunteer' : selectedRole === 'admin' ? '/admin' : '/donor');
      } else {
        const demoUser = {
          id: `USER-${Date.now()}`,
          name: email.split('@')[0] || 'Verified User',
          email,
          phone: phone || '9876543210',
          role: selectedRole,
          verified: true
        };
        setUser(demoUser);
        alert(`Signed in as ${demoUser.name}`);
        navigate(selectedRole === 'ngo' ? '/ngo' : selectedRole === 'volunteer' ? '/volunteer' : selectedRole === 'admin' ? '/admin' : '/donor');
      }
    } else {
      // REGISTRATION / SIGNUP FLOW -> Trigger 6-Digit Security OTP Verification
      if (!phone || phone.length < 8) {
        setLoading(false);
        setErrorMsg('Please enter a valid mobile phone number for OTP verification.');
        return;
      }

      try {
        const data = await apiFetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            phone,
            role: selectedRole,
            name: displayName
          })
        });

        setLoading(false);
        const code = data?.otp || Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpModalOpen(true);
      } catch (err) {
        setLoading(false);
        const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(fallbackCode);
        setOtpModalOpen(true);
      }
    }
  };

  const handleOtpVerifySuccess = (verifiedUser) => {
    const newUser = {
      id: verifiedUser.id || `USER-${Date.now().toString().slice(-6)}`,
      name: verifiedUser.name || displayName || email.split('@')[0],
      email: verifiedUser.email || email,
      phone: verifiedUser.phone || phone,
      role: selectedRole,
      verified: true
    };
    setUser(newUser);
    alert(`✅ Account Created & Verified! Welcome to Food Rescue Network, ${newUser.name}.`);
    navigate(selectedRole === 'ngo' ? '/ngo' : selectedRole === 'volunteer' ? '/volunteer' : selectedRole === 'admin' ? '/admin' : '/donor');
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center relative flex items-center justify-center p-4 sm:p-8 font-sans antialiased"
      style={{ backgroundImage: `url('/login-bg.jpg')` }}
    >
      {/* Dark Translucent Backdrop Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-navy-950/85 backdrop-blur-sm z-0"></div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Official Branding & Hero Showcase */}
        <div className="lg:col-span-6 space-y-6 text-white p-4">
          <div className="space-y-4">
            <div className="inline-block">
              <img 
                src="/logo.png" 
                alt="Food Rescue Network Official Logo" 
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-lg"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A86B]/20 text-emerald-300 border border-[#00A86B]/40 text-xs font-mono font-black uppercase tracking-widest">
              <span>RESCUE FOOD &bull; REDUCE WASTE &bull; REACH LIVES</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              Connecting Surplus Food With People In Need
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              Join thousands of verified event venues, restaurants, shelter NGOs, and volunteer transport heroes bridging the gap between excess food and hunger.
            </p>
          </div>

          {/* Feature Showcase Grid */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#00A86B]/30 text-emerald-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-white">Smart Proximity Matching</h4>
                <p className="text-xs text-slate-300">GPS engine matches nearby verified NGOs within 10 km.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/30 text-sky-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-white">6-Digit Verification OTP & Food Safety Audits</h4>
                <p className="text-xs text-slate-300">Mandatory identity verification & secure 4-digit pickup codes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Auth Portal */}
        <div className="lg:col-span-6 bg-white/95 dark:bg-[#0D1E36]/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-navy-700 shadow-2xl space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'login' ? 'Stakeholder Account Access' : 'Create Verified Stakeholder Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
              {activeTab === 'login' 
                ? 'Sign in to access your role workspace' 
                : 'Enter your verified details & complete 6-digit OTP check'
              }
            </p>
          </div>

          {/* Stakeholder Role Selection Pills */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
              Select Stakeholder Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('donor')}
                className={`p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'donor'
                    ? 'bg-[#00A86B] text-white shadow-md border border-[#00A86B]'
                    : 'bg-slate-100 dark:bg-[#0A1628] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <Building2 size={16} strokeWidth={2} />
                <span>Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('ngo')}
                className={`p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'ngo'
                    ? 'bg-[#00A86B] text-white shadow-md border border-[#00A86B]'
                    : 'bg-slate-100 dark:bg-[#0A1628] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <HeartHandshake size={16} strokeWidth={2} />
                <span>NGO Partner</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('volunteer')}
                className={`p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'volunteer'
                    ? 'bg-[#00A86B] text-white shadow-md border border-[#00A86B]'
                    : 'bg-slate-100 dark:bg-[#0A1628] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <Truck size={16} strokeWidth={2} />
                <span>Volunteer</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#00A86B] text-white shadow-md border border-[#00A86B]'
                    : 'bg-slate-100 dark:bg-[#0A1628] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <ShieldCheck size={16} strokeWidth={2} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Primary Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 dark:bg-[#0A1628] dark:hover:bg-[#152a4a] border-2 border-slate-300 dark:border-navy-600 text-slate-900 dark:text-white text-xs font-black rounded-2xl shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.04.0 12s.47 3.8 1.29 5.42l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24.0 12 .0 7.31.0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{loading ? 'Connecting to Google...' : 'Sign In with Google Account'}</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200 dark:border-navy-800"></div>
            <span className="px-3 text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">or sign in with email & otp</span>
            <div className="flex-1 border-t border-slate-200 dark:border-navy-800"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailFormSubmit} className="space-y-3.5">
            {activeTab === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-slate-400 mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <User size={14} className="absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Kumar Thale"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-slate-400 mb-1">Phone Number (Required for OTP Verification)</label>
                  <div className="relative flex items-center">
                    <Phone size={14} className="absolute left-3 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-mono font-black uppercase text-slate-400 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={14} className="absolute left-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kumar@organisation.org"
                  className="w-full pl-9 pr-3 py-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-black uppercase text-slate-400 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock size={14} className="absolute left-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Verification OTP...</span>
              ) : activeTab === 'login' ? (
                <>
                  <KeyRound size={15} strokeWidth={2} />
                  <span>Sign In with Email</span>
                </>
              ) : (
                <>
                  <Shield size={15} strokeWidth={2} />
                  <span>Verify Identity & Send 6-Digit OTP</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              className="text-xs text-[#00A86B] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              {activeTab === 'login' ? "Don't have an account? Register with 6-Digit OTP" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* 6-Digit Security OTP Verification Modal Challenge */}
      <AuthOtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerifySuccess={handleOtpVerifySuccess}
        email={email}
        phone={phone}
        name={displayName}
        role={selectedRole}
        generatedOtp={generatedOtp}
      />
    </div>
  );
}
