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
import { COLORS, FONTS } from "../constants/theme";
import { useTrip } from "context/TripContext";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList } from "navigation/AppNavigator";
import { Feather } from "@expo/vector-icons";
import AnimatedHeader, { HEADER_CONFIG } from "../components/AnimatedHeader";
import { Trip } from "@types";

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
  const [searchVisible, setSearchVisible] = useState(false);
  const { trips, deleteTrip } = useTrip();
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

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      // Focus on the search input when showing
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // Clear search when hiding
      setSearchQuery("");
    }
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
      return `Trip in progress • ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
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
          <Image
            source={
              item.imageUri
                ? { uri: item.imageUri }
                : require("../assets/images/default.jpg")
            }
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.gradient} />
          
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusBadgeText}>{status.label}</Text>
            </View>
            <TouchableOpacity 
      style={styles.optionsButton}
      onPress={() => {
        // Show options for this trip
        Alert.alert(
          item.title,
          "Choose an action",
          [
            { 
              text: "View Details", 
              onPress: () => navigation.navigate("TripDetails", {
                id: item.id,
                title: item.title,
                destination: item.destination,
                startDate: item.startDate,
                endDate: item.endDate,
                imageUri: item.imageUri ?? "",
              }) 
            },
            { 
              text: "Itinerary", 
              onPress: () => navigation.navigate("EditItinerary", { tripId: item.id }) 
            },
            { 
              text: "Packing List", 
              onPress: () => navigation.navigate("EditPacking", { tripId: item.id }) 
            },
            { 
              text: "Expenses", 
              onPress: () => navigation.navigate("EditExpenses", { tripId: item.id }) 
            },
            { 
              text: "Delete", 
              style: "destructive", 
              onPress: () => {
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
                );
              } 
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }}
    >
      <Feather name="more-vertical" size={20} color="#FFF" />
    </TouchableOpacity>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.destination}>{item.destination}</Text>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={styles.dateRow}>
              <Feather name="calendar" size={14} color="rgba(255,255,255,0.9)" style={styles.dateIcon} />
              <Text style={styles.date}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
            <View style={styles.daysContainer}>
              <Text style={styles.daysText}>{daysMessage}</Text>
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Animated Header */}
      <AnimatedHeader
        scrollY={scrollY}
        title="My Adventures"
        subtitle={formattedDate}
        onProfilePress={() => {
          // Handle profile navigation
        }}
      />

      {/* Search Bar (Animated) */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { 
            top: HEADER_CONFIG.MIN_HEIGHT,
            opacity: searchVisible ? 1 : 0,
            transform: [{ 
              translateY: searchVisible ? 0 : -50 
            }]
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search your trips..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Main Content */}
      {filteredTrips.length > 0 ? (
        <Animated.SectionList
          sections={tripSections}
          keyExtractor={(item) => item.id}
          renderItem={renderTripCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContent,
            { 
              paddingTop: HEADER_CONFIG.MAX_HEIGHT + (searchVisible ? 70 : 0)
            }
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
            { 
              paddingTop: HEADER_CONFIG.MAX_HEIGHT + (searchVisible ? 70 : 0)
            }
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

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, styles.searchButton]}
          onPress={handleSearchToggle}
        >
          <Feather 
            name={searchVisible ? "x" : "search"} 
            size={22} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
        
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
  },
  searchContainer: {
    position: 'absolute',
    zIndex: 99,
    width: '100%',
    paddingHorizontal: 16,
    elevation:6,
    shadowColor:'#000',
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.text,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    height: 220,
  },
  cardHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  optionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  destination: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.9)',
  },
  daysContainer: {
    marginTop: 2,
  },
  daysText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    alignItems: 'center',
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
    marginTop: 16,
  },
  searchButton: {
    backgroundColor: COLORS.secondary,
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
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
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
    fontSize: 16,
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
    fontSize: 18,
    color: COLORS.text,
    flex: 1,
  },
  sectionCount: {
    fontFamily: FONTS.medium,
    fontSize: 16,
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