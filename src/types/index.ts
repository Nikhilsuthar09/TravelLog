// src/types/index.ts

// Types for the enhanced itinerary feature
export interface ItineraryDay {
  id: string;
  date: string;
  dayNumber: number;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  category: string;
  cost?: number;
  bookingReference?: string;
}

// Trip type used throughout the application
export interface TripNote {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUri?: string;
  structuredItinerary?: string;
  packing?: string;
  expenses?: string;
  categories?: string;
  budget?: number;
  notes: TripNote[];
  packingList?: string;
  createdAt: string;
  updatedAt: string;
}
