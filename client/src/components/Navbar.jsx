import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  Globe, 
  Sun, 
  Moon, 
  Leaf,
  ChevronDown
} from 'lucide-react';
import { i18nDict } from '../i18n';

export default function Navbar({ lang, setLang, theme, toggleTheme }) {
  const location = useLocation();
  const t = i18nDict[lang] || i18nDict.en;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-2 z-40 px-3 sm:px-6 pt-1 pb-1">
      <header className={`liquid-glass-header rounded-2xl transition-all duration-300 ${isScrolled ? 'scrolled shadow-xl py-2' : 'py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-[#00A86B] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Leaf size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-emerald-400 font-medium">
                Surplus2Serve &bull; Food Redistribution
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 liquid-glass-capsule p-1 rounded-full">
            <Link 
              to="/donor" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/donor') 
                  ? 'bg-[#00A86B] text-white shadow-sm' 
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#00A86B]'
              }`}
            >
              <Building2 size={14} strokeWidth={2} />
              <span>{t.tabDonor}</span>
            </Link>
            <Link 
              to="/ngo" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/ngo') 
                  ? 'bg-[#00A86B] text-white shadow-sm' 
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#00A86B]'
              }`}
            >
              <HeartHandshake size={14} strokeWidth={2} />
              <span>{t.tabNgo}</span>
            </Link>
            <Link 
              to="/volunteer" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/volunteer') 
                  ? 'bg-[#00A86B] text-white shadow-sm' 
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#00A86B]'
              }`}
            >
              <Truck size={14} strokeWidth={2} />
              <span>{t.tabVolunteer}</span>
            </Link>
            <Link 
              to="/admin" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/admin') 
                  ? 'bg-[#00A86B] text-white shadow-sm' 
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#00A86B]'
              }`}
            >
              <ShieldCheck size={14} strokeWidth={2} />
              <span>{t.tabAdmin}</span>
            </Link>
            <Link 
              to="/impact" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/impact') 
                  ? 'bg-[#00A86B] text-white shadow-sm' 
                  : 'text-slate-700 dark:text-slate-200 hover:text-[#00A86B]'
              }`}
            >
              <BarChart3 size={14} strokeWidth={2} />
              <span>{t.tabImpact}</span>
            </Link>
          </nav>

          {/* Language & Theme controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center liquid-glass-capsule rounded-full px-2.5 py-1">
              <Globe size={14} strokeWidth={2} className="text-slate-500 dark:text-slate-300 pointer-events-none mr-1.5" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)} 
                className="bg-transparent pr-4 border-none text-xs font-extrabold text-slate-700 dark:text-white focus:outline-none appearance-none cursor-pointer"
              >
                <option value="en" className="dark:bg-[#0D1E36]">English</option>
                <option value="te" className="dark:bg-[#0D1E36]">తెలుగు (Telugu)</option>
                <option value="hi" className="dark:bg-[#0D1E36]">हिन्दी (Hindi)</option>
              </select>
              <ChevronDown size={12} strokeWidth={2} className="absolute right-2 text-slate-400 pointer-events-none" />
            </div>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full liquid-glass-capsule text-slate-700 dark:text-white hover:scale-105 transition-all"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={15} strokeWidth={2} className="text-amber-400" /> : <Moon size={15} strokeWidth={2} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

