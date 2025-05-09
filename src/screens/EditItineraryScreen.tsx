// src/screens/EditItineraryScreen
import { COLORS } from "@constants/theme";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ItineraryActivity, ItineraryDay } from "@types";
import { useTrip } from "@context/TripContext";
import { RootStackParamList } from "@navigation/AppNavigator";
import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
} from "react-native";
import ActivityModal from "../components/itinerary/ActivityModal";
import DayList from "../components/itinerary/DayList";
import CommonEditHeader from "../components/CommonEditHeader";
import { HEADER_CONFIG } from "../components/CommonEditHeader";
import DeleteConfirmationModal from "../components/common/DeleteConfirmationModal";

type EditItineraryRouteProp = RouteProp<RootStackParamList, "EditItinerary">;
// constants for dropdown options
const ACTIVITY_CATEGORIES = [
  "Sightseeing",
  "Food",
  "Transportation",
  "Accommodation",
  "Shopping",
  "Entertainment",
  "Other",
];

export default function EditItineraryScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditItineraryRouteProp>();
  const { tripId } = route.params;
  const { trips, updateStructuredItinerary } = useTrip();
  const trip = trips.find((t) => t.id === tripId);
  const scrollY = useRef(new Animated.Value(0)).current;

  // itinerary state
  const [days, setDays] = useState<ItineraryDay[]>([]);
  // modal States
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentDay, setCurrentDay] = useState<ItineraryDay | null>(null);
  const [currentActivity, setCurrentActivity] = useState<ItineraryActivity | null>(null);
  const [isEditingActivity, setIsEditingActivity] = useState(false);

  // activity form states
  const [activityTitle, setActivityTitle] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityStartTime, setActivityStartTime] = useState("");
  const [activityEndTime, setActivityEndTime] = useState("");
  const [activityCategory, setActivityCategory] = useState(
    ACTIVITY_CATEGORIES[0]
  );
  const [activityStatus, setactivityStatus] = useState<
    "planned" | "confirmed" | "completed"
  >("planned");
  const [activityPriority, setActivityPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [activityCost, setActivityCost] = useState("");
  const [activityBookingRef, setActivityBookingRef] = useState("");
  // category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  // status and priority
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{ dayId: string; activityId: string } | null>(null);

  useEffect(() => {
    if (!trip) return;

    // Check if structured itinerary exists
    if (trip.structuredItinerary) {
      try {
        const parsedItinerary = JSON.parse(trip.structuredItinerary);
        if (Array.isArray(parsedItinerary) && parsedItinerary.length > 0) {
          setDays(parsedItinerary);
        }
      } catch (error) {
        // console.error("Failed to parse structured itinerary", error);
      }
    } else if (trip.startDate && trip.endDate) {
      // If no structured itinerary, create empty days based on trip dates
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);

      // Calculate number of days in the trip
      const dayDiff =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      // Create an array of empty days
      const newDays: ItineraryDay[] = [];
      for (let i = 0; i < dayDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        newDays.push({
          id: `day_${i + 1}_${Date.now()}`,
          date: currentDate.toISOString().split("T")[0],
          dayNumber: i + 1,
          activities: [],
        });
      }

      setDays(newDays);
    }
  }, [trip]);

  // Reset activity form
  const resetActivityForm = () => {
    setActivityTitle("");
    setActivityLocation("");
    setActivityDescription("");
    setActivityStartTime("");
    setActivityEndTime("");
    setActivityCategory(ACTIVITY_CATEGORIES[0]);
    setactivityStatus("planned");
    setActivityPriority("medium");
    setActivityCost("");
    setActivityBookingRef("");
  };

  // Set form values when editing an activity
  const setupActivityForm = (activity: ItineraryActivity) => {
    setActivityTitle(activity.title);
    setActivityLocation(activity.location || "");
    setActivityDescription(activity.description || "");
    setActivityStartTime(activity.startTime || "");
    setActivityEndTime(activity.endTime || "");
    setActivityCategory(activity.category);
    setActivityCost(activity.cost ? activity.cost.toString() : "");
    setActivityBookingRef(activity.bookingReference || "");
  };

  // Handle adding a new activity to a day
  const handleAddActivity = (day: ItineraryDay) => {
    setCurrentDay(day);
    setIsEditingActivity(false);
    resetActivityForm();
    setShowActivityModal(true);
  };

  // Handle editing an existing activity
  const handleEditActivity = (day: ItineraryDay, activity: ItineraryActivity) => {
    setCurrentDay(day);
    setCurrentActivity(activity);
    setIsEditingActivity(true);
    setupActivityForm(activity);
    setShowActivityModal(true);
  };

  // Delete an activity from a day
  const handleDeleteActivity = (dayId: string, activityId: string) => {
    setDays(
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.filter(
                (a) => a.id !== activityId
              ),
            }
          : day
      )
    );
  };

  // Save activity to the day
  const handleSaveActivity = (activity: ItineraryActivity) => {
    if (!currentDay) return;

    const activityData = {
      ...activity,
      id: activity.id || `activity_${currentDay.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    if (isEditingActivity && currentActivity) {
      // Update existing activity
      setDays(
        days.map((day) =>
          day.id === currentDay.id
            ? {
                ...day,
                activities: day.activities.map((a) =>
                  a.id === currentActivity.id ? activityData : a
                ),
              }
            : day
        )
      );
    } else {
      // Add new activity
      setDays(
        days.map((day) =>
          day.id === currentDay.id
            ? {
                ...day,
                activities: [...day.activities, activityData],
              }
            : day
        )
      );
    }

    setShowActivityModal(false);
  };

  // Save the entire itinerary
  const handleSave = () => {
    if (!trip) return;

    // Save structured itinerary
    updateStructuredItinerary(trip.id, days);
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteClick = (dayId: string, activityId: string) => {
    setActivityToDelete({ dayId, activityId });
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (activityToDelete) {
      handleDeleteActivity(activityToDelete.dayId, activityToDelete.activityId);
      setDeleteModalVisible(false);
      setActivityToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setActivityToDelete(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      <CommonEditHeader
        scrollY={scrollY}
        title="Itinerary"
        onBackPress={() => navigation.goBack()}
        onSavePress={handleSave}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={1}
        contentContainerStyle={styles.content}
      >
        <DayList
          days={days}
          onAddActivity={handleAddActivity}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteClick}
        />
      </Animated.ScrollView>

      <ActivityModal
        visible={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={handleSaveActivity}
        day={currentDay}
        activity={currentActivity}
        isEditing={isEditingActivity}
      />

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: HEADER_CONFIG.HEIGHT + 16, // Add padding to account for header height
  },
});
