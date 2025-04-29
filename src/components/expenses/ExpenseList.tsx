import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expenses added yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseItem}>
          <View style={styles.expenseDetails}>
            <Text style={styles.category}>{expense.category}</Text>
            {expense.description !== expense.category && (
              <Text style={styles.description}>{expense.description}</Text>
            )}
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(expense.id)}
            >
              <Feather name="trash-2" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
  },
  expenseDetails: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
}); 