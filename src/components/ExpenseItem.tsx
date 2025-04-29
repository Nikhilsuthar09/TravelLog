import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../constants/theme';
import { Feather } from '@expo/vector-icons';

export interface ExpenseItemProps {
  id: string;
  category: string;
  amount: number;
  description: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function ExpenseItem({ id, category, amount, description, onDelete, onEdit }: ExpenseItemProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onEdit(id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{category}</Text>
          {description !== category && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>₹{amount.toLocaleString('en-IN')}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryContainer: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
}); 