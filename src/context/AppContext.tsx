import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Car, Driver, Trip } from '../types';
import { store } from '../store';

interface AppContextType {
  cars: Car[];
  drivers: Driver[];
  trips: Trip[];
  loading: boolean;
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
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data from API on mount
  useEffect(() => {
    Promise.all([store.getCars(), store.getDrivers(), store.getTrips()])
      .then(([c, d, t]) => {
        setCars(c);
        setDrivers(d);
        setTrips(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const addCar = useCallback((carData: Omit<Car, 'id'>) => {
    void store.addCarRemote(carData).then(car => {
      setCars(prev => [...prev, car]);
    });
  }, []);

  const updateCar = useCallback((car: Car) => {
    void store.updateCarRemote(car).then(updated => {
      setCars(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    });
  }, []);

  const deleteCar = useCallback((id: string) => {
    void store.deleteCarRemote(id).then(() => {
      setCars(prev => prev.filter(c => c.id !== id));
    });
  }, []);

  const addDriver = useCallback((driverData: Omit<Driver, 'id'>) => {
    void store.addDriverRemote(driverData).then(driver => {
      setDrivers(prev => [...prev, driver]);
    });
  }, []);

  const updateDriver = useCallback((driver: Driver) => {
    void store.updateDriverRemote(driver).then(updated => {
      setDrivers(prev => prev.map(d => (d.id === updated.id ? updated : d)));
    });
  }, []);

  const deleteDriver = useCallback((id: string) => {
    void store.deleteDriverRemote(id).then(() => {
      setDrivers(prev => prev.filter(d => d.id !== id));
    });
  }, []);

  const addTrip = useCallback((tripData: Omit<Trip, 'id'>) => {
    void store.addTripRemote(tripData).then(trip => {
      setTrips(prev => [trip, ...prev]);
    });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    void store.deleteTripRemote(id).then(() => {
      setTrips(prev => prev.filter(t => t.id !== id));
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        cars,
        drivers,
        trips,
        loading,
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
