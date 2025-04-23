// src/screens/TripDetailsScreen.tsx
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "@constants/theme";
import { RouteProp, useRoute  } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/AppNavigator";
import { useTrip } from "context/TripContext";
import { Trip } from "@types";

type RouteParams = {
  TripDetails:Trip
};
const TABS = ["Itinerary", "Packing", "Expenses"];
interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
}
export default function TripDetailsScreen(){
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, "TripDetails">>();
  const routeTrip = route.params;
  const { trips } = useTrip();
  // get full trip object with all details from context
  const trip = trips.find(t => t.id === routeTrip.id) || routeTrip;
  const [activeTab, setActiveTab] = useState("Itinerary");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    // parse existing expenses if they exist
    if(trip.expenses){
      try{
        const parsedExpenses = JSON.parse(trip.expenses);
        if(Array.isArray(parsedExpenses)){
          setExpenses(parsedExpenses);

          // calculate total
          const total = parsedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          setTotalSpent(total);
        }
      }
      catch(error){
        setExpenses([])
      }
    }
    // set budget
    if(trip.budget){
      setBudget(trip.budget);
    }
  }, [trip]);
  // format currency
  const formatCurrency = (amount:number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }
  

  const renderItineraryContent = () => {
    if(!trip.itinerary){
      return (
      <View style={styles.emptyContentContainer}>
        <Text style={styles.emptyContentText}>
          No itinerary added yet.
        </Text>
        <Text style={styles.emptyContentSubText}>
        Plan your daily activities and schedule for this trip
        </Text>
      </View>
      )
    }
    return (
      <View style={styles.contentView}>
        <Text style={styles.tabContent}>{trip.itinerary}</Text>
      </View>
    )
  }
  const renderPackingContent = () => {
    if (!trip.packing) {
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>No packing list added yet.</Text>
          <Text style={styles.emptyContentSubText}>
            Add items you need to pack for this trip.
          </Text>
        </View>
      );
    }
  
    let packingItems = [];
    try {
      packingItems = JSON.parse(trip.packing);
    } catch (error) {
      // Handle legacy text format or parsing errors
      return (
        <View style={styles.contentView}>
          <Text style={styles.tabContent}>{trip.packing}</Text>
        </View>
      );
    }
  
    if (!Array.isArray(packingItems) || packingItems.length === 0) {
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>Your packing list is empty.</Text>
          <Text style={styles.emptyContentSubText}>
            Tap "Edit Packing List" to add items.
          </Text>
        </View>
      );
    }
  
    // Calculate statistics
    const totalItems = packingItems.length;
    const packedItems = packingItems.filter(item => item.isPacked).length;
    const percentPacked = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  
    return (
      <View style={styles.packingContentContainer}>
        {/* Progress Bar */}
        <View style={styles.packingProgressContainer}>
          <View style={styles.packingProgressTextRow}>
            <Text style={styles.packingProgressLabel}>
              {packedItems} of {totalItems} items packed
            </Text>
            <Text style={styles.packingProgressPercent}>{percentPacked}%</Text>
          </View>
          <View style={styles.packingProgressBarContainer}>
            <View 
              style={[
                styles.packingProgressBar, 
                { width: `${percentPacked}%` }
              ]} 
            />
          </View>
        </View>
  
        {/* Items List */}
        <View style={styles.packingItemsList}>
          {packingItems.map((item) => (
            <View key={item.id} style={styles.packingItem}>
              <View style={[
                styles.packingItemStatus,
                item.isPacked ? styles.packingItemPacked : styles.packingItemNotPacked
              ]} />
              <Text 
                style={[
                  styles.packingItemText,
                  item.isPacked && styles.packingItemTextPacked
                ]}
              >
                {item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  const renderExpensesContent = () => {
    if (!trip.expenses || expenses.length ===0 ) {
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>No expenses added yet.</Text>
          <Text style={styles.emptyContentSubText}>
            Track your budget and spending for this trip.
          </Text>
        </View>
      );
    }

    return (
      <View>
        {/* Budget Summary */}
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

        {/* Expenses List */}
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

  const renderTabContent = () => {
    switch(activeTab){
      case "Itinerary":
        return (
          <View>
            {renderItineraryContent()}
            <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              navigation.navigate("EditItinerary", { tripId: trip.id });
            }}
            >
              <Text style={styles.editButtonText}>{trip.itinerary? "Edit Itinerary":"Add Itinerary" }</Text>
            </TouchableOpacity>
          </View>);
      case "Packing":
        return (
          <View>
            {renderPackingContent()}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditPacking", { tripId: trip.id });
              }}
            >
              <Text style={styles.editButtonText}>{trip.packing ? "Edit Packing List" : "Add Packing List"}</Text>
            </TouchableOpacity>
          </View>
        );
      case "Expenses":
        return (
          <View>
            {renderExpensesContent()}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate("EditExpenses", { tripId: trip.id });
              }}
            >
              <Text style={styles.editButtonText}>{trip.expenses ? "Edit Expenses" : "Add Expenses"}</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 30}}>
      {trip.imageUri && (
        <Image source={{uri: trip.imageUri}} style={styles.image} />
      )}
      <Text style={styles.title}>{trip.title}</Text>
      <Text style={styles.destination}>{trip.destination}</Text>
      <Text style={styles.date}>{trip.startDate} → {trip.endDate}</Text>

      {/* horizontal tab buttons */}
      <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabScroll}
      >
       {TABS.map((tab) => (
        <TouchableOpacity
        key={tab}
        style={[
          styles.tabButton,
          activeTab === tab && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab(tab)}
        >
          <Text style={[
            styles.tabText,
            activeTab == tab && styles.activeTabText,
          ]}>
            {tab}
          </Text>
        </TouchableOpacity>
       ))} 

      </ScrollView>
      {/* Dynamic content based on tab */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  destination: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 20,
  },
  tabScroll: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginRight: 12,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  activeTabText: {
    color: COLORS.white,
  },
  contentContainer: {
    paddingVertical: 10,
    minHeight: 150,
  },
  contentView: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tabContent: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 24,
  },
  editButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  emptyContentContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  emptyContentText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptyContentSubText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: "center",
  },
  // New styles for expenses display
  budgetSummaryContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  totalSpentText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: 4,
  },
  overBudget: {
    color: '#FF3B30',
  },
  expensesListContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  expenseDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expenseAmount: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.text,
  },
  packingContentContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  packingProgressContainer: {
    marginBottom: 16,
  },
  packingProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  packingProgressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  packingItemsList: {
    marginTop: 8,
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  packingItemStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  packingItemPacked: {
    backgroundColor: COLORS.primary,
  },
  packingItemNotPacked: {
    backgroundColor: '#D0D0D0',
  },
  packingItemText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  },
  packingItemTextPacked: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
});