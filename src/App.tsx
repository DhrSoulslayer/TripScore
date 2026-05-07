import { useRef, useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { AddTripPage } from './pages/AddTripPage';
import { TripsPage } from './pages/TripsPage';
import { AdminPage } from './pages/admin/AdminPage';
import type { Page } from './types';

const APP_PASSWORD_HASH = '036f5f113907574cc570f612d8f497291cd81a0c751435cc03551bcf62033d1c';
const APP_AUTH_KEY = 'tripscore_app_auth';

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function AppLoginGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError('');
    try {
      const hash = await sha256hex(password);
      if (hash === APP_PASSWORD_HASH) {
        localStorage.setItem(APP_AUTH_KEY, '1');
        onUnlock();
      } else {
        setError('Onjuist wachtwoord');
        setPassword('');
        inputRef.current?.focus();
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="app" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '1rem',
    }}>
      <div className="card" style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Welkom bij TripScore</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Voer het app-wachtwoord in
          </div>
        </div>

        <form className="form" onSubmit={e => void handleSubmit(e)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="app-password">Wachtwoord</label>
            <input
              id="app-password"
              ref={inputRef}
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
            {error && <span className="form-error">{error}</span>}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={checking || !password}
          >
            {checking ? 'Controleren...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(APP_AUTH_KEY) === '1');

  if (!unlocked) {
    return <AppLoginGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
