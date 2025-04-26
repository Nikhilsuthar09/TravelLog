// src/screens/EditExpensesScreen.tsx
import { COLORS, FONTS } from "@constants/theme";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTrip } from "context/TripContext";
import { RootStackParamList } from "navigation/AppNavigator";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import CommonEditHeader, { HEADER_CONFIG } from "../components/CommonEditHeader";
import { Animated } from "react-native";
import ProgressBar from "../components/ProgressBar";
import AddExpenseForm from "../components/AddExpenseForm";
import ExpenseItem from "../components/ExpenseItem";
import { FlatList } from "react-native";

type EditExpensesRouteProp = RouteProp<RootStackParamList, 'EditExpenses'>;
interface Expense{
  id:string;
  category:string;
  amount: number;
  description:string;
  date: string;
}

export default function EditExpensesScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditExpensesRouteProp>();
  const { tripId } = route.params;
  const { trips, updateExpenses } = useTrip();
  const trip = trips.find((t) => t.id === tripId);
  // state for expenses management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(trip?.budget ? trip.budget.toString():'');
  const [totalSpent, setTotalSpent] = useState(0);
  
  // State for adding a new expense
  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('');

  // state for category management
  const [categories, setCategories] = useState<string[]>(['Food', 'Petrol', 'Hotel']);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false)
  const [newCategory, setNewCategory] = useState('');

  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
     // Parse existing expenses if they exist
    if (trip?.expenses) {
      try {
        const parsedExpenses = JSON.parse(trip.expenses);
        if(Array.isArray(parsedExpenses)){
          setExpenses(parsedExpenses);

          // calculate total
          const total = parsedExpenses.reduce((sum, expense)=> sum + expense.amount, 0);
          setTotalSpent(total)
        }
      } catch (error) {
          // If the expenses aren't in JSON format, set empty expenses
        setExpenses([]);
      }
    }
    // Load saved categories if they exist
    if (trip?.categories) {
      try {
        const parsedCategories = JSON.parse(trip.categories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setCategories(parsedCategories);
        }
      } catch (error) {
        // Keep default categories if parsing fails
      }
    }
    
    // Set budget
    if (trip?.budget) {
      setBudget(trip.budget.toString());
    }
  }, [trip]);

  const handleSave = () => {
    const expensesData = JSON.stringify(expenses);
    const categoriesData = JSON.stringify(categories);
    updateExpenses(tripId, expensesData, categoriesData, parseFloat(budget) || 0);
    navigation.goBack();
  };

   const addExpense = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount');
      return;
    }
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      category: selectedCategory,
      amount: parseFloat(amount),
      description: description || selectedCategory,
      date: new Date().toISOString(),
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    // Update total spent
    const newTotal = totalSpent + parseFloat(amount);
    setTotalSpent(newTotal);
    
    // Reset form fields
    setAmount('');
    setDescription('');
    setIsAddExpenseModalVisible(false);
  };

  const removeExpense = (id: string) => {
    const expenseToRemove = expenses.find(e => e.id === id);
    if(!expenseToRemove) return

    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);

    // update total spent
    const newTotal = totalSpent - expenseToRemove.amount;
    setTotalSpent(newTotal);
  }
  const addCategory = () => {
    if(!newCategory.trim()){
      Alert.alert('Invalid Category', 'Please enter a category name')
      return;
    }
    if(categories.includes(newCategory.trim())){
      Alert.alert('Duplicate Category', 'This category already exists')
      return;
    }
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    setNewCategory('');
    setIsAddCategoryModalVisible(false);
  };
  // Format currency function
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }
  if (!trip) {
    return <Text>Trip not found</Text>;
  }

  const renderHeader = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.title}>Expenses for {trip.title}</Text>
      <ProgressBar
        totalExpenses={totalSpent}
        budget={parseFloat(budget)}
      />
      <AddExpenseForm onAddExpense={addExpense} />
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Custom Animated Header */}
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
            description={item.description}
            amount={item.amount}
            category={item.category}
            date={item.date}
            onUpdate={removeExpense}
            onDelete={removeExpense}
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
    paddingTop: HEADER_CONFIG.HEIGHT + 20, // Add padding to account for header height
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
});