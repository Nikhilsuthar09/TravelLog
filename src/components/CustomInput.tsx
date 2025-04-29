import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '@constants/theme';

const styles = StyleSheet.create({
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.regular,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
}); 