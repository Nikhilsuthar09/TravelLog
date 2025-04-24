// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { TripProvider } from "context/TripContext";
import AppNavigator from "navigation/AppNavigator";
import { AuthProvider } from "context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setfontsLoaded] = useState(false);
  const loadFonts = async () => {
      try{
      await Font.loadAsync({
        "Poppins-Regular": require("./src/assets/fonts/Poppins-Regular.ttf"),
        "Poppins-Medium": require("./src/assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Bold": require("./src/assets/fonts/Poppins-Bold.ttf"),
        "Poppins-SemiBold": require("./src/assets/fonts/Poppins-SemiBold.ttf"),
      });
      setfontsLoaded(true);
    }
    catch(error){
      console.warn("Font loading error:", error)
    }
  }

  useEffect(() => {
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <Text> Loading fonts... </Text>;
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