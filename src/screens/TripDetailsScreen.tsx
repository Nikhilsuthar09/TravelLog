// src/screens/TripDetailsScreen.tsx
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState, useRef, useCallback } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated, Share, Alert, Modal, TextInput } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/AppNavigator";
import { useTrip } from "@context/TripContext";
import { Trip } from "@types";
import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { formatCurrency, formatCurrencyString } from '@utils/currency';
import AddTripModal from '../components/AddTripModal';
import { shareTrip } from '@utils/shareTrip';

// Types
type RouteParams = {
  TripDetails: Trip;
};

type TabItem = {
  name: string;
  icon: string;
  iconSet: typeof Feather | typeof FontAwesome;
};

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
}

interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  isPacked: boolean;
  note?: string;
}

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TABS: TabItem[] = [
  { name: "Itinerary", icon: "edit", iconSet: Feather },
  { name: "Packing", icon: "briefcase", iconSet: Feather },
  { name: "Expenses", icon: "inr", iconSet: FontAwesome },
  { name: "Notes", icon: "file-text", iconSet: Feather }
];

// Helper Functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "sightseeing":
      return "camera";
    case "food":
      return "restaurant";
    case "transportation":
      return "directions-bus";
    case "accommodation":
      return "hotel";
    case "shopping":
      return "shopping-bag";
    case "entertainment":
      return "theater-comedy";
    default:
      return "event";
  }
};

// Menu Modal Component
const MenuModal = ({ 
  visible, 
  onClose, 
  onEdit, 
  onShare 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onEdit: () => void; 
  onShare: () => void; 
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={[styles.menuContainer, styles.menuPosition]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={onEdit}
        >
          <Feather name="edit" size={20} color={COLORS.text} />
          <Text style={styles.menuItemText}>Edit Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={onShare}
        >
          <Feather name="share-2" size={20} color={COLORS.text} />
          <Text style={styles.menuItemText}>Share Trip</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function TripDetailsScreen() {
  // Navigation and Route
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, "TripDetails">>();
  const routeTrip = route.params;
  const { trips, updateTrip } = useTrip();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(0);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [packedItemsCount, setPackedItemsCount] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Refs
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tabWidth = 100; // Approximate width of each tab

  // Get full trip object with all details from context
  const trip = trips.find(t => t.id === routeTrip.id) || routeTrip;

  // Effects
  useEffect(() => {
    // Parse expenses
    if (trip.expenses) {
      try {
        const parsedExpenses = JSON.parse(trip.expenses);
        if (Array.isArray(parsedExpenses)) {
          setExpenses(parsedExpenses);
          const total = parsedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          setTotalSpent(total);
        }
      } catch (error) {
        console.error("Failed to parse expenses:", error);
        setExpenses([]);
      }
    }

    // Parse packing items
    if (trip.packing) {
      try {
        const parsedPacking = JSON.parse(trip.packing);
        if (Array.isArray(parsedPacking)) {
          setPackingItems(parsedPacking);
          const packedCount = parsedPacking.filter(item => item.isPacked).length;
          setPackedItemsCount(packedCount);
        }
      } catch (error) {
        console.error("Failed to parse packing items:", error);
        setPackingItems([]);
      }
    }

    // Set budget
    if (trip.budget) {
      setBudget(trip.budget);
    }
  }, [trip]);

  const scrollToTab = useCallback((index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: false,
      });
    }
  }, []);

  const scrollToTabContainer = useCallback((index: number) => {
    if (tabScrollViewRef.current) {
      const screenCenter = SCREEN_WIDTH / 2;
      const tabCenter = index * tabWidth + tabWidth / 2;
      const scrollToX = Math.max(0, tabCenter - screenCenter);
      
      tabScrollViewRef.current.scrollTo({
        x: scrollToX,
        animated: false,
      });
    }
  }, [tabWidth]);

  const handleTabPress = useCallback((index: number) => {
    setCurrentIndex(index);
    scrollToTab(index);
    scrollToTabContainer(index);
  }, [scrollToTab, scrollToTabContainer]);

  const handleScroll = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      scrollToTabContainer(index);
    }
  }, [currentIndex, scrollToTabContainer]);

  const scrollEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true, listener: handleScroll }
  );

  // Handlers
  const handleShareTrip = async () => {
    try {
      await shareTrip(trip);
    } catch (error) {
      Alert.alert('Error', 'Failed to share trip. Please try again.');
    }
  };

  const handleEditTrip = () => {
    setIsMenuVisible(false);
    setIsEditModalVisible(true);
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    updateTrip(updatedTrip);
    setIsEditModalVisible(false);
  };

  // Render Functions
  const renderItineraryContent = () => {
    if (!trip.itinerary && !trip.structuredItinerary) {
      return (
        <View style={styles.emptyContentContainer}>
          <Feather name="calendar" size={40} color={COLORS.gray} />
          <Text style={styles.emptyContentText}>
            No itinerary added yet.
          </Text>
          <Text style={styles.emptyContentSubText}>
            Plan your daily activities and schedule for this trip
          </Text>
        </View>
      );
    }

    if (trip.structuredItinerary) {
      try {
        const structuredItinerary = JSON.parse(trip.structuredItinerary);
        return (
          <View style={styles.itineraryContainer}>
            {structuredItinerary.map((day: any) => (
              <View key={day.id} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayNumber}>Day {day.dayNumber}</Text>
                  <Text style={styles.dayDate}>
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                {day.activities.length > 0 ? (
                  <View style={styles.activitiesContainer}>
                    {day.activities.map((activity: any) => (
                      <View key={activity.id} style={styles.activityCard}>
                        <View style={styles.activityHeader}>
                          <View style={styles.activityIconContainer}>
                            <MaterialIcons
                              name={getCategoryIcon(activity.category)}
                              size={24}
                              color={COLORS.primary}
                            />
                          </View>
                          <View style={styles.activityTitleContainer}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <View style={styles.activityMeta}>
                              <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{activity.category}</Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        <View style={styles.activityDetails}>
                          {activity.location && (
                            <View style={styles.detailRow}>
                              <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} />
                              <Text style={styles.detailText}>{activity.location}</Text>
                            </View>
                          )}
                          {activity.startTime && activity.endTime && (
                            <View style={styles.detailRow}>
                              <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
                              <Text style={styles.detailText}>
                                {activity.startTime} - {activity.endTime}
                              </Text>
                            </View>
                          )}
                          {activity.description && (
                            <View style={styles.descriptionContainer}>
                              <Text style={styles.description}>{activity.description}</Text>
                            </View>
                          )}
                          {(activity.cost || activity.bookingReference) && (
                            <View style={styles.additionalInfo}>
                              {activity.cost && (
                                <View style={styles.infoBadge}>
                                  <MaterialIcons name="currency-rupee" size={16} color={COLORS.textSecondary} />
                                  <Text style={styles.infoText}>
                                    {activity.cost.toLocaleString("en-IN", {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: 2
                                    })}
                                  </Text>
                                </View>
                              )}
                              {activity.bookingReference && (
                                <View style={styles.infoBadge}>
                                  <MaterialIcons name="confirmation-number" size={16} color={COLORS.textSecondary} />
                                  <Text style={styles.infoText}>{activity.bookingReference}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noActivitiesContainer}>
                    <Text style={styles.noActivitiesText}>No activities planned for this day</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      } catch (error) {
        console.error("Failed to parse structured itinerary:", error);
        return (
          <View>
            <Text style={styles.tabContentText}>{trip.itinerary}</Text>
          </View>
        );
      }
    }

    return (
      <View>
        <Text style={styles.tabContentText}>{trip.itinerary}</Text>
      </View>
    );
  };

  const renderPackingContent = () => {
    if (!trip.packing || packingItems.length === 0) {
      return (
        <View style={styles.emptyContentContainer}>
          <Feather name="package" size={40} color={COLORS.gray} />
          <Text style={styles.emptyContentText}>No packing list added yet.</Text>
          <Text style={styles.emptyContentSubText}>
            Add items you need to pack for this trip.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.packingContentContainer}>
        <View style={styles.packingProgressContainer}>
          <View style={styles.packingProgressTextRow}>
            <Text style={styles.packingProgressLabel}>
              {packedItemsCount} of {packingItems.length} items packed
            </Text>
            <Text style={styles.packingProgressPercent}>
              {Math.round((packedItemsCount / packingItems.length) * 100)}%
            </Text>
          </View>
          <View style={styles.packingProgressBarContainer}>
            <View
              style={[
                styles.packingProgressBar,
                { width: `${(packedItemsCount / packingItems.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.packingItemsList}>
          {packingItems.map((item) => (
            <View key={item.id} style={styles.packingItem}>
              <View style={[
                styles.packingItemStatus,
                item.isPacked ? styles.packingItemPacked : styles.packingItemNotPacked
              ]} />
              <View style={styles.packingItemContent}>
                <Text style={[
                  styles.packingItemText,
                  item.isPacked && styles.packingItemTextPacked
                ]}>
                  {item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}
                </Text>
                {item.note && (
                  <Text style={styles.packingItemNote}>
                    {item.note}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderExpensesContent = () => {
    if (!trip.expenses || expenses.length === 0) {
      return (
        <View style={styles.emptyContentContainer}>
          <FontAwesome name="inr" size={40} color={COLORS.gray} />
          <Text style={styles.emptyContentText}>No expenses added yet.</Text>
          <Text style={styles.emptyContentSubText}>
            Track your budget and spending for this trip.
          </Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.budgetSummaryContainer}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Trip Budget: </Text>
            {formatCurrency(budget)}
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.totalSpentText}>Total Spent: </Text>
            {formatCurrency(totalSpent)}
          </View>
          
          {budget > 0 && (
            <View style={styles.budgetRow}>
              <Text style={[
                styles.balanceText,
                budget < totalSpent ? styles.overBudget : {}
              ]}>
                {budget >= totalSpent 
                  ? "Remaining: "
                  : "Over Budget by: "
                }
              </Text>
              {formatCurrency(Math.abs(budget - totalSpent))}
            </View>
          )}
        </View>

        <View style={styles.expensesListContainer}>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseDescription}>
                  {expense.description !== expense.category ? expense.description : ''}
                </Text>
              </View>
              {formatCurrency(expense.amount)}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderNotesContent = () => {
    if (!trip) return null;
    
    const tripNotes = Array.isArray(trip.notes) ? trip.notes : [];
    
    if (tripNotes.length === 0) {
      return (
        <View style={styles.emptyContentContainer}>
          <Feather name="file-text" size={40} color={COLORS.gray} />
          <Text style={styles.emptyContentText}>No notes added yet.</Text>
          <Text style={styles.emptyContentSubText}>
            Add your trip notes and observations here.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.notesContainer}>
        {tripNotes.map((note, index) => (
          <View key={note.id} style={styles.noteSection}>
            <Text style={styles.noteTitle}>{note.title || `Note ${index + 1}`}</Text>
            <Text style={styles.noteText}>{note.description}</Text>
            <Text style={styles.noteDate}>
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Feather name="more-vertical" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {trip.imageUri && (
          <Image source={{ uri: trip.imageUri }} style={styles.image} />
        )}
        <View style={styles.headerOverlay}>
          <View>
            <View style={styles.titleRow}>
              <Feather name="map-pin" size={20} color={COLORS.white} style={styles.icon} />
              <Text style={styles.title}>{trip.title}</Text>
            </View>
            <View style={styles.destinationRow}>
              <Feather name="navigation" size={18} color={COLORS.white} style={styles.icon} />
              <Text style={styles.destination}>{trip.destination}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Feather name="calendar" size={16} color={COLORS.white} style={styles.icon} />
              <Text style={styles.date}>
                {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onEdit={handleEditTrip}
        onShare={() => {
          setIsMenuVisible(false);
          handleShareTrip();
        }}
      />

      <AddTripModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onConfirm={handleUpdateTrip}
        trip={trip}
      />

      <View style={styles.tabContainer}>
        <ScrollView 
          ref={tabScrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          decelerationRate="fast"
        >
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tabButton,
                currentIndex === index && styles.activeTabButton
              ]}
              onPress={() => handleTabPress(index)}
            >
              <View style={styles.tabContent}>
                {tab.iconSet === Feather ? (
                  <Feather 
                    name={tab.icon as keyof typeof Feather.glyphMap} 
                    size={16} 
                    color={currentIndex === index ? COLORS.primary : COLORS.textSecondary}
                  />
                ) : (
                  <FontAwesome 
                    name={tab.icon as keyof typeof FontAwesome.glyphMap} 
                    size={16} 
                    color={currentIndex === index ? COLORS.primary : COLORS.textSecondary}
                  />
                )}
                <Text
                  style={[
                    styles.tabText,
                    currentIndex === index && styles.activeTabText,
                  ]}
                >
                  {tab.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
      >
        <View style={styles.tabContentContainer}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {renderItineraryContent()}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditItinerary", { tripId: trip.id });
              }}
            >
              <Text style={styles.editButtonText}>
                {trip.itinerary ? "Edit Itinerary" : "Add Itinerary"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.tabContentContainer}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {renderPackingContent()}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditPacking", { tripId: trip.id });
              }}
            >
              <Text style={styles.editButtonText}>
                {trip.packing ? "Edit Packing List" : "Add Packing List"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.tabContentContainer}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {renderExpensesContent()}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditExpenses", { tripId: trip.id });
              }}
            >
              <Text style={styles.editButtonText}>
                {trip.expenses ? "Edit Expenses" : "Add Expenses"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.tabContentContainer}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {renderNotesContent()}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditNotes", { tripId: trip.id });
              }}
            >
              <Text style={styles.editButtonText}>
                {trip.notes ? "Edit Notes" : "Add Notes"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  headerContainer: {
    position: 'relative',
    height: 250,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  destination: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    elevation: 2,
    zIndex: 1,
    position: 'relative',
  },
  tabScrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  tabContentContainer: {
    width: SCREEN_WIDTH,
  },
  tabContentText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  editButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignSelf: "flex-start",
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.button,
    marginLeft: 8,
  },
  emptyContentContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    marginTop: 20,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContentText: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyContentSubText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  budgetSummaryContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    minWidth: 120,
  },
  totalSpentText: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    minWidth: 120,
  },
  balanceText: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    minWidth: 120,
  },
  overBudget: {
    color: COLORS.danger,
  },
  expensesListContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
    color: COLORS.text,
    marginBottom: 4,
  },
  expenseDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body2,
    color: COLORS.textSecondary,
  },
  packingContentContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packingProgressContainer: {
    marginBottom: 20,
  },
  packingProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packingProgressLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
    color: COLORS.textSecondary,
  },
  packingProgressPercent: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.body2,
    color: COLORS.primary,
  },
  packingProgressBarContainer: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  packingProgressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  packingItemsList: {
    marginTop: 12,
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  packingItemStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  packingItemPacked: {
    backgroundColor: COLORS.primary,
  },
  packingItemNotPacked: {
    backgroundColor: COLORS.lightGray,
  },
  packingItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  packingItemText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.body2,
    color: COLORS.text,
  },
  packingItemTextPacked: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  packingItemNote: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  itineraryContainer: {
    gap: 16,
    paddingBottom: 16,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dayNumber: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  dayDate: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitleContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.medium,
  },
  activityDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  descriptionContainer: {
    marginTop: 4,
  },
  description: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  infoText: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  noActivitiesContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noActivitiesText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    width: 200,
    position: 'absolute',
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuPosition: {
    top: 90,
    right: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  notesContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteTitle: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
  },
  noteText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});