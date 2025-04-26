import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';
import { Feather } from '@expo/vector-icons';

interface ExpenseItemProps {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  id,
  category,
  amount,
  description,
  date,
  onUpdate,
  onDelete,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.amount}>
          {amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onUpdate(id)}
          >
            <Feather name="edit" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDelete(id)}
          >
            <Feather name="trash-2" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  category: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amount: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
  },
});

export default ExpenseItem; 