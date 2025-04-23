// src/screens/EditPackingScreens.tsx
import { COLORS, FONTS } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTrip } from "context/TripContext";
import { RootStackParamList } from "navigation/AppNavigator";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";

type EditPackingRouteProp = RouteProp<RootStackParamList, "EditPacking">;

interface PackingItem{
  id:string;
  name:string;
  quantity:number;
  isPacked: boolean;
}
export default function EditPackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditPackingRouteProp>();
  const { tripId } = route.params;
  const { trips, updatePacking } = useTrip();
  const trip = trips.find((t) => t.id === tripId);
  
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  
  // Track what's packed vs total
  const packedItemsCount = packingItems.filter(item => item.isPacked).length;
  const totalItemsCount = packingItems.length;

  useEffect(() => {
    if (trip?.packing) {
      try {
        const parsedItems = JSON.parse(trip.packing);
        if (Array.isArray(parsedItems)) {
          setPackingItems(parsedItems);
        }
      } catch (error) {
        console.error('Failed to parse packing items', error);
        setPackingItems([]);
      }
    }
  }, [trip]);

  const handleSave = () => {
    updatePacking(tripId, JSON.stringify(packingItems));
    navigation.goBack();
  };

  const addItem = () => {
    if (newItemName.trim() === '') {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const quantity = parseInt(newItemQuantity) || 1;
    
    const newItem: PackingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: quantity,
      isPacked: false
    };

    setPackingItems([...packingItems, newItem]);
    setNewItemName('');
    setNewItemQuantity('1');
  };

  const toggleItemPacked = (id: string) => {
    setPackingItems(packingItems.map(item => 
      item.id === id ? { ...item, isPacked: !item.isPacked } : item
    ));
  };

  const updateItemQuantity = (id: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 1;
    setPackingItems(packingItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const deleteItem = (id: string) => {
    setPackingItems(packingItems.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: PackingItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={[styles.checkbox, item.isPacked && styles.checkboxChecked]}
        onPress={() => toggleItemPacked(item.id)}
      >
        {item.isPacked && <Feather name="check" size={16} color={COLORS.white} />}
      </TouchableOpacity>
      
      <Text style={[
        styles.itemName, 
        item.isPacked && styles.itemNameChecked
      ]}>
        {item.name}
      </Text>
      
      <View style={styles.quantityContainer}>
        <TextInput
          style={styles.quantityInput}
          value={item.quantity.toString()}
          onChangeText={(text) => updateItemQuantity(item.id, text)}
          keyboardType="numeric"
        />
        <Text style={styles.quantityLabel}>qty</Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Feather name="trash-2" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.heading}>Packing List for {trip.title}</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {packedItemsCount} of {totalItemsCount} items packed
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: totalItemsCount > 0 ? `${(packedItemsCount / totalItemsCount) * 100}%` : 0 }
            ]} 
          />
        </View>
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.itemInput}
          placeholder="Add new item..."
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TextInput
          style={styles.quantityInput}
          placeholder="Qty"
          value={newItemQuantity}
          onChangeText={setNewItemQuantity}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Feather name="plus" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={packingItems}
        renderItem={renderItem}
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
  heading: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: 20,
    color: COLORS.primary,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  itemInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginRight: 10,
  },
  quantityInput: {
    width: 50,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  itemName: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
});
