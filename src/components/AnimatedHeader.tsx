// src/components/AnimatedHeader.tsx
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS } from "@constants/theme";
import { Feather } from "@expo/vector-icons";

interface AnimatedHeaderProps {
  scrollY: Animated.Value;
  title: string;
  subtitle: string;
  onProfilePress?: () => void;
}

const HEADER_MAX_HEIGHT = Platform.OS === "android" ? 130 : 150;
const HEADER_MIN_HEIGHT = Platform.OS === "android" ? 90 : 110;
const STATUS_BAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  scrollY,
  title,
  subtitle,
  onProfilePress,
}) => {
  // Animated values for header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOverlayOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [0, 0.3, 0.6],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [1, 0.9, 0.8],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -8],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.8, SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const dateOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const profileButtonOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.headerOuterContainer, { height: headerHeight }]}>
      <LinearGradient
        colors={["#4E65FF", "#92EFFD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill]}
      />
      
      {/* Dark overlay that gets more visible when scrolling */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.2)',
            opacity: headerOverlayOpacity
          }
        ]}
      />

      {/* Expanded Header Content */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: titleOpacity,
            transform: [
              { scale: titleScale },
              { translateY: titleTranslateY }
            ],
            position: 'absolute',
            left: 18,
            bottom: 20
          }
        ]}
      >
        <Text style={styles.greeting}>{title}</Text>
        <Animated.Text style={[styles.date, { opacity: dateOpacity }]}>
          {subtitle}
        </Animated.Text>
      </Animated.View>
      
      {/* Profile button */}
      <Animated.View 
        style={[styles.profileButton, { 
          position: 'absolute', 
          right: 18, 
          top: STATUS_BAR_HEIGHT + 20, 
          opacity: profileButtonOpacity
        }]}
      >
        <TouchableOpacity
          onPress={onProfilePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="user" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Compact Header - Always at the same position but opacity changes */}
      <Animated.View 
        style={[
          styles.compactHeader,
          { opacity: compactTitleOpacity, paddingVertical: 12 }
        ]}
      >
        <Text style={styles.compactTitle}>My Travels</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerOuterContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  compactHeader: {
    position: "absolute",
    top: STATUS_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT - STATUS_BAR_HEIGHT,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
  },
  compactTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: 4,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

// Export constants for use in parent component
export const HEADER_CONFIG = {
  MAX_HEIGHT: HEADER_MAX_HEIGHT,
  MIN_HEIGHT: HEADER_MIN_HEIGHT,
  STATUS_BAR_HEIGHT: STATUS_BAR_HEIGHT,
  SCROLL_DISTANCE: SCROLL_DISTANCE,
};

export default AnimatedHeader;