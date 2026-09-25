import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  User, 
  Globe, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogIn, 
  Leaf, 
  Server,
  ChevronDown,
  Bell
} from 'lucide-react';
import { i18nDict } from '../i18n';

export default function Layout({ children, lang, setLang, theme, toggleTheme, user, setUser }) {
  const location = useLocation();
  const t = i18nDict[lang] || i18nDict.en;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide side navbar and top navbar completely on the login page
  if (location.pathname === '/login') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0A1628] text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col justify-center">
        {children}
      </div>
    );
  }

  const allNavItems = [
    { path: '/', label: t.tabHome || 'Home', icon: Home, roles: ['donor', 'ngo', 'volunteer'] },
    { path: '/donor', label: t.tabDonor || 'Donor Dashboard', icon: Building2, roles: ['donor'] },
    { path: '/ngo', label: t.tabNgo || 'NGO Partners', icon: HeartHandshake, roles: ['ngo'] },
    { path: '/volunteer', label: t.tabVolunteer || 'Volunteers', icon: Truck, roles: ['volunteer'] },
    { path: '/admin', label: t.tabAdmin || 'Admin Governance', icon: ShieldCheck, roles: ['admin'] },
    { path: '/impact', label: t.tabImpact || 'Impact & Analytics', icon: BarChart3, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
    { path: '/profile', label: 'Account Profile', icon: User, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
  ];

  const currentRole = user?.role || 'donor';
  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

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
            const IconComponent = item.icon;
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
                <IconComponent size={18} strokeWidth={2} className={active ? 'text-[#00A86B]' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Server Status Badge */}
        <div className="px-4 py-3 mx-4 mb-4 rounded-xl bg-navy-800/80 border border-navy-700/60 text-[11px] text-slate-300 flex items-center gap-2">
          <Server size={16} strokeWidth={2} className="text-[#00A86B]" />
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] animate-pulse"></span>
              <span>Live Node.js Server</span>
            </div>
            <div className="text-[10px] text-slate-400">Port 5001 &bull; SQLite Active</div>
          </div>
        </div>

        {/* Sidebar Footer Watermark */}
        <div className="p-4 border-t border-navy-700/50 text-center text-xs text-slate-400">
          <div className="flex justify-center mb-1 text-[#00A86B]">
            <Leaf size={20} strokeWidth={2} />
          </div>
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
      {/* 2. MAIN CONTENT AREA & FLOATING LIQUID GLASS HEADER           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Floating Apple-Inspired Translucent Liquid Glass Header */}
        <div className="sticky top-2.5 z-30 px-3 sm:px-6 pt-1 pb-1.5">
          <header className={`
            liquid-glass-header rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-all duration-300
            ${isScrolled ? 'scrolled shadow-xl py-2.5' : ''}
          `}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 liquid-glass-capsule hover:scale-105 transition-transform lg:hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            </div>

            {/* Right Glass Controls */}
            <div className="flex items-center gap-2.5">
              {/* Glass Language Selector */}
              <div className="relative flex items-center liquid-glass-capsule rounded-full px-2.5 py-1">
                <Globe size={14} strokeWidth={2} className="text-slate-500 dark:text-slate-300 pointer-events-none mr-1.5" />
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)} 
                  className="bg-transparent pr-4 border-none text-xs font-extrabold text-slate-700 dark:text-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="en" className="dark:bg-[#0D1E36] text-slate-900 dark:text-white">English</option>
                  <option value="te" className="dark:bg-[#0D1E36] text-slate-900 dark:text-white">తెలుగు (Telugu)</option>
                  <option value="hi" className="dark:bg-[#0D1E36] text-slate-900 dark:text-white">हिन्दी (Hindi)</option>
                </select>
                <ChevronDown size={12} strokeWidth={2} className="absolute right-2 text-slate-400 pointer-events-none" />
              </div>

              {/* Glass Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full liquid-glass-capsule text-slate-700 dark:text-white hover:scale-105 transition-all"
                title="Toggle Light/Dark Theme"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun size={15} strokeWidth={2} className="text-amber-400 animate-spin-once" />
                ) : (
                  <Moon size={15} strokeWidth={2} className="text-indigo-600" />
                )}
              </button>

              {/* Notification Pill */}
              <button 
                className="hidden md:flex p-2 rounded-full liquid-glass-capsule text-slate-700 dark:text-white hover:scale-105 transition-all relative"
                title="Live Dispatch Notifications"
              >
                <Bell size={15} strokeWidth={2} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00A86B] ring-2 ring-white dark:ring-navy-900"></span>
              </button>

              {/* Dynamic User Profile / Sign In Glass CTA */}
              {user ? (
                <Link to="/profile" className="flex items-center gap-2.5 pl-2.5 pr-3 py-1 liquid-glass-capsule rounded-full group cursor-pointer hover:scale-[1.02] transition-transform">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-[#00A86B] shadow-sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#0D1E36] dark:bg-[#00A86B] text-white flex items-center justify-center font-black text-[11px] shadow-sm">
                      {userInitials}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight group-hover:text-[#00A86B] transition-colors max-w-[110px] truncate">{user.name}</div>
                    <div className="text-[9px] font-bold text-[#00A86B] dark:text-emerald-400 capitalize">{user.role || 'Verified User'}</div>
                  </div>
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="px-4 py-2 liquid-glass-button text-white font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                >
                  <LogIn size={14} strokeWidth={2} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </header>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

