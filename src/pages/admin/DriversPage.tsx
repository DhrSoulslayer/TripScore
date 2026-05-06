import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/Modal';
import type { Driver } from '../../types';

export function DriversPage() {
  const { drivers, trips, addDriver, updateDriver, deleteDriver } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setName('');
    setNameError('');
    setShowModal(true);
  }

  function openEdit(driver: Driver) {
    setEditing(driver);
    setName(driver.name);
    setNameError('');
    setShowModal(true);
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError('Naam is verplicht');
      return;
    }
    if (editing) {
      updateDriver({ ...editing, name: name.trim() });
    } else {
      addDriver({ name: name.trim() });
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    deleteDriver(id);
    setConfirmDeleteId(null);
  }

  function tripCountForDriver(driverId: string): number {
    return trips.filter(t => t.driverId === driverId).length;
  }

  return (
    <>
      <div className="section-header">
        <div className="section-title">Bestuurders</div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Bestuurder toevoegen
        </button>
      </div>

      {drivers.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3>Geen bestuurders</h3>
          <p>Voeg bestuurders toe om ritten te kunnen registreren.</p>
        </div>
      ) : (
        drivers.map(driver => {
          const tripCount = tripCountForDriver(driver.id);

          if (confirmDeleteId === driver.id) {
            return (
              <div key={driver.id} className="list-item" style={{ borderLeft: '3px solid var(--color-danger)' }}>
                <div className="list-item-info">
                  <div className="list-item-name">Verwijderen: {driver.name}?</div>
                  <div className="list-item-meta" style={{ color: 'var(--color-danger)', fontSize: '0.8125rem' }}>
                    {tripCount > 0
                      ? `Let op: ${tripCount} rit${tripCount !== 1 ? 'ten' : ''} gekoppeld aan deze bestuurder`
                      : 'Deze bestuurder heeft nog geen ritten'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(driver.id)}>
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
            <div key={driver.id} className="list-item">
              <div className="list-item-icon green" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="list-item-info">
                <div className="list-item-name">{driver.name}</div>
                <div className="list-item-meta">
                  {tripCount} rit{tripCount !== 1 ? 'ten' : ''}
                </div>
              </div>
              <div className="list-item-actions">
                <button
                  className="btn btn-icon btn-ghost"
                  onClick={() => openEdit(driver)}
                  aria-label={`${driver.name} bewerken`}
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
                  onClick={() => setConfirmDeleteId(driver.id)}
                  aria-label={`${driver.name} verwijderen`}
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
          title={editing ? 'Bestuurder bewerken' : 'Bestuurder toevoegen'}
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
              <label className="form-label required" htmlFor="driver-name">Naam</label>
              <input
                id="driver-name"
                type="text"
                className="form-input"
                placeholder="bijv. Jan de Vries"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                autoFocus
                autoComplete="name"
              />
              {nameError && <span className="form-error">{nameError}</span>}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
