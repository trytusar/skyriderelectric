import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import DashboardLogin from './components/DashboardLogin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDashboardAuthenticated, setIsDashboardAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    checkDashboardAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsAdmin(!!session);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setIsAdmin(!!session);
    setLoading(false);
  };

  const checkDashboardAuth = () => {
    const authenticated = sessionStorage.getItem('dashboard_authenticated') === 'true';
    setIsDashboardAuthenticated(authenticated);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const handleDashboardLogin = () => {
    setIsDashboardAuthenticated(true);
  };

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const currentPath = window.location.pathname;

  if (currentPath === '/admin') {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }
    return <AdminPanel onLogout={handleLogout} onDataUpdate={handleDataUpdate} />;
  }

  if (!isDashboardAuthenticated) {
    return <DashboardLogin onLogin={handleDashboardLogin} />;
  }

  return <Dashboard key={refreshKey} />;
}

export default App;
