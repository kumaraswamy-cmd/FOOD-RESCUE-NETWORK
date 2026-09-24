import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import DonorPage from './pages/DonorPage';
import NgoPage from './pages/NgoPage';
import VolunteerPage from './pages/VolunteerPage';
import AdminPage from './pages/AdminPage';
import ImpactPage from './pages/ImpactPage';
import ProfilePage from './pages/ProfilePage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('frn_lang_full') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('frn_theme_full') || 'light');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('frn_user');
    return saved ? JSON.parse(saved) : {
      id: 'DONOR-001',
      name: 'Kumar Thale',
      email: 'kumar.thale@foodrescue.org',
      phone: '9848022338',
      role: 'donor',
      org: 'Royal Convention & Catering'
    };
  });

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

  useEffect(() => {
    if (user) {
      localStorage.setItem('frn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('frn_user');
    }
  }, [user]);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(prev => ({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || prev?.name || 'Firebase User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: prev?.role || 'donor'
          }));
        }
      });
      return () => unsubscribe();
    } catch(e) {}
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Layout lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} user={user}>
      <Routes>
        <Route path="/" element={<Landing lang={lang} />} />
        <Route path="/donor" element={<DonorPage lang={lang} user={user} />} />
        <Route path="/ngo" element={<NgoPage lang={lang} user={user} />} />
        <Route path="/volunteer" element={<VolunteerPage lang={lang} user={user} />} />
        <Route path="/admin" element={<AdminPage lang={lang} user={user} />} />
        <Route path="/impact" element={<ImpactPage lang={lang} />} />
        <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} lang={lang} />} />
      </Routes>
    </Layout>
  );
}
