// src/screens/HomeScreen.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { useTrip } from "@context/TripContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Trip } from "@types";
import AnimatedHeader, { HEADER_CONFIG } from "../components/AnimatedHeader";
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '@context/AuthContext';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';
import { shareTrip } from '@utils/shareTrip';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const MAX_RECENT_TRIPS = 5;
  const navigation = useNavigation<NavigationProp>();
  const { trips } = useTrip();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { signOut, user, loading: authLoading } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  // Redirect to auth screen if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  }, [user, authLoading, navigation]);

  // Show loading screen while checking auth state
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  // get current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // find upcoming trips(sorted by date)
  const upcomingTrips = [...trips]
    .filter((trip) => new Date(trip.startDate) >= today)
    .sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  const ongoingTrips = trips.filter((trip) => {
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    return today >= startDate && today <= endDate;
  });
  
  const upcomingTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  // calculate days until next trip
  const getDaysUntil = (dateString: string) => {
    const tripDate = new Date(dateString);
    const diff = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // navigation Handlers
  const handleNavigateTotrips = () => {
    navigation.navigate("Tabs", { screen: "Trips" });
  };
  
  const handleAddTrip = () => {
    navigation.navigate("Tabs", {
      screen: "Trips",
      params: { showAddModal: true },
    });
  };

  const handleNavigateToTripDetails = (trip: Trip) => {
    navigation.navigate("TripDetails", trip);
  };

  const handleNavigateToPacking = () => {
    if (upcomingTrip) {
      navigation.navigate("EditPacking", { tripId: upcomingTrip.id });
    } else {
      navigation.navigate("Tabs", { screen: "Trips" });
    }
  };

  const handleProfilePress = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleQuickAction = async (action: string) => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setLoadingAction(action);
    
    switch (action) {
      case 'add':
        handleAddTrip();
        break;
      case 'itinerary':
        if (upcomingTrip) {
          navigation.navigate('EditItinerary', { tripId: upcomingTrip.id });
        } else {
          navigation.navigate('Tabs', { screen: 'Trips' });
        }
        break;
      case 'packing':
        handleNavigateToPacking();
        break;
      case 'notes':
        if (upcomingTrip) {
          navigation.navigate('EditNotes', { tripId: upcomingTrip.id });
        } else {
          navigation.navigate('Tabs', { screen: 'Trips' });
        }
        break;
      case 'expenses':
        if (upcomingTrip) {
          navigation.navigate('EditExpenses', { tripId: upcomingTrip.id });
        } else {
          navigation.navigate('Tabs', { screen: 'Trips' });
        }
        break;
      case 'share':
        if (upcomingTrip) {
          try {
            await shareTrip(upcomingTrip);
          } catch (error) {
            Alert.alert('Error', 'Failed to share trip. Please try again.');
          }
        } else {
          navigation.navigate('Tabs', { screen: 'Trips' });
        }
        break;
    }
    
    setLoadingAction(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Using our new AnimatedHeader component */}
      <AnimatedHeader
        scrollY={scrollY}
        title={`Welcome, ${user?.displayName || 'User'}!`}
        subtitle={formattedDate}
        onProfilePress={handleProfilePress}
      />

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_CONFIG.MAX_HEIGHT }
        ]}
      >
        {/* Status Summary */}
        <View style={styles.contentContainer}>
          <View style={styles.cardShadow}>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>{upcomingTrips.length}</Text>
                <Text style={styles.statusLabel}>Upcoming</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>{ongoingTrips.length}</Text>
                <Text style={styles.statusLabel}>Ongoing</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>
                  {trips.length - upcomingTrips.length - ongoingTrips.length}
                </Text>
                <Text style={styles.statusLabel}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Next Trip Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {upcomingTrip ? "Your Next Adventure" : "Plan Your Next Trip"}
            </Text>

            {upcomingTrip ? (
              <TouchableOpacity
                style={styles.cardShadow}
                onPress={() => handleNavigateToTripDetails(upcomingTrip)}
                activeOpacity={0.9}
              >
                <View style={styles.upcomingTripCard}>
                  {upcomingTrip.imageUri ? (
                    <Image
                      source={{ uri: upcomingTrip.imageUri }}
                      style={styles.tripImage}
                    />
                  ) : (
                    <View style={[styles.tripImage, styles.imagePlaceholder]}>
                      <Feather
                        name="image"
                        size={40}
                        color={COLORS.primaryLight}
                      />
                    </View>
                  )}

                  <View style={styles.tripCardOverlay}>
                    <View style={styles.tripCardContent}>
                      <View style={styles.destinationContainer}>
                        <Feather name="map-pin" size={16} color={COLORS.white} style={styles.icon} />
                        <Text style={styles.destinationText}>
                          {upcomingTrip.destination}
                        </Text>
                      </View>
                      <View style={styles.dateContainer}>
                        <Feather name="calendar" size={16} color={COLORS.white} style={styles.icon} />
                        <Text style={styles.tripDateText}>
                          {formatDate(upcomingTrip.startDate)} → {formatDate(upcomingTrip.endDate)}
                        </Text>
                      </View>
                      <View style={styles.countdownContainer}>
                        <Feather name="clock" size={16} color={COLORS.white} style={styles.icon} />
                        <View style={styles.countdownBadge}>
                          <Text style={styles.countdownText}>
                            {getDaysUntil(upcomingTrip.startDate)} days to go
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.cardShadow, styles.addTripButton]}
                onPress={handleAddTrip}
                activeOpacity={0.8}
              >
                <Feather name="plus-circle" size={32} color={COLORS.primary} />
                <Text style={styles.addTripText}>Add your first trip</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions */}
          {(upcomingTrips.length > 0 || ongoingTrips.length > 0) && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                {showTooltip && (
                  <TouchableOpacity 
                    onPress={() => setShowTooltip(false)}
                    style={styles.tooltipButton}
                  >
                    <Feather name="info" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
              {showTooltip && (
                <Text style={styles.tooltipText}>
                  Tap any action to quickly access common features
                </Text>
              )}
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.cardShadow]}
                  onPress={() => handleQuickAction('add')}
                  activeOpacity={0.8}
                  disabled={loadingAction === 'add'}
                >
                  <View style={styles.actionIconContainer}>
                    {loadingAction === 'add' ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <Feather name="plus" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.actionText}>Add Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, styles.cardShadow]}
                  onPress={() => handleQuickAction('itinerary')}
                  activeOpacity={0.8}
                  disabled={loadingAction === 'itinerary' || !upcomingTrip}
                >
                  <View style={styles.actionIconContainer}>
                    {loadingAction === 'itinerary' ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <Feather name="calendar" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.actionText}>Itinerary</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, styles.cardShadow]}
                  onPress={() => handleQuickAction('packing')}
                  activeOpacity={0.8}
                  disabled={loadingAction === 'packing' || !upcomingTrip}
                >
                  <View style={styles.actionIconContainer}>
                    {loadingAction === 'packing' ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <Feather name="check-square" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.actionText}>Packing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, styles.cardShadow]}
                  onPress={() => handleQuickAction('expenses')}
                  activeOpacity={0.8}
                  disabled={loadingAction === 'expenses' || !upcomingTrip}
                >
                  <View style={styles.actionIconContainer}>
                    {loadingAction === 'expenses' ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <MaterialIcons name="currency-rupee" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.actionText}>Expenses</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, styles.cardShadow]}
                  onPress={() => handleQuickAction('notes')}
                  activeOpacity={0.8}
                  disabled={loadingAction === 'notes' || !upcomingTrip}
                >
                  <View style={styles.actionIconContainer}>
                    {loadingAction === 'notes' ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <Feather name="edit-2" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.actionText}>Notes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionButton, styles.cardShadow]}
                  onPress={() => handleQuickAction('share')}
                  activeOpacity={0.8}
                  disabled={loadingAction === 'share' || !upcomingTrip}
                >
                  <View style={styles.actionIconContainer}>
                    {loadingAction === 'share' ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <Feather name="share-2" size={20} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent Trips */}
          {trips.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Trips</Text>
                <TouchableOpacity 
                  onPress={handleNavigateTotrips}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentTripsScroll}
              >
                {trips
                  .slice(0, MAX_RECENT_TRIPS)
                  .map((trip) => (
                    <TouchableOpacity
                      key={trip.id}
                      style={[styles.recentTripCard, styles.cardShadow]}
                      onPress={() => handleNavigateToTripDetails(trip)}
                      activeOpacity={0.8}
                    >
                      {trip.imageUri ? (
                        <Image
                          source={{ uri: trip.imageUri }}
                          style={styles.recentTripImage}
                        />
                      ) : (
                        <View
                          style={[
                            styles.recentTripImage,
                            styles.imagePlaceholder,
                          ]}
                        >
                          <Feather
                            name="image"
                            size={24}
                            color={COLORS.primaryLight}
                          />
                        </View>
                      )}
                      <View style={styles.recentTripContent}>
                        <Text numberOfLines={1} style={styles.recentTripTitle}>
                          {trip.destination}
                        </Text>
                        <Text style={styles.recentTripDate}>
                          {trip.startDate}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
          
          {/* Extra padding at the bottom for better scrolling experience */}
          <View style={{ height: 20 }} />
        </View>
      </Animated.ScrollView>
      
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
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 16,
  },
  cardShadow: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  statusNumber: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  statusLabel: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusDivider: {
    width: 1,
    height: "80%",
    backgroundColor: COLORS.lightGray,
    alignSelf: "center",
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  upcomingTripCard: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  tripImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  tripCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  tripCardContent: {
    justifyContent: "flex-end",
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  destinationText: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  tripDateText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  countdownText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.medium,
  },
  addTripButton: {
    height: 120,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  addTripText: {
    marginTop: 8,
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  tooltipButton: {
    padding: 4,
  },
  tooltipText: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    width: '30%',
    height: 90,
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  recentTripsScroll: {
    paddingLeft: 2,
    paddingRight: 16,
    paddingBottom: 4,
  },
  recentTripCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  recentTripImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  recentTripContent: {
    padding: 8,
  },
  recentTripTitle: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  recentTripDate: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});