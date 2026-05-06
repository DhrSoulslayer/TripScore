import { useState } from 'react';
import type { AdminTab } from '../../types';
import { CarsPage } from './CarsPage';
import { DriversPage } from './DriversPage';
import { ReportPage } from './ReportPage';

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('cars');

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
