import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';

interface ProgressBarProps {
  totalExpenses: number;
  budget: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalExpenses, budget }) => {
  const progress = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;
  const isOverBudget = totalExpenses > budget;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Budget Progress</Text>
        <Text style={[styles.amount, isOverBudget && styles.overBudget]}>
          {totalExpenses.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} / {budget.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { width: `${progress}%` },
            isOverBudget && styles.overBudgetBar
          ]} 
        />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  amount: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  overBudget: {
    color: '#FF3B30',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  overBudgetBar: {
    backgroundColor: '#FF3B30',
  },
});

export default ProgressBar; 