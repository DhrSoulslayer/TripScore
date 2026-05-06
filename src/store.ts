import type { Car, Driver, Trip } from './types';

const BASE = '/api';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`API ${method} ${path} → ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const store = {
  getCars: () => request<Car[]>('GET', '/cars'),
  addCarRemote: (car: Omit<Car, 'id'>) => request<Car>('POST', '/cars', car),
  updateCarRemote: (car: Car) => request<Car>('PUT', `/cars/${car.id}`, car),
  deleteCarRemote: (id: string) => request<void>('DELETE', `/cars/${id}`),

  getDrivers: () => request<Driver[]>('GET', '/drivers'),
  addDriverRemote: (driver: Omit<Driver, 'id'>) => request<Driver>('POST', '/drivers', driver),
  updateDriverRemote: (driver: Driver) => request<Driver>('PUT', `/drivers/${driver.id}`, driver),
  deleteDriverRemote: (id: string) => request<void>('DELETE', `/drivers/${id}`),

  getTrips: () => request<Trip[]>('GET', '/trips'),
  addTripRemote: (trip: Omit<Trip, 'id'>) => request<Trip>('POST', '/trips', trip),
  deleteTripRemote: (id: string) => request<void>('DELETE', `/trips/${id}`),
};
