// src/screens/EditExpensesScreen.tsx
import { COLORS, FONTS } from "@constants/theme";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTrip } from "context/TripContext";
import { RootStackParamList } from "navigation/AppNavigator";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type EditExpensesRouteProp = RouteProp<RootStackParamList, 'EditExpenses'>;
interface Expense{
  id:string;
  category:string;
  amount: number;
  description:string;
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

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.heading}>Expenses for {trip.title}</Text>
      
      {/* Budget Section */}
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetLabel}>Trip Budget (₹):</Text>
        <TextInput
          style={styles.budgetInput}
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          placeholder="Enter your budget"
        />
      </View>
      
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total Spent: {formatCurrency(totalSpent)}
        </Text>
        {budget ? (
          <Text style={[
            styles.balanceText,
            parseFloat(budget) < totalSpent ? styles.overBudget : {}
          ]}>
            {parseFloat(budget) >= totalSpent 
              ? `Remaining: ${formatCurrency(parseFloat(budget) - totalSpent)}`
              : `Over Budget by: ${formatCurrency(totalSpent - parseFloat(budget))}`
            }
          </Text>
        ) : null}
      </View>
      
      {/* Expenses List */}
      <View style={styles.expensesListContainer}>
        <Text style={styles.sectionTitle}>Your Expenses</Text>
        
        {expenses.length === 0 ? (
          <Text style={styles.noExpensesText}>No expenses added yet</Text>
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseDescription}>
                  {expense.description !== expense.category ? expense.description : ''}
                </Text>
              </View>
              <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => removeExpense(expense.id)}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddExpenseModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>
      
      {/* Categories Management */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity 
            style={styles.addCategoryButton}
            onPress={() => setIsAddCategoryModalVisible(true)}
          >
            <Text style={styles.addCategoryButtonText}>+ Add Category</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoriesList}>
          {categories.map((category) => (
            <View key={category} style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Expenses</Text>
      </TouchableOpacity>
    </ScrollView>
    
    {/* Add Expense Modal */}
    <Modal
      visible={isAddExpenseModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setIsAddExpenseModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Expense</Text>
          
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.categorySelectorItem,
                  selectedCategory === category && styles.selectedCategorySelectorItem
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categorySelectorText,
                  selectedCategory === category && styles.selectedCategorySelectorText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.modalInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
          />
          
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.modalInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
          />
          
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setIsAddExpenseModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalAddButton}
              onPress={addExpense}
            >
              <Text style={styles.modalAddButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    
    {/* Add Category Modal */}
    <Modal
      visible={isAddCategoryModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setIsAddCategoryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Category</Text>
          
          <Text style={styles.inputLabel}>Category Name</Text>
          <TextInput
            style={styles.modalInput}
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="Enter category name"
          />
          
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setIsAddCategoryModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalAddButton}
              onPress={addCategory}
            >
              <Text style={styles.modalAddButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
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
  budgetContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  budgetLabel: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.text,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: 10,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  summaryText: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 5,
  },
  balanceText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary,
  },
  overBudget: {
    color: '#FF3B30',
  },
  expensesListContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 15,
  },
  noExpensesText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  expenseDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expenseAmount: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.text,
    marginRight: 10,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addCategoryButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addCategoryButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: '90%',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: 10,
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginBottom: 15,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categorySelectorItem: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategorySelectorItem: {
    backgroundColor: COLORS.primary,
  },
  categorySelectorText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  selectedCategorySelectorText: {
    color: COLORS.white,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalAddButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.white,
  },
});