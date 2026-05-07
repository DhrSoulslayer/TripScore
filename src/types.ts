export interface Car {
  id: string;
  name: string;
  licensePlate: string;
  costPerKm: number; // cost in euros per km
  imageUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  carId: string;
  driverId: string;
  date: string; // YYYY-MM-DD
  startAddress: string;
  endAddress: string;
  returnTrip: boolean;
  kilometers: number;
  notes: string;
}

export type Page = 'home' | 'add-trip' | 'trips' | 'admin';
export type AdminTab = 'cars' | 'drivers' | 'report';
