import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/Modal';
import type { Car } from '../../types';

interface CarFormState {
  name: string;
  licensePlate: string;
  costPerKm: string;
}

function emptyForm(): CarFormState {
  return { name: '', licensePlate: '', costPerKm: '' };
}

function carToForm(car: Car): CarFormState {
  return {
    name: car.name,
    licensePlate: car.licensePlate,
    costPerKm: car.costPerKm > 0 ? String(car.costPerKm) : '',
  };
}

export function CarsPage() {
  const { cars, addCar, updateCar, deleteCar } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState<CarFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setShowModal(true);
  }

  function openEdit(car: Car) {
    setEditing(car);
    setForm(carToForm(car));
    setErrors({});
    setShowModal(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Naam is verplicht';
    const cost = parseFloat(form.costPerKm.replace(',', '.'));
    if (form.costPerKm && (isNaN(cost) || cost < 0)) {
      e.costPerKm = 'Voer een geldig bedrag in (≥ 0)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const cost = parseFloat(form.costPerKm.replace(',', '.'));
    const carData = {
      name: form.name.trim(),
      licensePlate: form.licensePlate.trim(),
      costPerKm: isNaN(cost) ? 0 : cost,
    };
    if (editing) {
      updateCar({ ...editing, ...carData });
    } else {
      addCar(carData);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    deleteCar(id);
    setConfirmDeleteId(null);
  }

  return (
    <>
      <div className="section-header">
        <div className="section-title">Auto's</div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Auto toevoegen
        </button>
      </div>

      {cars.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
            <circle cx="7.5" cy="17.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
          <h3>Geen auto's</h3>
          <p>Voeg een auto toe om ritten te kunnen registreren.</p>
        </div>
      ) : (
        cars.map(car => {
          if (confirmDeleteId === car.id) {
            return (
              <div key={car.id} className="list-item" style={{ borderLeft: '3px solid var(--color-danger)' }}>
                <div className="list-item-info">
                  <div className="list-item-name">Verwijderen: {car.name}?</div>
                  <div className="list-item-meta" style={{ color: 'var(--color-danger)', fontSize: '0.8125rem' }}>
                    Let op: gekoppelde ritten blijven bestaan
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(car.id)}>
                      Verwijderen
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>
                      Annuleren
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={car.id} className="list-item">
              <div className="list-item-icon blue" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
                  <circle cx="7.5" cy="17.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </div>
              <div className="list-item-info">
                <div className="list-item-name">{car.name}</div>
                <div className="list-item-meta">
                  {car.licensePlate && <span>{car.licensePlate} · </span>}
                  {car.costPerKm > 0
                    ? `${car.costPerKm.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}/km`
                    : 'Geen kosten ingesteld'}
                </div>
              </div>
              <div className="list-item-actions">
                <button
                  className="btn btn-icon btn-ghost"
                  onClick={() => openEdit(car)}
                  aria-label={`${car.name} bewerken`}
                  title="Bewerken"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="btn btn-icon btn-ghost"
                  onClick={() => setConfirmDeleteId(car.id)}
                  aria-label={`${car.name} verwijderen`}
                  title="Verwijderen"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })
      )}

      {showModal && (
        <Modal
          title={editing ? 'Auto bewerken' : 'Auto toevoegen'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Annuleren
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editing ? 'Opslaan' : 'Toevoegen'}
              </button>
            </>
          }
        >
          <div className="form">
            <div className="form-group">
              <label className="form-label required" htmlFor="car-name">Naam</label>
              <input
                id="car-name"
                type="text"
                className="form-input"
                placeholder="bijv. Toyota Yaris"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="car-plate">Kenteken</label>
              <input
                id="car-plate"
                type="text"
                className="form-input"
                placeholder="bijv. AB-123-C"
                value={form.licensePlate}
                onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value.toUpperCase() }))}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="car-cost">
                Kosten per kilometer (€)
              </label>
              <input
                id="car-cost"
                type="number"
                inputMode="decimal"
                className="form-input"
                placeholder="bijv. 0.19"
                min="0"
                step="0.01"
                value={form.costPerKm}
                onChange={e => setForm(f => ({ ...f, costPerKm: e.target.value }))}
              />
              {errors.costPerKm && <span className="form-error">{errors.costPerKm}</span>}
              <span className="form-hint">
                De kosten per km worden gebruikt voor de maandrapportage.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
