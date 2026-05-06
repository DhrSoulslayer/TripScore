import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { AddTripPage } from './pages/AddTripPage';
import { TripsPage } from './pages/TripsPage';
import { AdminPage } from './pages/admin/AdminPage';
import type { Page } from './types';

export function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <AppProvider>
      <div className="app">
        {page === 'home' && <HomePage onAddTrip={() => setPage('add-trip')} />}
        {page === 'add-trip' && (
          <AddTripPage onSaved={() => setPage('trips')} onBack={() => setPage('home')} />
        )}
        {page === 'trips' && <TripsPage />}
        {page === 'admin' && <AdminPage />}
        <Navigation currentPage={page} onNavigate={setPage} />
      </div>
    </AppProvider>
  );
}
