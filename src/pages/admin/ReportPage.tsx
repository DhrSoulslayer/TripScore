import { useState, useMemo, Fragment } from 'react';
import { useApp } from '../../context/AppContext';

function formatKm(km: number): string {
  return km.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km';
}

function formatEuro(amount: number): string {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

interface DriverRow {
  driverId: string;
  driverName: string;
  totalKm: number;
  totalCost: number;
  carBreakdown: CarBreakdownRow[];
}

interface CarBreakdownRow {
  carId: string;
  carName: string;
  km: number;
  cost: number;
  tripCount: number;
}

export function ReportPage() {
  const { trips, cars, drivers } = useApp();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  const monthKey = getMonthKey(year, month);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
  });

  const monthTrips = useMemo(
    () => trips.filter(t => t.date.startsWith(monthKey)),
    [trips, monthKey],
  );

  const reportRows = useMemo((): DriverRow[] => {
    return drivers
      .map(driver => {
        const driverTrips = monthTrips.filter(t => t.driverId === driver.id);
        if (driverTrips.length === 0) return null;

        const carMap = new Map<string, CarBreakdownRow>();
        driverTrips.forEach(trip => {
          const car = cars.find(c => c.id === trip.carId);
          if (!carMap.has(trip.carId)) {
            carMap.set(trip.carId, {
              carId: trip.carId,
              carName: car?.name ?? 'Onbekende auto',
              km: 0,
              cost: 0,
              tripCount: 0,
            });
          }
          const row = carMap.get(trip.carId)!;
          row.km += trip.kilometers;
          row.cost += trip.kilometers * (car?.costPerKm ?? 0);
          row.tripCount++;
        });

        const totalKm = driverTrips.reduce((s, t) => s + t.kilometers, 0);
        const totalCost = driverTrips.reduce((s, t) => {
          const car = cars.find(c => c.id === t.carId);
          return s + t.kilometers * (car?.costPerKm ?? 0);
        }, 0);

        return {
          driverId: driver.id,
          driverName: driver.name,
          totalKm,
          totalCost,
          carBreakdown: Array.from(carMap.values()),
        } satisfies DriverRow;
      })
      .filter((r): r is DriverRow => r !== null);
  }, [monthTrips, drivers, cars]);

  const grandTotalKm = reportRows.reduce((s, r) => s + r.totalKm, 0);
  const grandTotalCost = reportRows.reduce((s, r) => s + r.totalCost, 0);

  const carSummaryRows = useMemo(() => {
    const carMap = new Map<string, { carId: string; name: string; km: number; cost: number }>();
    monthTrips.forEach(trip => {
      const car = cars.find(c => c.id === trip.carId);
      if (!carMap.has(trip.carId)) {
        carMap.set(trip.carId, {
          carId: trip.carId,
          name: car?.name ?? 'Onbekende auto',
          km: 0,
          cost: 0,
        });
      }
      const row = carMap.get(trip.carId)!;
      row.km += trip.kilometers;
      row.cost += trip.kilometers * (car?.costPerKm ?? 0);
    });
    return Array.from(carMap.values());
  }, [monthTrips, cars]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="section-header">
        <div className="section-title">Maandrapport</div>
        <button className="btn btn-ghost btn-sm no-print" onClick={handlePrint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Afdrukken
        </button>
      </div>

      {/* Month selector */}
      <div className="month-selector no-print">
        <button onClick={prevMonth} aria-label="Vorige maand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="month-label">{monthLabel}</span>
        <button onClick={nextMonth} aria-label="Volgende maand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Print header */}
      <div style={{ display: 'none' }} className="print-only">
        <h2 style={{ marginBottom: '0.5rem' }}>TripScore – Maandrapport</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{monthLabel}</p>
      </div>

      {reportRows.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <h3>Geen ritten</h3>
          <p>Er zijn geen ritten gevonden voor {monthLabel}.</p>
        </div>
      ) : (
        <>
          {/* Per driver table */}
          <div className="table-wrapper" style={{ marginBottom: '0.75rem' }}>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Bestuurder</th>
                  <th style={{ textAlign: 'right' }}>Kilometers</th>
                  <th style={{ textAlign: 'right' }}>Kosten</th>
                  <th style={{ textAlign: 'right', width: 32 }} className="no-print"></th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map(row => (
                  <Fragment key={row.driverId}>
                    <tr
                      style={{ cursor: row.carBreakdown.length > 1 ? 'pointer' : 'default' }}
                      onClick={() =>
                        row.carBreakdown.length > 1 &&
                        setExpandedDriver(expandedDriver === row.driverId ? null : row.driverId)
                      }
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.driverName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {row.carBreakdown.reduce((s, c) => s + c.tripCount, 0)} ritten
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatKm(row.totalKm)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                        {formatEuro(row.totalCost)}
                      </td>
                      <td style={{ textAlign: 'right' }} className="no-print">
                        {row.carBreakdown.length > 1 && (
                          <svg
                            width="16" height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              transform: expandedDriver === row.driverId ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s',
                              color: 'var(--color-text-muted)',
                              display: 'inline-block',
                            }}
                            aria-hidden="true"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )}
                      </td>
                    </tr>
                    {/* Car breakdown */}
                    {expandedDriver === row.driverId &&
                      row.carBreakdown.map(car => (
                        <tr key={`${row.driverId}-${car.carId}`} className="subtotal-row">
                          <td style={{ paddingLeft: '1.5rem' }}>
                            <span aria-hidden="true">↳ </span>{car.carName}
                            <span style={{ marginLeft: 4, color: 'var(--color-text-light)' }}>
                              ({car.tripCount} rit{car.tripCount !== 1 ? 'ten' : ''})
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>{formatKm(car.km)}</td>
                          <td style={{ textAlign: 'right' }}>{formatEuro(car.cost)}</td>
                          <td className="no-print"></td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
                {/* Grand total */}
                <tr className="total-row">
                  <td>Totaal</td>
                  <td style={{ textAlign: 'right' }}>{formatKm(grandTotalKm)}</td>
                  <td style={{ textAlign: 'right' }}>{formatEuro(grandTotalCost)}</td>
                  <td className="no-print"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Per-car summary */}
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>Per auto</div>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Auto</th>
                  <th style={{ textAlign: 'right' }}>Km</th>
                  <th style={{ textAlign: 'right' }}>Kosten</th>
                </tr>
              </thead>
              <tbody>
                {carSummaryRows.map(row => (
                  <tr key={row.carId}>
                    <td>{row.name}</td>
                    <td style={{ textAlign: 'right' }}>{formatKm(row.km)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>
                      {formatEuro(row.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
