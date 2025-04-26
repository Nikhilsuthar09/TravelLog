import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';

interface AddExpenseFormProps {
  onAddExpense: (expense: { category: string; amount: number; description: string }) => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [categories] = useState(['Food', 'Transport', 'Accommodation', 'Shopping', 'Entertainment', 'Other']);

  const handleAddExpense = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    onAddExpense({
      category: selectedCategory,
      amount: parseFloat(amount),
      description: description || selectedCategory,
    });

    // Reset form
    setAmount('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Expense</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor={COLORS.textSecondary}
      />

      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor={COLORS.textSecondary}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 15,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
});

export default AddExpenseForm; 