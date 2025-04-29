// src/screens/EditExpensesScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTrip } from '../context/TripContext';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseItem from '../components/ExpenseItem';
import CommonEditHeader from '../components/CommonEditHeader';
import { Animated } from 'react-native';

type EditExpensesRouteProp = RouteProp<RootStackParamList, 'EditExpenses'>;

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
}

export default function EditExpensesScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditExpensesRouteProp>();
  const { tripId } = route.params;
  const { trips, updateExpenses } = useTrip();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categories] = useState(['Food', 'Transport', 'Accommodation', 'Shopping', 'Entertainment', 'Other']);
  const [scrollY] = useState(new Animated.Value(0));
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const trip = trips.find(t => t.id === tripId);

  useEffect(() => {
    if (trip?.expenses) {
      try {
        const parsedExpenses = JSON.parse(trip.expenses);
        if (Array.isArray(parsedExpenses)) {
          setExpenses(parsedExpenses);
          const total = parsedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          setTotalSpent(total);
        }
      } catch (error) {
        console.error('Failed to parse expenses:', error);
        setExpenses([]);
      }
    }

    if (trip?.budget) {
      setBudget(trip.budget);
    }
  }, [trip]);

  const handleAddExpense = (newExpense: { category: string; amount: string; description: string }) => {
    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
    };

    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    setTotalSpent(totalSpent + expense.amount);
  };

  const handleEditExpense = (id: string) => {
    const expenseToEdit = expenses.find(e => e.id === id);
    if (expenseToEdit) {
      setEditingExpense(expenseToEdit);
    }
  };

  const handleUpdateExpense = (updatedExpense: { category: string; amount: string; description: string }) => {
    if (!editingExpense) return;

    const expense: Expense = {
      id: editingExpense.id,
      category: updatedExpense.category,
      amount: parseFloat(updatedExpense.amount),
      description: updatedExpense.description,
    };

    const updatedExpenses = expenses.map(e => 
      e.id === editingExpense.id ? expense : e
    );
    
    setExpenses(updatedExpenses);
    setTotalSpent(updatedExpenses.reduce((sum, e) => sum + e.amount, 0));
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (!expenseToDelete) return;

    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    setTotalSpent(totalSpent - expenseToDelete.amount);
  };

  const handleSave = () => {
    const expensesData = JSON.stringify(expenses);
    updateExpenses(tripId, expensesData, budget.toString());
    navigation.goBack();
  };

  const handleModalClose = () => {
    setEditingExpense(null);
  };

  if (!trip) {
    return <Text>Trip not found</Text>;
  }

  return (
    <View style={styles.container}>
      <CommonEditHeader
        scrollY={scrollY}
        title="Expenses"
        onBackPress={() => navigation.goBack()}
        onSavePress={handleSave}
      />

      <Animated.FlatList
        data={expenses}
        renderItem={({ item }) => (
          <ExpenseItem
            id={item.id}
            category={item.category}
            amount={item.amount}
            description={item.description}
            onDelete={handleDeleteExpense}
            onEdit={handleEditExpense}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.budgetContainer}>
              <Text style={styles.budgetLabel}>Trip Budget</Text>
              <Text style={styles.budgetAmount}>₹{budget.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[
                  styles.summaryAmount,
                  budget - totalSpent < 0 && styles.overBudget
                ]}>
                  ₹{Math.abs(budget - totalSpent).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
            <AddExpenseForm
              onAddExpense={editingExpense ? handleUpdateExpense : handleAddExpense}
              categories={categories}
              initialExpense={editingExpense}
              onModalClose={handleModalClose}
            />
          </View>
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
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
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  budgetContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetLabel: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  budgetAmount: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  overBudget: {
    color: COLORS.danger,
  },
  expenseLabel: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  budgetInput: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
});