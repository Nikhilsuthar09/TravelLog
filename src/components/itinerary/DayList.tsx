import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { ItineraryActivity, ItineraryDay } from "@types";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import ActivityList from "./ActivityList";

interface DayListProps {
  days: ItineraryDay[];
  onAddActivity: (day: ItineraryDay) => void;
  onEditActivity: (day: ItineraryDay, activity: ItineraryActivity) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
}

export default function DayList({
  days,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: DayListProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleDay = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {days.map((day) => (
        <View key={day.id} style={styles.dayContainer}>
          <TouchableOpacity
            style={styles.dayHeader}
            onPress={() => toggleDay(day.id)}
          >
            <View style={styles.dayTitleContainer}>
              <Text style={styles.dayTitle}>
                Day {day.dayNumber} - {formatDate(day.date)}
              </Text>
              <Text style={styles.activityCount}>
                {day.activities.length} activities
              </Text>
            </View>
            <Feather
              name={expandedDay === day.id ? "chevron-up" : "chevron-down"}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          {expandedDay === day.id && (
            <View style={styles.dayContent}>
              <ActivityList
                activities={day.activities}
                onEdit={(activity) => onEditActivity(day, activity)}
                onDelete={(activityId) => onDeleteActivity(day.id, activityId)}
              />
              <TouchableOpacity
                style={styles.addActivityButton}
                onPress={() => onAddActivity(day)}
              >
                <Feather name="plus" size={20} color={COLORS.white} />
                <Text style={styles.addActivityText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.lightGray,
  },
  dayTitleContainer: {
    flex: 1,
  },
  dayTitle: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  activityCount: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dayContent: {
    padding: 16,
  },
  addActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addActivityText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.button,
    marginLeft: 8,
  },
}); 