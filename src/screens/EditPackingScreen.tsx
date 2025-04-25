// src/screens/EditPackingScreens.tsx
import { COLORS, FONTS } from "@constants/theme";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTrip } from "context/TripContext";
import { RootStackParamList } from "navigation/AppNavigator";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import AddItemForm from "../components/packing/AddItemForm";
import PackingItem from "../components/packing/PackingItem";
import ProgressBar from "../components/packing/ProgressBar";

type EditPackingRouteProp = RouteProp<RootStackParamList, "EditPacking">;

interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  isPacked: boolean;
}

export default function EditPackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditPackingRouteProp>();
  const { tripId } = route.params;
  const { trips, updatePacking } = useTrip();
  const trip = trips.find((t) => t.id === tripId);

  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);

  useEffect(() => {
    if (trip?.packing) {
      try {
        const parsedItems = JSON.parse(trip.packing);
        if (Array.isArray(parsedItems)) {
          setPackingItems(parsedItems);
        }
      } catch (error) {
        console.error("Failed to parse packing items", error);
        setPackingItems([]);
      }
    }
  }, [trip]);

  const handleSave = () => {
    updatePacking(tripId, JSON.stringify(packingItems));
    navigation.goBack();
  };

  const addItem = (name: string, quantity: number) => {
    const newItem: PackingItem = {
      id: Date.now().toString(),
      name,
      quantity,
      isPacked: false,
    };

    setPackingItems([...packingItems, newItem]);
  };

  const toggleItemPacked = (id: string) => {
    setPackingItems(
      packingItems.map((item) =>
        item.id === id ? { ...item, isPacked: !item.isPacked } : item
      )
    );
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setPackingItems(
      packingItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setPackingItems(packingItems.filter((item) => item.id !== id));
  };

  const packedItemsCount = packingItems.filter((item) => item.isPacked).length;
  const totalItemsCount = packingItems.length;

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.title}>Packing List for {trip.title}</Text>

      <ProgressBar
        packedItems={packedItemsCount}
        totalItems={totalItemsCount}
      />

      <AddItemForm onAddItem={addItem} />

      <FlatList
        data={packingItems}
        renderItem={({ item }) => (
          <PackingItem
            id={item.id}
            name={item.name}
            quantity={item.quantity}
            isPacked={item.isPacked}
            onTogglePacked={toggleItemPacked}
            onUpdateQuantity={updateItemQuantity}
            onDelete={deleteItem}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
