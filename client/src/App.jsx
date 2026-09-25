import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import DonorPage from './pages/DonorPage';
import NgoPage from './pages/NgoPage';
import VolunteerPage from './pages/VolunteerPage';
import AdminPage from './pages/AdminPage';
import ImpactPage from './pages/ImpactPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [lang, setLang] = useState(() => localStorage.getItem('frn_lang_full') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('frn_theme_full') || 'light');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('frn_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      return null;
    }
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
    if (!user) return;
    const pathRoleMap = {
      '/donor': 'donor',
      '/ngo': 'ngo',
      '/volunteer': 'volunteer',
      '/admin': 'admin'
    };
    const targetRole = pathRoleMap[location.pathname];
    if (targetRole && user.role !== targetRole) {
      setUser(prev => ({ ...prev, role: targetRole }));
    }
  }, [location.pathname, user]);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(prev => ({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
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
    <Layout lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} user={user} setUser={setUser}>
      <Routes>
        <Route path="/login" element={<LoginPage user={user} setUser={setUser} lang={lang} />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={user}>
              <Landing lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/donor" 
          element={
            <ProtectedRoute user={user}>
              <DonorPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ngo" 
          element={
            <ProtectedRoute user={user}>
              <NgoPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/volunteer" 
          element={
            <ProtectedRoute user={user}>
              <VolunteerPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={user}>
              <AdminPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/impact" 
          element={
            <ProtectedRoute user={user}>
              <ImpactPage lang={lang} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} setUser={setUser} lang={lang} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="*" 
          element={<Navigate to={!user ? "/login" : "/"} replace />} 
        />
      </Routes>
    </Layout>
  );
}
