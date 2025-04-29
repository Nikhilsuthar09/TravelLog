import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

interface AddExpenseFormProps {
  onAddExpense: (category: string, amount: number, description: string) => void;
}

const CATEGORIES = [
  "Accommodation",
  "Transportation",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];

export default function AddExpenseForm({ onAddExpense }: AddExpenseFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!category || !amount) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    onAddExpense(category, numericAmount, description || category);
    setCategory("");
    setAmount("");
    setDescription("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.selectedCategory,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="Amount"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description (optional)"
          placeholderTextColor={COLORS.textSecondary}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity
        style={[styles.addButton, (!category || !amount) && styles.disabledButton]}
        onPress={handleAdd}
        disabled={!category || !amount}
      >
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  inputContainer: {
    gap: 12,
  },
  amountInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.input,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  descriptionInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.input,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  addButtonText: {
    fontSize: FONT_SIZES.button,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
}); 