import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { i18nDict } from '../i18n';

export default function Layout({ children, lang, setLang, theme, toggleTheme, user, setUser }) {
  const location = useLocation();
  const t = i18nDict[lang] || i18nDict.en;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navItems = [
    { path: '/', label: t.tabHome || 'Home', icon: '🏠' },
    { path: '/donor', label: t.tabDonor || 'Donor Dashboard', icon: '🏬' },
    { path: '/ngo', label: t.tabNgo || 'NGO Partners', icon: '🏛️' },
    { path: '/volunteer', label: t.tabVolunteer || 'Volunteers', icon: '🚴' },
    { path: '/admin', label: t.tabAdmin || 'Admin Governance', icon: '🛡️' },
    { path: '/impact', label: t.tabImpact || 'Impact & Analytics', icon: '📊' },
    { path: '/profile', label: 'Account Profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'U';

  return (
    <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0A1628] text-slate-800 dark:text-slate-100 flex font-sans antialiased transition-colors duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. SIDEBAR (Persistent Dark Navy Theme)                      */}
      {/* ------------------------------------------------------------- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0D1E36] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-xl border-r border-navy-800
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Header */}
        <div className="p-6 border-b border-navy-700/50 flex flex-col items-start gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Food Rescue Network Logo" 
              className="h-12 w-auto object-contain bg-white/10 p-1.5 rounded-xl group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <div>
              <div className="font-black text-lg tracking-tight text-white flex items-center gap-1">
                <span>Food</span>
                <span className="text-[#00A86B]">Rescue</span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
                N E T W O R K
              </div>
            </div>
          </Link>
          <div className="text-[11px] text-emerald-400 font-medium italic opacity-90">
            Good Food. Brighter Tomorrows.
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-extrabold transition-all duration-150
                  ${active 
                    ? 'bg-[#1C3B64] text-white shadow-md border-l-4 border-[#00A86B]' 
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Server Status Badge */}
        <div className="px-4 py-3 mx-4 mb-4 rounded-xl bg-navy-800/80 border border-navy-700/60 text-[11px] text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></span>
          <div>
            <div className="font-bold text-white">Live Node.js Server</div>
            <div className="text-[10px] text-slate-400">Port 5001 &bull; SQLite Active</div>
          </div>
        </div>

        {/* Sidebar Footer Watermark */}
        <div className="p-4 border-t border-navy-700/50 text-center text-xs text-slate-400">
          <div className="flex justify-center mb-1 text-emerald-400 text-lg">🌿</div>
          <div className="font-bold text-slate-200">Food Rescue Network</div>
          <div className="text-[10px] opacity-75">Good Food. Brighter Tomorrows.</div>
        </div>
      </aside>

      {/* Overlay for Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-[#0D1E36] border-b border-slate-200/80 dark:border-navy-700/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 lg:hidden"
            >
              ☰
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden sm:block w-72 lg:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                🔍
              </span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donations, NGOs, locations..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B] transition-all"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)} 
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1C3B64] border border-slate-200 dark:border-navy-700 text-xs font-extrabold text-slate-700 dark:text-white focus:outline-none"
            >
              <option value="en" className="dark:bg-[#0D1E36]">🌐 English</option>
              <option value="te" className="dark:bg-[#0D1E36]">🌐 తెలుగు (Telugu)</option>
              <option value="hi" className="dark:bg-[#0D1E36]">🌐 हिन्दी (Hindi)</option>
            </select>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#1C3B64] border border-slate-200 dark:border-navy-700 text-sm hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-white transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Dynamic User Profile Chip */}
            {user ? (
              <Link to="/profile" className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-navy-700 group cursor-pointer">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-[#00A86B] shadow-sm group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#0D1E36] dark:bg-[#00A86B] text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                    {userInitials}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight group-hover:text-[#00A86B] transition-colors max-w-[120px] truncate">{user.name}</div>
                  <div className="text-[10px] font-bold text-[#00A86B] dark:text-emerald-400 capitalize">{user.role || 'Verified User'}</div>
                </div>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="px-3.5 py-2 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-2"
              >
                <span>🔑</span>
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
