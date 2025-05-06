// src/context/TripContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ItineraryDay, Trip } from "../types";
import { db } from "../config/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "./AuthContext";

type TripContextType = {
  trips: Trip[];
  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  updateItinerary: (tripId: string, itinerary: string) => Promise<void>;
  updateStructuredItinerary: (tripId: string, structuredItinerary: ItineraryDay[]) => Promise<void>;
  updatePacking: (tripId: string, packing: string) => Promise<void>;
  updateExpenses: (tripId: string, expenses: string, categories?: string, budget?: number) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const TripProvider = ({ children }: Props) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const { user } = useAuth();

  // Load trips from Firestore on mount and when user changes
  useEffect(() => {
    if (!user) {
      setTrips([]);
      return;
    }

    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData: Trip[] = [];
      snapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() } as Trip);
      });
      setTrips(tripsData);
    }, (error) => {
      console.error("Error fetching trips:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addTrip = async (trip: Trip) => {
    if (!user) throw new Error("User must be logged in to add trips");
    
    const tripWithUser = {
      ...trip,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    const tripRef = doc(collection(db, "trips"));
    await setDoc(tripRef, { ...tripWithUser, id: tripRef.id });
  };

  const deleteTrip = async (id: string) => {
    if (!user) throw new Error("User must be logged in to delete trips");
    
    const tripRef = doc(db, "trips", id);
    await deleteDoc(tripRef);
  };

  const updateItinerary = async (id: string, itinerary: string) => {
    if (!user) throw new Error("User must be logged in to update trips");
    
    const tripRef = doc(db, "trips", id);
    await setDoc(tripRef, { itinerary }, { merge: true });
  };

  const updateStructuredItinerary = async (id: string, structuredItinerary: ItineraryDay[]) => {
    if (!user) throw new Error("User must be logged in to update trips");
    
    const tripRef = doc(db, "trips", id);
    await setDoc(tripRef, { structuredItinerary: JSON.stringify(structuredItinerary) }, { merge: true });
  };

  const updatePacking = async (id: string, packing: string) => {
    if (!user) throw new Error("User must be logged in to update trips");
    
    const tripRef = doc(db, "trips", id);
    await setDoc(tripRef, { packing }, { merge: true });
  };

  const updateExpenses = async (id: string, expenses: string, categories?: string, budget?: number) => {
    if (!user) throw new Error("User must be logged in to update trips");
    
    const tripRef = doc(db, "trips", id);
    const updateData: any = { expenses };
    if (categories) updateData.categories = categories;
    if (budget !== undefined) updateData.budget = budget;
    
    await setDoc(tripRef, updateData, { merge: true });
  };

  const updateTrip = async (updatedTrip: Trip) => {
    if (!user) throw new Error("User must be logged in to update trips");
    
    const tripRef = doc(db, "trips", updatedTrip.id);
    await setDoc(tripRef, { ...updatedTrip, userId: user.uid }, { merge: true });
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        addTrip,
        updateTrip,
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
  if (!context) throw new Error("useTrip must be used inside TripProvider");
  return context;
};