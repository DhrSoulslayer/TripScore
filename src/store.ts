import type { Car, Driver, Trip } from './types';

const KEYS = {
  cars: 'tripscore_cars',
  drivers: 'tripscore_drivers',
  trips: 'tripscore_trips',
} as const;

function load<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getCars: (): Car[] => load<Car[]>(KEYS.cars, []),
  saveCars: (cars: Car[]) => save(KEYS.cars, cars),

  getDrivers: (): Driver[] => load<Driver[]>(KEYS.drivers, []),
  saveDrivers: (drivers: Driver[]) => save(KEYS.drivers, drivers),

  getTrips: (): Trip[] => load<Trip[]>(KEYS.trips, []),
  saveTrips: (trips: Trip[]) => save(KEYS.trips, trips),
};
