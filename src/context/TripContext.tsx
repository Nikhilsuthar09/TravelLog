// src/context/TripContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState  } from "react";
import { ItineraryDay, Trip } from "types";
import AsyncStorage from "@react-native-async-storage/async-storage";


type TripContextType = {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  updateItinerary: (tripId:string, itinerary:string) => void;
  updateStructuredItinerary:(tripId:string, structuredItinerary:ItineraryDay[]) => void;
  updatePacking: (tripId:string, packing:string) => void;
  updateExpenses:(tripId: string, expenses: string, categories?:string, budget?:number) =>void;
  deleteTrip: (tripId: string) => void;
};
// Add this function to the tripProvider component


const TripContext = createContext<TripContextType | undefined>(undefined);
interface Props {
  children: ReactNode;
}
export const TripProvider = ({ children }: Props) => {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load trips from storage on mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const tripsString = await AsyncStorage.getItem("trips");
        if (tripsString) {
          setTrips(JSON.parse(tripsString));
        }
      } catch (error) {
        console.error("Failed to load trips", error);
      }
    };

    loadTrips();
  }, []);

  // Save trips to storage whenever they change
  useEffect(() => {
    const saveTrips = async () => {
      try {
        await AsyncStorage.setItem("trips", JSON.stringify(trips));
      } catch (error) {
        console.error("Failed to save trips", error);
      }
    };

    saveTrips();
  }, [trips]);

  const addTrip = (trip: Trip) => {
    setTrips((currentTrips) => [...currentTrips, trip]);
  };

  const deleteTrip = (id: string) => {
    setTrips((currentTrips) => currentTrips.filter((trip) => trip.id !== id));
  };

  const updateItinerary = (id: string, itinerary: string) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === id ? { ...trip, itinerary } : trip
      )
    );
  };

  const updateStructuredItinerary = (id:string, structuredItinerary:ItineraryDay[]) => {
    setTrips((currentTrips) => 
    currentTrips.map((trip) => 
    trip.id === id ? { ...trip, structuredItinerary: JSON.stringify(structuredItinerary) }: trip
    )
    )
  } 

  const updatePacking = (id: string, packing: string) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => (trip.id === id ? { ...trip, packing } : trip))
    );
  };

  const updateExpenses = (id: string, expenses: string, categories?: string, budget?: number) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => 
        trip.id === id 
          ? { 
              ...trip, 
              expenses,
              ...(categories && { categories }),
              ...(budget !== undefined && { budget })
            } 
          : trip
      )
    );
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        addTrip,
        updateItinerary,
        updateStructuredItinerary,
        updatePacking,
        updateExpenses,
        deleteTrip
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
export const useTrip = () => {
  const context = useContext(TripContext);
  if(!context) throw new Error("useTrip must be used inside TripProvider")
  return context;
}