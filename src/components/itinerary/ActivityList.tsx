import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ItineraryActivity } from "@types";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { formatCurrency } from '@utils/currency';

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

  return (
    <View style={styles.container}>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <View style={styles.categoryIcon}>
              <MaterialIcons
                name={getCategoryIcon(activity.category)}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.activityContent}>
              <View style={styles.activityTitleContainer}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <View style={styles.activityMeta}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{activity.category}</Text>
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
                        {formatCurrency(activity.cost, { 
                          fontSize: FONT_SIZES.body2,
                          color: COLORS.textSecondary
                        })}
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
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitleContainer: {
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
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
  activityActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
}); 