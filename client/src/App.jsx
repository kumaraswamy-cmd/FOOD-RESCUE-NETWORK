import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import DonorPage from './pages/DonorPage';
import NgoPage from './pages/NgoPage';
import VolunteerPage from './pages/VolunteerPage';
import AdminPage from './pages/AdminPage';
import ImpactPage from './pages/ImpactPage';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('frn_lang_full') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('frn_theme_full') || 'light');

  useEffect(() => {
    localStorage.setItem('frn_lang_full', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('frn_theme_full', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Layout lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<Landing lang={lang} />} />
        <Route path="/donor" element={<DonorPage lang={lang} />} />
        <Route path="/ngo" element={<NgoPage lang={lang} />} />
        <Route path="/volunteer" element={<VolunteerPage lang={lang} />} />
        <Route path="/admin" element={<AdminPage lang={lang} />} />
        <Route path="/impact" element={<ImpactPage lang={lang} />} />
      </Routes>
    </Layout>
  );
}
