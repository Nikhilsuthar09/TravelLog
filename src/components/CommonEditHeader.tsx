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
  scrollY: Animated.Value;
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
    <View style={styles.headerOuterContainer}>
      <LinearGradient
        colors={["#4E65FF", "#92EFFD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill]}
      />
      
      {/* Dark overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.1)',
          }
        ]}
      />

      {/* Main Header Content */}
      <View style={styles.headerContent}>
        {/* Back Button */}
        <View style={styles.backButton}>
          <TouchableOpacity
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.greeting}>{title}</Text>
        </View>

        {/* Save Button */}
        <View style={styles.saveButton}>
          <TouchableOpacity
            onPress={onSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerOuterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: "hidden",
    zIndex: 10,
  },
  headerContent: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT - STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.button,
    fontFamily: FONTS.medium,
  },
});

// Export constants for use in parent component
export const HEADER_CONFIG = {
  HEIGHT: HEADER_HEIGHT,
  STATUS_BAR_HEIGHT: STATUS_BAR_HEIGHT,
};

export default CommonEditHeader; 