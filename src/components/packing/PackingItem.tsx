import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

interface PackingItemProps {
  id: string;
  name: string;
  quantity: number;
  isPacked: boolean;
  note?: string;
  onTogglePacked: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}

export default function PackingItem({
  id,
  name,
  quantity,
  isPacked,
  note = '',
  onTogglePacked,
  onUpdateQuantity,
  onUpdateNote,
  onDelete,
}: PackingItemProps) {
  const [isNoteVisible, setIsNoteVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, isPacked && styles.checkboxChecked]}
        onPress={() => onTogglePacked(id)}
      >
        {isPacked && <Feather name="check" size={16} color={COLORS.white} />}
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={[styles.name, isPacked && styles.nameChecked]}>{name}</Text>

          <View style={styles.quantityContainer}>
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(text) => {
                if (text === '') {
                  onUpdateQuantity(id, 0);
                } else {
                  const newQuantity = parseInt(text) || 0;
                  onUpdateQuantity(id, newQuantity);
                }
              }}
              keyboardType="numeric"
              scrollEnabled={false}
              numberOfLines={1}
              textAlign="center"
              textAlignVertical="center"
            />
            <Text style={styles.quantityLabel}>qty</Text>
          </View>

          <TouchableOpacity 
            style={styles.noteButton} 
            onPress={() => setIsNoteVisible(!isNoteVisible)}
          >
            <Feather 
              name={isNoteVisible ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(id)}>
            <Feather name="trash-2" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        {isNoteVisible && (
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={(text) => onUpdateNote(id, text)}
              placeholder="Add a note..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
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
  noteButton: {
    padding: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  noteContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  noteInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 8,
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    minHeight: 40,
  },
}); 