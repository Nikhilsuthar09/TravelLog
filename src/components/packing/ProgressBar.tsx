import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { View, Text, StyleSheet } from "react-native";

interface ProgressBarProps {
  packedItems: number;
  totalItems: number;
}

export default function ProgressBar({ packedItems, totalItems }: ProgressBarProps) {
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {packedItems} of {totalItems} items packed
      </Text>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  text: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  barContainer: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
}); 