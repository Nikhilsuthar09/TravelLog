import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather } from "@expo/vector-icons";

interface CommonEditHeaderProps {
  scrollY?: Animated.Value;
  title: string;
  onBackPress: () => void;
  onSavePress: () => void;
}

const HEADER_HEIGHT = Platform.OS === "android" ? 130 : 150;
const STATUS_BAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

const CommonEditHeader: React.FC<CommonEditHeaderProps> = ({
  scrollY,
  title,
  onBackPress,
  onSavePress,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSavePress}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

// Export constants for use in parent component
export const HEADER_CONFIG = {
  HEIGHT: HEADER_HEIGHT,
  STATUS_BAR_HEIGHT: STATUS_BAR_HEIGHT,
};

export default CommonEditHeader; 