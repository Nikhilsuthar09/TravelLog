import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';

export interface AddExpenseFormProps {
  onAddExpense: (expense: { 
    category: string; 
    amount: string; 
    description: string;
    isCategoryOnly?: boolean;
  }) => void;
  categories: string[];
  initialExpense?: {
    id: string;
    category: string;
    amount: number;
    description: string;
  } | null;
  onModalClose: () => void;
}

export default function AddExpenseForm({ onAddExpense, categories, initialExpense, onModalClose }: AddExpenseFormProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [category, setCategory] = useState(categories[0] || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (initialExpense) {
      setCategory(initialExpense.category);
      setAmount(initialExpense.amount.toString());
      setDescription(initialExpense.description);
      setIsModalVisible(true);
    }
  }, [initialExpense]);

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) {
      Alert.alert('Invalid Category', 'Please enter a category name');
      return;
    }
    // Just add the category and return to main form
    onAddExpense({
      category: customCategory,
      amount: '',
      description: '',
      isCategoryOnly: true
    });
    setCategory(customCategory);
    setIsAddingCustomCategory(false);
    setCustomCategory('');
  };

  const handleAdd = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount');
      return;
    }

    onAddExpense({
      category,
      amount,
      description: description || category,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setIsModalVisible(false);
    onModalClose();
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setIsAddingCustomCategory(false);
    setCustomCategory('');
    onModalClose();
    if (initialExpense) {
      setAmount('');
      setDescription('');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Feather name="plus" size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingCustomCategory ? 'Add New Category' : (initialExpense ? 'Edit Expense' : 'Add New Expense')}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {isAddingCustomCategory ? (
              <View style={styles.customCategoryContainer}>
                <Text style={styles.label}>Category Name</Text>
                <TextInput
                  style={styles.customCategoryInput}
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="Enter category name"
                  placeholderTextColor={COLORS.textSecondary}
                  autoFocus
                />
                <View style={styles.customCategoryButtons}>
                  <TouchableOpacity
                    style={[styles.customCategoryButton, styles.cancelButton]}
                    onPress={() => setIsAddingCustomCategory(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.customCategoryButton, styles.addCategoryButton]}
                    onPress={handleAddCustomCategory}
                  >
                    <Text style={styles.addCategoryButtonText}>Add Category</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
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
                  <TouchableOpacity
                    style={styles.addCustomCategoryButton}
                    onPress={() => setIsAddingCustomCategory(true)}
                  >
                    <Feather name="plus" size={16} color={COLORS.primary} />
                    <Text style={styles.addCustomCategoryText}>Add Custom Category</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAdd}
                >
                  <Text style={styles.submitButtonText}>
                    {initialExpense ? 'Update Expense' : 'Add Expense'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
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
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  addCustomCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  addCustomCategoryText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: 4,
  },
  customCategoryContainer: {
    gap: 8,
  },
  customCategoryInput: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  customCategoryButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  customCategoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
  },
  addCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  addCategoryButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
  },
  input: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body1,
  },
}); 