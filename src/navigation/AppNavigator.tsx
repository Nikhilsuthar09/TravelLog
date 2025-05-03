// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import TripDetailsScreen from "@screens/TripDetailsScreen";
import EditItineraryScreen from "@screens/EditItineraryScreen";
import EditPackingScreen from "@screens/EditPackingScreen";
import EditExpensesScreen from "@screens/EditExpensesScreen";
import EditNotesScreen from '@screens/EditNotesScreen';
import { Trip } from "types";
import { NavigatorScreenParams } from "@react-navigation/native";
import SplashScreen from "@screens/SplashScreen";
import AuthScreen from "@screens/AuthScreen";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  TripDetails: Trip;
  EditItinerary: { tripId: string };
  EditPacking: { tripId: string };
  EditExpenses: { tripId: string };
  EditNotes: { tripId: string };
  Weather: { tripId: string };
  QuickNotes: { tripId: string };
}

export type BottomTabParamList = {
  Home: undefined;
  Trips: { showAddModal?: boolean } | undefined;
  Notes: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator(){
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="Auth" component={AuthScreen}/>
      <Stack.Screen  name="Tabs" component={BottomTabs}/>
      <Stack.Screen 
      name="TripDetails" component={TripDetailsScreen}
      options={{headerShown:false, title: "Trip Details"}}
      />
      <Stack.Screen 
      name="EditItinerary"
      component={EditItineraryScreen}
      options={{title:"Edit Itinerary"}} />
      <Stack.Screen 
      name="EditPacking"
      component={EditPackingScreen}
      options={{title: "Edit Packing"}}/>

      <Stack.Screen 
      name="EditExpenses"
      component={EditExpensesScreen}
      options={{title: "Edit Expenses"}}/>

      <Stack.Screen 
      name="EditNotes"
      component={EditNotesScreen}
      options={{title: "Edit Notes"}}/>
    </Stack.Navigator>
  )
}