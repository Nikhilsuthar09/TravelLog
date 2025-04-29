// src/constants/theme.ts
const COLORS = {
  primary: "#2F80ED",
  primaryLight: "#A0C4FF",
  secondary: "#56CCF2",
  background: "#F7F9FC",
  text: "#333333",
  textSecondary: "#666666",
  gray: "#828282",
  white: "#FFFFFF",
  danger: "#EB5757",
  lightGray: "#E0E0E0",
  success: "#27AE60",
  warning: "#F2C94C",

  // Calenders
  calendarStartColor: "#2F80ED", // or primary
  calendarEndColor: "#2F80ED", // or primary
  calendarMiddleColor: "#A0C4FF", // or primaryLight
  calendarTextColor: "#FFFFFF", // or white
  calendarMiddleTextColor: "#003F5C", // dark text for contrast
};

const FONTS = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  bold: "Poppins-Bold",
  semiBold: "Poppins-SemiBold",
};

const FONT_SIZES = {
  // Display sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  
  // Body text sizes
  body1: 16,
  body2: 14,
  body3: 13,
  
  // Small text sizes
  caption: 12,
  small: 11,
  tiny: 10,

  // Special sizes
  button: 16,
  input: 16,
  label: 14,
};

export { COLORS, FONTS, FONT_SIZES };
