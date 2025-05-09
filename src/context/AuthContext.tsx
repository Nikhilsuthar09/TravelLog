import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, setPersistence, inMemoryPersistence, sendPasswordResetEmail } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For Expo/React Native, we'll use inMemoryPersistence
    // This will keep the user logged in during the app session
    setPersistence(auth, inMemoryPersistence)
      .catch((error) => {
        // console.error("Error setting auth persistence:", error); // Remove or comment out for production
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Extract first name from full name
      const firstName = fullName.split(' ')[0];
      // Capitalize first letter
      const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: formattedName
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // If user doesn't have a display name, set it to their email username
      if (userCredential.user && !userCredential.user.displayName) {
        const emailUsername = email.split('@')[0];
        // Take only the first part before any dots or underscores
        const firstName = emailUsername.split(/[._]/)[0];
        // Capitalize first letter
        const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        await updateProfile(userCredential.user, {
          displayName: formattedName
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Explicitly set user to null on sign out
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut: handleSignOut,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};