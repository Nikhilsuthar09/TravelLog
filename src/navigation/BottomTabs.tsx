// src/navigation/BottomTabs.tsx 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import TripsScreen from "../screens/TripsScreen";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@constants/theme";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Define explicit icon names as string literals
          if (route.name === "Home") {
            return <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />;
          } else if (route.name === "Trips") {
            return <Ionicons 
              name={focused ? "airplane" : "airplane-outline"} 
              size={size} 
              color={color} 
            />;
          }
          
          // Default icon (shouldn't reach here)
          return <Ionicons name="help-outline" size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
        headerStyle:{
          backgroundColor:COLORS.background
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          elevation: 8, // Add shadow for Android
          shadowOpacity: 0.1, // Add shadow for iOS
          shadowRadius: 4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
      <Tab.Screen name="Trips" component={TripsScreen} options={{headerShown: false}}/>
    </Tab.Navigator>
  );
}
