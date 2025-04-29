import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

interface PackingItemProps {
  id: string;
  name: string;
  quantity: number;
  isPacked: boolean;
  onTogglePacked: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
}

export default function PackingItem({
  id,
  name,
  quantity,
  isPacked,
  onTogglePacked,
  onUpdateQuantity,
  onDelete,
}: PackingItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, isPacked && styles.checkboxChecked]}
        onPress={() => onTogglePacked(id)}
      >
        {isPacked && <Feather name="check" size={16} color={COLORS.white} />}
      </TouchableOpacity>

      <Text style={[styles.name, isPacked && styles.nameChecked]}>{name}</Text>

      <View style={styles.quantityContainer}>
        <TextInput
          style={styles.quantityInput}
          value={quantity.toString()}
          onChangeText={(text) => {
            const newQuantity = parseInt(text) || 1;
            onUpdateQuantity(id, newQuantity);
          }}
          keyboardType="numeric"
          scrollEnabled={false}
          numberOfLines={1}
          textAlign="center"
          textAlignVertical="center"
        />
        <Text style={styles.quantityLabel}>qty</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(id)}>
        <Feather name="trash-2" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  nameChecked: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  quantityInput: {
    width: 40,
    height: 32,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    textAlign: "center",
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.input,
    marginRight: 4,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  quantityLabel: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
}); 