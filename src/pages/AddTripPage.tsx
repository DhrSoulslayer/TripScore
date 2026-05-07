import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Trip } from '../types';
import { calculateDrivingDistanceKm } from '../utils/routing';

interface AddTripPageProps {
  onSaved: () => void;
  onBack: () => void;
}

type InputMode = 'address' | 'km';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AddTripPage({ onSaved, onBack }: AddTripPageProps) {
  const { cars, drivers, addTrip } = useApp();

  const [carId, setCarId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [date, setDate] = useState(todayString);
  const [mode, setMode] = useState<InputMode>('km');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [returnTrip, setReturnTrip] = useState(false);
  const [kilometers, setKilometers] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [calculatingKm, setCalculatingKm] = useState(false);
  const [calculationError, setCalculationError] = useState('');

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!carId) e.carId = 'Selecteer een auto';
    if (!driverId) e.driverId = 'Selecteer een bestuurder';
    if (!date) e.date = 'Vul een datum in';
    if (mode === 'address') {
      if (!startAddress.trim()) e.startAddress = 'Vul een startadres in';
      if (!endAddress.trim()) e.endAddress = 'Vul een eindadres in';
    }
    const km = parseFloat(kilometers.replace(',', '.'));
    if (!kilometers || isNaN(km) || km <= 0) {
      e.kilometers = mode === 'address'
        ? 'Kilometers worden automatisch berekend na het invullen van beide adressen'
        : 'Vul een geldig aantal kilometers in (> 0)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCalculateKilometers(): Promise<number | null> {
    const start = startAddress.trim();
    const end = endAddress.trim();

    if (!start || !end) {
      setErrors(prev => ({
        ...prev,
        startAddress: !start ? 'Vul een startadres in' : prev.startAddress,
        endAddress: !end ? 'Vul een eindadres in' : prev.endAddress,
      }));
      return null;
    }

    setCalculationError('');
    setCalculatingKm(true);
    try {
      const km = await calculateDrivingDistanceKm(start, end, returnTrip);
      setKilometers(String(km));
      setErrors(prev => {
        const next = { ...prev };
        delete next.kilometers;
        return next;
      });
      return km;
    } catch {
      setCalculationError('Kilometers konden niet worden berekend. Controleer de adressen en probeer opnieuw.');
      return null;
    } finally {
      setCalculatingKm(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'address') {
      const km = parseFloat(kilometers.replace(',', '.'));
      if (!kilometers || isNaN(km) || km <= 0) {
        const calculated = await handleCalculateKilometers();
        if (!calculated || calculated <= 0) return;
      }
    }
    if (!validate()) return;
    setSaving(true);
    const km = parseFloat(kilometers.replace(',', '.'));
    const trip: Omit<Trip, 'id'> = {
      carId,
      driverId,
      date,
      startAddress: mode === 'address' ? startAddress.trim() : '',
      endAddress: mode === 'address' ? endAddress.trim() : '',
      returnTrip: mode === 'address' ? returnTrip : false,
      kilometers: km,
      notes: notes.trim(),
    };
    addTrip(trip);
    setSaving(false);
    onSaved();
  }

  return (
    <div className="page">
      <header className="page-header">
        <button className="back-btn" onClick={onBack} aria-label="Terug">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Rit toevoegen</h1>
      </header>

      <main className="page-content">
        {cars.length === 0 || drivers.length === 0 ? (
          <div className="alert alert-warning" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              {cars.length === 0 && drivers.length === 0
                ? 'Voeg eerst auto\'s en bestuurders toe via Beheer.'
                : cars.length === 0
                ? 'Voeg eerst een auto toe via Beheer.'
                : 'Voeg eerst een bestuurder toe via Beheer.'}
            </span>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit} noValidate>
            {/* Car */}
            <div className="form-group">
              <label className="form-label required" htmlFor="car-select">Auto</label>
              <select
                id="car-select"
                className="form-select"
                value={carId}
                onChange={e => setCarId(e.target.value)}
                required
              >
                <option value="">— Selecteer auto —</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.name} {car.licensePlate ? `(${car.licensePlate})` : ''}
                  </option>
                ))}
              </select>
              {errors.carId && <span className="form-error">{errors.carId}</span>}
            </div>

            {/* Driver */}
            <div className="form-group">
              <label className="form-label required" htmlFor="driver-select">Bestuurder</label>
              <select
                id="driver-select"
                className="form-select"
                value={driverId}
                onChange={e => setDriverId(e.target.value)}
                required
              >
                <option value="">— Selecteer bestuurder —</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
              {errors.driverId && <span className="form-error">{errors.driverId}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label required" htmlFor="trip-date">Datum</label>
              <input
                id="trip-date"
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            {/* Input mode toggle */}
            <div className="form-group">
              <label className="form-label">Invoermethode</label>
              <div className="toggle-group" role="group" aria-label="Invoermethode">
                <button
                  type="button"
                  className={`toggle-btn${mode === 'km' ? ' active' : ''}`}
                  onClick={() => {
                    setMode('km');
                    setReturnTrip(false);
                    setCalculationError('');
                  }}
                  aria-pressed={mode === 'km'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true"
                    style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Kilometers
                </button>
                <button
                  type="button"
                  className={`toggle-btn${mode === 'address' ? ' active' : ''}`}
                  onClick={() => {
                    setMode('address');
                    setReturnTrip(false);
                    setKilometers('');
                    setCalculationError('');
                  }}
                  aria-pressed={mode === 'address'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true"
                    style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Met adres
                </button>
              </div>
            </div>

            {/* Address fields */}
            {mode === 'address' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="start-address">Startadres</label>
                  <input
                    id="start-address"
                    type="text"
                    className="form-input"
                    placeholder="bijv. Dorpsstraat 1, Amsterdam"
                    value={startAddress}
                    onChange={e => {
                      setStartAddress(e.target.value);
                      setCalculationError('');
                      setKilometers('');
                    }}
                    autoComplete="street-address"
                  />
                  {errors.startAddress && <span className="form-error">{errors.startAddress}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="end-address">Eindadres</label>
                  <input
                    id="end-address"
                    type="text"
                    className="form-input"
                    placeholder="bijv. Stationsplein 1, Utrecht"
                    value={endAddress}
                    onChange={e => {
                      setEndAddress(e.target.value);
                      setCalculationError('');
                      setKilometers('');
                    }}
                    autoComplete="street-address"
                  />
                  {errors.endAddress && <span className="form-error">{errors.endAddress}</span>}
                </div>
                <label
                  className="form-label"
                  htmlFor="return-trip"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                >
                  <input
                    id="return-trip"
                    type="checkbox"
                    checked={returnTrip}
                    onChange={e => {
                      setReturnTrip(e.target.checked);
                      setCalculationError('');
                      setKilometers('');
                    }}
                  />
                  Retour
                </label>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void handleCalculateKilometers()}
                  disabled={calculatingKm}
                >
                  {calculatingKm ? 'Berekenen...' : 'Bereken kilometers'}
                </button>
              </>
            )}

            {/* Kilometers */}
            <div className="form-group">
              <label className="form-label required" htmlFor="kilometers">
                {mode === 'address' ? 'Gereden kilometers' : 'Kilometers'}
              </label>
              <input
                id="kilometers"
                type="number"
                inputMode="decimal"
                className="form-input"
                placeholder={mode === 'address' ? 'Wordt automatisch berekend' : 'bijv. 42.5'}
                min="0.1"
                step="0.1"
                value={kilometers}
                onChange={e => setKilometers(e.target.value)}
                readOnly={mode === 'address'}
                required
              />
              {errors.kilometers && <span className="form-error">{errors.kilometers}</span>}
              {calculationError && <span className="form-error">{calculationError}</span>}
              {carId && (() => {
                const car = cars.find(c => c.id === carId);
                const km = parseFloat(kilometers.replace(',', '.'));
                if (car && car.costPerKm > 0 && !isNaN(km) && km > 0) {
                  const cost = km * car.costPerKm;
                  return (
                    <span className="form-hint" style={{ color: 'var(--color-success)' }}>
                      ≈ {cost.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}
                      &nbsp;({car.costPerKm.toLocaleString('nl-NL', {
                        style: 'currency', currency: 'EUR',
                      })}/km)
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notities</label>
              <textarea
                id="notes"
                className="form-textarea"
                placeholder="Optionele opmerkingen..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={saving}
            >
              {saving ? 'Opslaan...' : 'Rit opslaan'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
