import React, { useState, useEffect } from 'react';
import { useAuth } from './Context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

function App() {
  const { isAuthenticated, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleNavigate = () => setCurrentPage('register');
    window.addEventListener('navigate-register', handleNavigate);
    return () => window.removeEventListener('navigate-register', handleNavigate);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado, mostramos Login o Register
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage onBack={() => setCurrentPage('login')} />;
    }
    return <LoginPage />;
  }

  // Si está autenticado, mostramos el contenido principal
  if (isAuthenticated) {
    if (currentPage === 'catalogs') {
      return <CatalogPage onBack={() => setCurrentPage('dashboard')} />;
    }
    if (currentPage === 'reports') {
      return <ReportsPage onBack={() => setCurrentPage('dashboard')} />;
    }
    return <DashboardPage onNavigate={setCurrentPage} />;
  }
}

export default App;