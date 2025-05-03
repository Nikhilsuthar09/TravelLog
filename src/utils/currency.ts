import { View, Text } from 'react-native';
import { COLORS } from '@constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

/**
 * Formats a number as Indian Rupees (INR) with proper formatting and currency symbol
 * @param amount The amount to format
 * @param options Optional formatting options
 * @returns A React component displaying the formatted currency
 */
export const formatCurrency = (amount: number, options?: {
  showIcon?: boolean;
  fontSize?: number;
  color?: string;
}): React.ReactNode => {
  const {
    showIcon = true,
    fontSize,
    color = COLORS.text
  } = options || {};

  const formattedAmount = amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  return React.createElement(
    View,
    { style: { flexDirection: 'row', alignItems: 'center' } },
    showIcon && React.createElement(
      MaterialIcons,
      {
        name: "currency-rupee",
        size: fontSize ? fontSize - 2 : 14,
        color: color
      }
    ),
    React.createElement(
      Text,
      { style: { fontSize, color } },
      formattedAmount
    )
  );
};

/**
 * Formats a number as Indian Rupees (INR) and returns just the string
 * @param amount The amount to format
 * @returns The formatted currency string
 */
export const formatCurrencyString = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}; 