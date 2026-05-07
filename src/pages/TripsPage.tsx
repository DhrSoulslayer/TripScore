import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

function formatKm(km: number): string {
  return km.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' km';
}

function formatEuro(amount: number): string {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function TripsPage() {
  const { trips, cars, drivers, deleteTrip } = useApp();

  const [monthDate, setMonthDate] = useState(() => new Date());
  const [filterCarId, setFilterCarId] = useState('');
  const [filterDriverId, setFilterDriverId] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const monthKey = getMonthKey(monthDate);
  const monthLabel = monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  const filtered = useMemo(() => {
    return trips.filter(t => {
      if (!t.date.startsWith(monthKey)) return false;
      if (filterCarId && t.carId !== filterCarId) return false;
      if (filterDriverId && t.driverId !== filterDriverId) return false;
      return true;
    });
  }, [trips, monthKey, filterCarId, filterDriverId]);

  const totalKm = filtered.reduce((sum, t) => sum + t.kilometers, 0);
  const totalCost = filtered.reduce((sum, t) => {
    const car = cars.find(c => c.id === t.carId);
    return sum + t.kilometers * (car?.costPerKm ?? 0);
  }, 0);

  function handleDelete(id: string) {
    deleteTrip(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className="page">
      <header className="page-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <h1>Ritten</h1>
      </header>

      <main className="page-content">
        {/* Month selector */}
        <div className="month-selector">
          <button
            onClick={() => setMonthDate(d => addMonths(d, -1))}
            aria-label="Vorige maand"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="month-label">{monthLabel}</span>
          <button
            onClick={() => setMonthDate(d => addMonths(d, 1))}
            aria-label="Volgende maand"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <select
            className="form-select"
            value={filterCarId}
            onChange={e => setFilterCarId(e.target.value)}
            aria-label="Filter op auto"
          >
            <option value="">Alle auto's</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={filterDriverId}
            onChange={e => setFilterDriverId(e.target.value)}
            aria-label="Filter op bestuurder"
          >
            <option value="">Alle bestuurders</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        {filtered.length > 0 && (
          <div className="card mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {filtered.length} rit{filtered.length !== 1 ? 'ten' : ''}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                  {formatKm(totalKm)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Kosten
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-success)' }}>
                  {formatEuro(totalCost)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trips list */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
              <circle cx="7.5" cy="17.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
            <h3>Geen ritten</h3>
            <p>Er zijn geen ritten gevonden voor deze maand.</p>
          </div>
        ) : (
          filtered.map(trip => {
            const car = cars.find(c => c.id === trip.carId);
            const driver = drivers.find(d => d.id === trip.driverId);
            const cost = trip.kilometers * (car?.costPerKm ?? 0);

            if (confirmDeleteId === trip.id) {
              return (
                <div key={trip.id} className="trip-card" style={{ borderLeft: '3px solid var(--color-danger)' }}>
                  <div className="trip-info">
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      Rit verwijderen?
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                      {car?.name} · {driver?.name} · {formatKm(trip.kilometers)} · {formatDate(trip.date)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(trip.id)}
                      >
                        Verwijderen
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={trip.id} className="trip-card">
                <div className="trip-icon" aria-hidden="true">
                  {car?.imageUrl ? (
                    <img src={car.imageUrl} alt={car.name} className="car-image-thumb" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
                      <circle cx="7.5" cy="17.5" r="2.5" />
                      <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                  )}
                </div>
                <div className="trip-info">
                  <div className="trip-main">
                    <span className="trip-name">{car?.name ?? 'Onbekende auto'}</span>
                    <span className="trip-km">{formatKm(trip.kilometers)}</span>
                  </div>
                  <div className="trip-meta">
                    <span>{driver?.name ?? 'Onbekend'}</span>
                    <span>·</span>
                    <span>{formatDate(trip.date)}</span>
                  </div>
                  {(trip.startAddress || trip.endAddress) && (
                    <div className="trip-address">
                      {trip.startAddress && trip.endAddress
                        ? `${trip.startAddress} → ${trip.endAddress}`
                        : trip.startAddress || trip.endAddress}
                      {trip.returnTrip ? ' · Retour' : ''}
                    </div>
                  )}
                  {trip.notes && (
                    <div className="trip-address" style={{ fontStyle: 'italic' }}>
                      {trip.notes}
                    </div>
                  )}
                  {cost > 0 && <div className="trip-cost">{formatEuro(cost)}</div>}
                </div>
                <div className="trip-actions">
                  <button
                    className="btn btn-icon btn-ghost"
                    onClick={() => setConfirmDeleteId(trip.id)}
                    aria-label="Rit verwijderen"
                    title="Verwijderen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
