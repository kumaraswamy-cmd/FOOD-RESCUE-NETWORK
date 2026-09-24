import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { i18nDict } from '../i18n';

export default function Navbar({ lang, setLang, theme, toggleTheme }) {
  const location = useLocation();
  const t = i18nDict[lang] || i18nDict.en;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-md border-b border-gray-200 dark:border-emerald-900 shadow-sm">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-emerald-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
            <strong>FULL-STACK LIVE SERVER:</strong> Node.js REST API + SQLite (Port 5001)
          </span>
          <span className="hidden md:inline text-[11px] opacity-80">
            MVGR B.Tech Community Project &bull; Dept of Data Engineering
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center text-xl text-white shadow-md group-hover:scale-105 transition-transform">
            🥗
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-emerald-950 dark:text-emerald-50 leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-xs text-gray-500 dark:text-emerald-300 font-medium">
              Surplus2Serve &bull; Food Redistribution
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-emerald-900/40 p-1 rounded-xl border border-gray-200 dark:border-emerald-800">
          <Link 
            to="/donor" 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/donor') 
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm' 
                : 'text-gray-600 dark:text-emerald-200 hover:text-emerald-700'
            }`}
          >
            🏬 {t.tabDonor}
          </Link>
          <Link 
            to="/ngo" 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/ngo') 
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm' 
                : 'text-gray-600 dark:text-emerald-200 hover:text-emerald-700'
            }`}
          >
            🏛️ {t.tabNgo}
          </Link>
          <Link 
            to="/volunteer" 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/volunteer') 
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm' 
                : 'text-gray-600 dark:text-emerald-200 hover:text-emerald-700'
            }`}
          >
            🚴 {t.tabVolunteer}
          </Link>
          <Link 
            to="/admin" 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/admin') 
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm' 
                : 'text-gray-600 dark:text-emerald-200 hover:text-emerald-700'
            }`}
          >
            🛡️ {t.tabAdmin}
          </Link>
          <Link 
            to="/impact" 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/impact') 
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm' 
                : 'text-gray-600 dark:text-emerald-200 hover:text-emerald-700'
            }`}
          >
            📊 {t.tabImpact}
          </Link>
        </nav>

        {/* Language & Theme controls */}
        <div className="flex items-center gap-2">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)} 
            className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-emerald-900 border border-gray-200 dark:border-emerald-800 text-xs font-bold text-gray-800 dark:text-emerald-100"
          >
            <option value="en">🌐 English</option>
            <option value="te">🌐 తెలుగు (Telugu)</option>
            <option value="hi">🌐 हिन्दी (Hindi)</option>
          </select>

          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-emerald-900 border border-gray-200 dark:border-emerald-800 text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
