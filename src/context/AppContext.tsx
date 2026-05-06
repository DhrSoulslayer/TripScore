import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Car, Driver, Trip } from '../types';
import { store } from '../store';

interface AppContextType {
  cars: Car[];
  drivers: Driver[];
  trips: Trip[];
  addCar: (car: Omit<Car, 'id'>) => void;
  updateCar: (car: Car) => void;
  deleteCar: (id: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (id: string) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  deleteTrip: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<Car[]>(() => store.getCars());
  const [drivers, setDrivers] = useState<Driver[]>(() => store.getDrivers());
  const [trips, setTrips] = useState<Trip[]>(() => store.getTrips());

  const addCar = useCallback((carData: Omit<Car, 'id'>) => {
    const car: Car = { ...carData, id: crypto.randomUUID() };
    setCars(prev => {
      const updated = [...prev, car];
      store.saveCars(updated);
      return updated;
    });
  }, []);

  const updateCar = useCallback((car: Car) => {
    setCars(prev => {
      const updated = prev.map(c => (c.id === car.id ? car : c));
      store.saveCars(updated);
      return updated;
    });
  }, []);

  const deleteCar = useCallback((id: string) => {
    setCars(prev => {
      const updated = prev.filter(c => c.id !== id);
      store.saveCars(updated);
      return updated;
    });
  }, []);

  const addDriver = useCallback((driverData: Omit<Driver, 'id'>) => {
    const driver: Driver = { ...driverData, id: crypto.randomUUID() };
    setDrivers(prev => {
      const updated = [...prev, driver];
      store.saveDrivers(updated);
      return updated;
    });
  }, []);

  const updateDriver = useCallback((driver: Driver) => {
    setDrivers(prev => {
      const updated = prev.map(d => (d.id === driver.id ? driver : d));
      store.saveDrivers(updated);
      return updated;
    });
  }, []);

  const deleteDriver = useCallback((id: string) => {
    setDrivers(prev => {
      const updated = prev.filter(d => d.id !== id);
      store.saveDrivers(updated);
      return updated;
    });
  }, []);

  const addTrip = useCallback((tripData: Omit<Trip, 'id'>) => {
    const trip: Trip = { ...tripData, id: crypto.randomUUID() };
    setTrips(prev => {
      const updated = [trip, ...prev];
      store.saveTrips(updated);
      return updated;
    });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => {
      const updated = prev.filter(t => t.id !== id);
      store.saveTrips(updated);
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        cars,
        drivers,
        trips,
        addCar,
        updateCar,
        deleteCar,
        addDriver,
        updateDriver,
        deleteDriver,
        addTrip,
        deleteTrip,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
