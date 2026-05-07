import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

interface HomePageProps {
  onAddTrip: () => void;
}

function formatKm(km: number): string {
  return km.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' km';
}

function formatEuro(amount: number): string {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export function HomePage({ onAddTrip }: HomePageProps) {
  const { trips, cars, drivers } = useApp();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthTrips = useMemo(
    () => trips.filter(t => t.date.startsWith(thisMonth)),
    [trips, thisMonth],
  );

  const totalKm = useMemo(
    () => monthTrips.reduce((sum, t) => sum + t.kilometers, 0),
    [monthTrips],
  );

  const recentTrips = trips.slice(0, 5);

  const monthName = now.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  return (
    <div className="page">
      <header className="page-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="white" fillOpacity="0.2" />
          <path
            d="M4 14h16M6 14l1.5-5h9L18 14M8 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <h1>TripScore</h1>
        <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{monthName}</span>
      </header>

      <main className="page-content">
        {/* Hero CTA */}
        <div className="hero">
          <div className="hero-title">Rit registreren</div>
          <div className="hero-sub">Voeg snel een nieuwe rit toe</div>
          <button className="btn btn-lg" onClick={onAddTrip}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuwe rit
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Ritten deze maand</div>
            <div className="stat-value primary">{monthTrips.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Km deze maand</div>
            <div className="stat-value primary">{formatKm(totalKm)}</div>
          </div>
        </div>

        {/* Recent trips */}
        <div className="section-header mt-4 mb-3">
          <div className="section-title">Recente ritten</div>
          {trips.length > 0 && (
            <span className="badge badge-blue">{trips.length} totaal</span>
          )}
        </div>

        {recentTrips.length === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h3>Geen ritten gevonden</h3>
            <p>
              {cars.length === 0 || drivers.length === 0
                ? 'Voeg eerst auto\'s en bestuurders toe via Beheer.'
                : 'Druk op + om je eerste rit te registreren.'}
            </p>
          </div>
        ) : (
          recentTrips.map(trip => {
            const car = cars.find(c => c.id === trip.carId);
            const driver = drivers.find(d => d.id === trip.driverId);
            const cost = trip.kilometers * (car?.costPerKm ?? 0);
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
                    </div>
                  )}
                  {cost > 0 && <div className="trip-cost">{formatEuro(cost)}</div>}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
