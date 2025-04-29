// src/screens/TripsScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  TextInput,
  StatusBar,
  Dimensions,
} from "react-native";
import AddTripModal from "../components/AddTripModal";
import { COLORS, FONTS, FONT_SIZES } from "../constants/theme";
import { useTrip } from "@context/TripContext";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList } from "@navigation/AppNavigator";
import { Feather } from "@expo/vector-icons";
import AnimatedHeader, { HEADER_CONFIG } from "../components/AnimatedHeader";
import { Trip } from "@types";
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '@context/AuthContext';

type StactNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TripScreenRouteProp = RouteProp<BottomTabParamList, "Trips">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SectionData {
  title: string;
  data: Trip[];
  color: string;
}

export default function TripsScreen() {
  const navigation = useNavigation<StactNavigationProp>();
  const route = useRoute<TripScreenRouteProp>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { trips, deleteTrip } = useTrip();
  const { signOut } = useAuth();
  const searchInputRef = useRef<TextInput>(null);
  
  // Check if we should show the add trip modal (from HomeScreen quick action)
  useEffect(() => {
    if ( route.params && route.params.showAddModal) {
      setModalVisible(true);
      // Reset the parameter to avoid re-opening on navigation
      navigation.setParams({ showAddModal: undefined } as any);
    }
  }, [route.params]);

  const handleAddTrip = () => {
    setModalVisible(true);
  };

  const handleConfirmDates = () => {
    setModalVisible(false);
  };

  const getTripStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) return { label: "Upcoming", color: "#1E90FF", key: "upcoming" };
    if (today >= start && today <= end) return { label: "Ongoing", color: "#28A745", key: "ongoing" };
    return { label: "Completed", color: "#6C757D", key: "completed" };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate days until the trip or days since completion
  const getDaysMessage = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffToStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const diffFromEnd = Math.ceil((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffToStart > 0) {
      return `${diffToStart} day${diffToStart !== 1 ? 's' : ''} until departure`;
    } else if (today >= start && today <= end) {
      const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `• ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
    } else {
      return `Completed ${diffFromEnd} day${diffFromEnd !== 1 ? 's' : ''} ago`;
    }
  };

  // Filter trips based on search query
  const filteredTrips = trips.filter(trip => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      trip.title.toLowerCase().includes(query) ||
      trip.destination.toLowerCase().includes(query) ||
      trip.startDate.toLowerCase().includes(query) ||
      trip.endDate.toLowerCase().includes(query)
    );
  });

  // Organize trips into sections
  const organizeTripsBySections = () => {
    const sections: SectionData[] = [
      { title: "Ongoing", data: [], color: "#28A745" },
      { title: "Upcoming", data: [], color: "#1E90FF" },
      { title: "Completed", data: [], color: "#6C757D" }
    ];

    filteredTrips.forEach(trip => {
      const status = getTripStatus(trip.startDate, trip.endDate);
      
      if (status.key === "ongoing") {
        sections[0].data.push(trip);
      } else if (status.key === "upcoming") {
        sections[1].data.push(trip);
      } else {
        sections[2].data.push(trip);
      }
    });

    // Sort upcoming trips by start date (soonest first)
    sections[1].data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    // Sort ongoing trips by end date (soonest ending first)
    sections[0].data.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    
    // Sort completed trips by end date (most recent first)
    sections[2].data.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    // Remove empty sections
    return sections.filter(section => section.data.length > 0);
  };

  const tripSections = organizeTripsBySections();

  const renderTripCard = ({ item }: { item: Trip }) => {
    const status = getTripStatus(item.startDate, item.endDate);
    const daysMessage = getDaysMessage(item.startDate, item.endDate);

    return (
      <Animated.View
        style={{
          opacity: 1,
          transform: [{ scale: 1 }],
        }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("TripDetails", {
              id: item.id,
              title: item.title,
              destination: item.destination,
              startDate: item.startDate,
              endDate: item.endDate,
              imageUri: item.imageUri ?? "",
            })
          }
          onLongPress={() =>
            Alert.alert(
              "Delete Trip",
              `Are you sure you want to delete "${item.title}"?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteTrip(item.id),
                },
              ]
            )
          }
          activeOpacity={0.9}
        >
          <View style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  item.imageUri
                    ? { uri: item.imageUri }
                    : require("../assets/images/default.jpg")
                }
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <View style={styles.locationContainer}>
                <Feather name="map-pin" size={14} color={COLORS.gray} style={styles.locationIcon} />
                <Text style={styles.destination}>{item.destination}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={14} color={COLORS.gray} style={styles.dateIcon} />
                <Text style={styles.date}>
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </Text>
              </View>
              <Text style={styles.duration}>{getDaysMessage(item.startDate, item.endDate)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Get the current formatted date for the header
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather name="map" size={60} color={COLORS.primaryLight} />
      <Text style={styles.emptyText}>
        No trips found{searchQuery ? " matching your search" : ""}
      </Text>
      <Text style={styles.emptySubText}>
        {searchQuery 
          ? "Try a different search query" 
          : "Start planning your next adventure!"}
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={styles.emptyAddButton}
          onPress={handleAddTrip}
        >
          <Text style={styles.emptyAddButtonText}>+ Add Your First Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
      <Text style={styles.sectionHeaderText}>{section.title} Trips</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  const handleProfilePress = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    signOut();
    setShowLogoutModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      <View style={styles.headerWrapper}>
        {/* Animated Header */}
        <AnimatedHeader
          scrollY={scrollY}
          title="My Adventures"
          subtitle={formattedDate}
          onProfilePress={handleProfilePress}
        />

        {/* Search Bar (Always Visible) */}
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [0, HEADER_CONFIG.MAX_HEIGHT - HEADER_CONFIG.MIN_HEIGHT],
                  outputRange: [HEADER_CONFIG.MAX_HEIGHT, HEADER_CONFIG.MIN_HEIGHT],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}
        >
          <View style={styles.searchInputContainer}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search your recent trips"
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="search" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Main Content */}
      {filteredTrips.length > 0 ? (
        <Animated.SectionList
          sections={tripSections}
          keyExtractor={(item) => item.id}
          renderItem={renderTripCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: HEADER_CONFIG.MAX_HEIGHT + 60 }
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={[
            styles.emptyScrollContent,
            { paddingTop: HEADER_CONFIG.MAX_HEIGHT + 60 }
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderEmptyList()}
        </Animated.ScrollView>
      )}

      {/* Floating Action Button (only Add button now) */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, styles.addButton]}
          onPress={handleAddTrip}
        >
          <Feather name="plus" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <AddTripModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmDates}
      />

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body1,
    color: COLORS.text,
    marginRight: 8,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    height: 100,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
  },
  title: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationIcon: {
    marginRight: 4,
  },
  destination: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: FONT_SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  duration: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.h4,
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body2,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyAddButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyAddButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontFamily: FONTS.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sectionHeaderText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.h4,
    color: COLORS.text,
    flex: 1,
  },
  sectionCount: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body1,
    color: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 28,
    textAlign: 'center',
  },
});