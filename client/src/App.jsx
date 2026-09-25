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

function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const primaryRoute = 
      user.role === 'admin' ? '/admin' :
      user.role === 'ngo' ? '/ngo' :
      user.role === 'volunteer' ? '/volunteer' : '/donor';
    return <Navigate to={primaryRoute} replace />;
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
            <ProtectedRoute user={user} allowedRoles={['donor', 'ngo', 'volunteer']}>
              <Landing lang={lang} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/donor" 
          element={
            <ProtectedRoute user={user} allowedRoles={['donor']}>
              <DonorPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ngo" 
          element={
            <ProtectedRoute user={user} allowedRoles={['ngo']}>
              <NgoPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/volunteer" 
          element={
            <ProtectedRoute user={user} allowedRoles={['volunteer']}>
              <VolunteerPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              <AdminPage lang={lang} user={user} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/impact" 
          element={
            <ProtectedRoute user={user} allowedRoles={['donor', 'ngo', 'volunteer', 'admin']}>
              <ImpactPage lang={lang} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user} allowedRoles={['donor', 'ngo', 'volunteer', 'admin']}>
              <ProfilePage user={user} setUser={setUser} lang={lang} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="*" 
          element={
            <Navigate 
              to={
                !user 
                  ? '/login' 
                  : user.role === 'admin' 
                    ? '/admin' 
                    : user.role === 'ngo' 
                      ? '/ngo' 
                      : user.role === 'volunteer' 
                        ? '/volunteer' 
                        : '/donor'
              } 
              replace 
            />
          } 
        />
      </Routes>
    </Layout>
  );
}
