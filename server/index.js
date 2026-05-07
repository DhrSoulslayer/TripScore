'use strict';

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '10mb' })); // images stored as base64

const DATA_DIR = process.env.DATA_DIR || '/data';
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'tripscore.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    licensePlate TEXT NOT NULL DEFAULT '',
    costPerKm    REAL NOT NULL DEFAULT 0,
    imageUrl     TEXT
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trips (
    id           TEXT PRIMARY KEY,
    carId        TEXT NOT NULL,
    driverId     TEXT NOT NULL,
    date         TEXT NOT NULL,
    startAddress TEXT NOT NULL DEFAULT '',
    endAddress   TEXT NOT NULL DEFAULT '',
    kilometers   REAL NOT NULL,
    notes        TEXT NOT NULL DEFAULT '',
    createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const tripColumns = db.prepare("PRAGMA table_info('trips')").all();
if (!tripColumns.some(column => column.name === 'returnTrip')) {
  db.exec('ALTER TABLE trips ADD COLUMN returnTrip INTEGER NOT NULL DEFAULT 0');
}

function mapTripRow(trip) {
  return {
    ...trip,
    returnTrip: Boolean(trip.returnTrip),
  };
}

// ── Cars ──────────────────────────────────────────────────────────────────────

app.get('/api/cars', (_req, res) => {
  res.json(db.prepare('SELECT * FROM cars').all());
});

app.post('/api/cars', (req, res) => {
  const { name, licensePlate = '', costPerKm = 0, imageUrl } = req.body ?? {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO cars (id, name, licensePlate, costPerKm, imageUrl) VALUES (?, ?, ?, ?, ?)',
  ).run(id, name.trim(), licensePlate, Number(costPerKm), imageUrl ?? null);
  res.status(201).json(db.prepare('SELECT * FROM cars WHERE id = ?').get(id));
});

app.put('/api/cars/:id', (req, res) => {
  const { name, licensePlate = '', costPerKm = 0, imageUrl } = req.body ?? {};
  db.prepare(
    'UPDATE cars SET name=?, licensePlate=?, costPerKm=?, imageUrl=? WHERE id=?',
  ).run(name, licensePlate, Number(costPerKm), imageUrl ?? null, req.params.id);
  res.json(db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id));
});

app.delete('/api/cars/:id', (req, res) => {
  db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ── Drivers ───────────────────────────────────────────────────────────────────

app.get('/api/drivers', (_req, res) => {
  res.json(db.prepare('SELECT * FROM drivers').all());
});

app.post('/api/drivers', (req, res) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO drivers (id, name) VALUES (?, ?)').run(id, name.trim());
  res.status(201).json(db.prepare('SELECT * FROM drivers WHERE id = ?').get(id));
});

app.put('/api/drivers/:id', (req, res) => {
  const { name } = req.body ?? {};
  db.prepare('UPDATE drivers SET name=? WHERE id=?').run(name, req.params.id);
  res.json(db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id));
});

app.delete('/api/drivers/:id', (req, res) => {
  db.prepare('DELETE FROM drivers WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ── Trips ─────────────────────────────────────────────────────────────────────

app.get('/api/trips', (_req, res) => {
  res.json(
    db.prepare('SELECT * FROM trips ORDER BY createdAt DESC, date DESC').all().map(mapTripRow),
  );
});

app.post('/api/trips', (req, res) => {
  const {
    carId,
    driverId,
    date,
    startAddress = '',
    endAddress = '',
    returnTrip = false,
    kilometers,
    notes = '',
  } = req.body ?? {};

  if (!carId || !driverId || !date || kilometers == null) {
    return res.status(400).json({ error: 'carId, driverId, date, kilometers are required' });
  }

  const id = crypto.randomUUID();
  db.prepare(
     `INSERT INTO trips
       (id, carId, driverId, date, startAddress, endAddress, returnTrip, kilometers, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
   ).run(
     id,
     carId,
     driverId,
     date,
     startAddress,
     endAddress,
     returnTrip ? 1 : 0,
     Number(kilometers),
     notes,
   );
   res.status(201).json(mapTripRow(db.prepare('SELECT * FROM trips WHERE id = ?').get(id)));
});

app.delete('/api/trips/:id', (req, res) => {
  db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`TripScore API running on port ${PORT}`);
  console.log(`Database: ${path.join(DATA_DIR, 'tripscore.db')}`);
});
