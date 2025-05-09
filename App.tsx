// App.tsx
import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Text, View } from "react-native";
import { TripProvider } from "./src/context/TripContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

// Import fonts
const PoppinsRegular = require('./assets/fonts/Poppins-Regular.ttf');
const PoppinsMedium = require('./assets/fonts/Poppins-Medium.ttf');
const PoppinsBold = require('./assets/fonts/Poppins-Bold.ttf');
const PoppinsSemiBold = require('./assets/fonts/Poppins-SemiBold.ttf');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Poppins-Regular': PoppinsRegular,
        'Poppins-Medium': PoppinsMedium,
        'Poppins-Bold': PoppinsBold,
        'Poppins-SemiBold': PoppinsSemiBold,
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error("Font loading error:", error);
      setFontError(error instanceof Error ? error.message : "Failed to load fonts");
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error loading fonts: {fontError}</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null; // Keep splash screen visible
  }

  return (
    <AuthProvider>
      <TripProvider>
        <NavigationContainer onReady={onLayoutRootView}>
          <AppNavigator />
        </NavigationContainer>
      </TripProvider>
    </AuthProvider>
  );
}