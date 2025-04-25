import { COLORS, FONTS } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface AddItemFormProps {
  onAddItem: (name: string, quantity: number) => void;
}

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");

  const handleAdd = () => {
    if (!name.trim()) return;
    
    const quantityNum = parseInt(quantity) || 1;
    onAddItem(name.trim(), quantityNum);
    setName("");
    setQuantity("1");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.nameInput}
        placeholder="Add new item..."
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.quantityInput}
        placeholder="Qty"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Feather name="plus" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  nameInput: {
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
    textAlign: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
}); 