import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { AddTripPage } from './pages/AddTripPage';
import { TripsPage } from './pages/TripsPage';
import { AdminPage } from './pages/admin/AdminPage';
import type { Page } from './types';

function AppShell() {
  const [page, setPage] = useState<Page>('home');
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="app" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', flexDirection: 'column', gap: '1rem',
        color: 'var(--color-text-muted)',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary)"
            strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: '0.875rem' }}>Laden...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app">
      {page === 'home' && <HomePage onAddTrip={() => setPage('add-trip')} />}
      {page === 'add-trip' && (
        <AddTripPage onSaved={() => setPage('trips')} onBack={() => setPage('home')} />
      )}
      {page === 'trips' && <TripsPage />}
      {page === 'admin' && <AdminPage />}
      <Navigation currentPage={page} onNavigate={setPage} />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
