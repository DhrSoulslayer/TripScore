import { useState, useRef } from 'react';
import type { AdminTab } from '../../types';
import { CarsPage } from './CarsPage';
import { DriversPage } from './DriversPage';
import { ReportPage } from './ReportPage';

// SHA-256 hash of the admin password (never store the plaintext password in code)
const ADMIN_HASH = '2a07d1d808d432b2f86333b9020ede4dbfece2672a7d2a6f6f355223d5004d17';
const SESSION_KEY = 'tripscore_admin_auth';

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function LoginGate({ onUnlock }: { onUnlock: () => void }) {
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
      if (hash === ADMIN_HASH) {
        sessionStorage.setItem(SESSION_KEY, '1');
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
    <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            style={{ margin: '0 auto 0.75rem' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Beheer</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Voer het wachtwoord in
          </div>
        </div>
        <form className="form" onSubmit={e => void handleSubmit(e)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Wachtwoord</label>
            <input
              id="admin-password"
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

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('cars');
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

  if (!unlocked) {
    return <LoginGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="page">
      <header className="page-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <h1>Beheer</h1>
      </header>

      <main className="page-content">
        {/* Tab navigation */}
        <div className="admin-tabs" role="tablist" aria-label="Beheer secties">
          <button
            className={`admin-tab${tab === 'cars' ? ' active' : ''}`}
            onClick={() => setTab('cars')}
            role="tab"
            aria-selected={tab === 'cars'}
          >
            🚗 Auto's
          </button>
          <button
            className={`admin-tab${tab === 'drivers' ? ' active' : ''}`}
            onClick={() => setTab('drivers')}
            role="tab"
            aria-selected={tab === 'drivers'}
          >
            👤 Bestuurders
          </button>
          <button
            className={`admin-tab${tab === 'report' ? ' active' : ''}`}
            onClick={() => setTab('report')}
            role="tab"
            aria-selected={tab === 'report'}
          >
            📊 Rapport
          </button>
        </div>

        {/* Tab content */}
        {tab === 'cars' && <CarsPage />}
        {tab === 'drivers' && <DriversPage />}
        {tab === 'report' && <ReportPage />}
      </main>
    </div>
  );
}
