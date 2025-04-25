// src/screens/TripDetailsScreen.tsx
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "@constants/theme";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/AppNavigator";
import { useTrip } from "context/TripContext";
import { Trip } from "@types";
import { Feather } from "@expo/vector-icons";

type RouteParams = {
  TripDetails: Trip;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABS = ["Itinerary", "Packing", "Expenses"];

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
}

// Add date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function TripDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, "TripDetails">>();
  const routeTrip = route.params;
  const { trips } = useTrip();
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(0);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [packedItemsCount, setPackedItemsCount] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // get full trip object with all details from context
  const trip = trips.find(t => t.id === routeTrip.id) || routeTrip;

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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

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
          <View style={styles.contentView}>
            {structuredItinerary.map((day: any) => (
              <View key={day.id} style={styles.dayContainer}>
                <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
                {day.activities.map((activity: any) => (
                  <View key={activity.id} style={styles.activityContainer}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    {activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}
                    {activity.location && (
                      <Text style={styles.activityLocation}>📍 {activity.location}</Text>
                    )}
                    {activity.startTime && activity.endTime && (
                      <Text style={styles.activityTime}>
                        🕒 {activity.startTime} - {activity.endTime}
                      </Text>
                    )}
                    {activity.category && (
                      <Text style={styles.activityCategory}>🏷️ {activity.category}</Text>
                    )}
                    {activity.status && (
                      <Text style={[
                        styles.activityStatus,
                        activity.status === 'completed' && styles.activityStatusCompleted,
                        activity.status === 'confirmed' && styles.activityStatusConfirmed,
                        activity.status === 'planned' && styles.activityStatusPlanned
                      ]}>
                        {activity.status === 'completed' ? '✅ Completed' :
                         activity.status === 'confirmed' ? '✓ Confirmed' :
                         '📅 Planned'}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      } catch (error) {
        console.error("Failed to parse structured itinerary:", error);
        // Fallback to plain text if structured parsing fails
        return (
          <View style={styles.contentView}>
            <Text style={styles.tabContentText}>{trip.itinerary}</Text>
          </View>
        );
      }
    }

    // If only plain text itinerary exists
    return (
      <View style={styles.contentView}>
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
              <Text style={[
                styles.packingItemText,
                item.isPacked && styles.packingItemTextPacked
              ]}>
                {item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}
              </Text>
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
          <Feather name="dollar-sign" size={40} color={COLORS.gray} />
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
          <Text style={styles.budgetLabel}>Trip Budget: {formatCurrency(budget)}</Text>
          <Text style={styles.totalSpentText}>Total Spent: {formatCurrency(totalSpent)}</Text>
          
          {budget > 0 && (
            <Text style={[
              styles.balanceText,
              budget < totalSpent ? styles.overBudget : {}
            ]}>
              {budget >= totalSpent 
                ? `Remaining: ${formatCurrency(budget - totalSpent)}`
                : `Over Budget by: ${formatCurrency(totalSpent - budget)}`
              }
            </Text>
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
              <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const handleTabPress = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (index !== currentIndex) {
          setCurrentIndex(index);
        }
      }
    }
  );

  const tabIndicatorPosition = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: [0, SCREEN_WIDTH / 3, (SCREEN_WIDTH / 3) * 2],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        {trip.imageUri && (
          <Image source={{ uri: trip.imageUri }} style={styles.image} />
        )}
        <View style={styles.headerContent}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                currentIndex === index && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabIndicatorPosition }],
            },
          ]}
        />
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
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
      </Animated.ScrollView>
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
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
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
  headerContent: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  destination: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginTop: 8,
    elevation: 2,
    zIndex: 1,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH / 3,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  tabContentContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  tabContentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  contentView: {
    backgroundColor: COLORS.white,
    padding: 16,
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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyContentSubText: {
    fontSize: 14,
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
  budgetLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
  },
  totalSpentText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: 8,
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
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  expenseDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expenseAmount: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.text,
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
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  packingProgressPercent: {
    fontFamily: FONTS.bold,
    fontSize: 14,
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
    alignItems: 'center',
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
  packingItemText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
  },
  packingItemTextPacked: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
  },
  activityContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  activityLocation: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  activityCategory: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  activityStatus: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activityStatusCompleted: {
    color: COLORS.success,
  },
  activityStatusConfirmed: {
    color: COLORS.primary,
  },
  activityStatusPlanned: {
    color: COLORS.warning,
  },
});