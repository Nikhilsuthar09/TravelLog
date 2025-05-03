// src/screens/EditPackingScreens.tsx
import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTrip } from "@context/TripContext";
import { RootStackParamList } from "@navigation/AppNavigator";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import AddItemForm from "../components/packing/AddItemForm";
import PackingItem from "../components/packing/PackingItem";
import ProgressBar from "../components/packing/ProgressBar";
import CommonEditHeader, { HEADER_CONFIG } from "../components/CommonEditHeader";
import DeleteConfirmationModal from "../components/common/DeleteConfirmationModal";

type EditPackingRouteProp = RouteProp<RootStackParamList, "EditPacking">;

interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  isPacked: boolean;
  note?: string;
}

export default function EditPackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditPackingRouteProp>();
  const { tripId } = route.params;
  const { trips, updatePacking } = useTrip();
  const trip = trips.find((t) => t.id === tripId);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
      note: '',
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

  const updateItemNote = (id: string, note: string) => {
    setPackingItems(
      packingItems.map((item) =>
        item.id === id ? { ...item, note } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setPackingItems(packingItems.filter((item) => item.id !== id));
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
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

  const renderHeader = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.title}>Packing List for {trip.title}</Text>
      <ProgressBar
        packedItems={packedItemsCount}
        totalItems={totalItemsCount}
      />
      <AddItemForm onAddItem={addItem} />
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <CommonEditHeader
        scrollY={scrollY}
        title="Packing List"
        onBackPress={() => navigation.goBack()}
        onSavePress={handleSave}
      />

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />

      <Animated.FlatList
        data={packingItems}
        renderItem={({ item }) => (
          <PackingItem
            id={item.id}
            name={item.name}
            quantity={item.quantity}
            isPacked={item.isPacked}
            note={item.note}
            onTogglePacked={toggleItemPacked}
            onUpdateQuantity={updateItemQuantity}
            onUpdateNote={updateItemNote}
            onDelete={handleDeleteClick}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={1}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: HEADER_CONFIG.HEIGHT + 20,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 20,
  },
});
