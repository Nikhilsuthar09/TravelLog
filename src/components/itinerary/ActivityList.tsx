import { COLORS, FONTS } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { ItineraryActivity } from "@types";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ActivityListProps {
  activities: ItineraryActivity[];
  onEdit: (activity: ItineraryActivity) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityList({
  activities,
  onEdit,
  onDelete,
}: ActivityListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return COLORS.danger;
      case "medium":
        return COLORS.warning;
      case "low":
        return COLORS.success;
      default:
        return COLORS.text;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return COLORS.success;
      case "confirmed":
        return COLORS.primary;
      case "planned":
        return COLORS.warning;
      default:
        return COLORS.text;
    }
  };

  return (
    <View style={styles.container}>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleContainer}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <View style={styles.activityMeta}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(activity.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{activity.status}</Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(activity.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>{activity.priority}</Text>
                </View>
              </View>
            </View>
            <View style={styles.activityActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(activity)}
              >
                <Feather name="edit" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(activity.id)}
              >
                <Feather name="trash-2" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activityDetails}>
            {activity.location && (
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{activity.location}</Text>
              </View>
            )}
            {activity.startTime && activity.endTime && (
              <View style={styles.detailRow}>
                <Feather name="clock" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {activity.startTime} - {activity.endTime}
                </Text>
              </View>
            )}
            {activity.description && (
              <Text style={styles.description}>{activity.description}</Text>
            )}
            {activity.cost && (
              <View style={styles.detailRow}>
                <Feather name="dollar-sign" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {activity.cost.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </Text>
              </View>
            )}
            {activity.bookingReference && (
              <View style={styles.detailRow}>
                <Feather name="hash" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{activity.bookingReference}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  activityContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  activityTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  activityActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  activityDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginTop: 4,
  },
}); 