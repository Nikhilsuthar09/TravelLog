import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather } from "@expo/vector-icons";
import { ItineraryActivity, ItineraryDay } from "@types";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

const ACTIVITY_CATEGORIES = [
  "Sightseeing",
  "Food",
  "Transportation",
  "Accommodation",
  "Shopping",
  "Entertainment",
  "Other",
];

const ACTIVITY_PRIORITY = [
  { label: "Low Priority", value: "low" },
  { label: "Medium Priority", value: "medium" },
  { label: "High Priority", value: "high" },
];

const ACTIVITY_STATUS = [
  { label: "Planned", value: "planned" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
];

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  day: ItineraryDay | null;
  activity: ItineraryActivity | null;
  isEditing: boolean;
  onSave: (activity: ItineraryActivity) => void;
}

export default function ActivityModal({
  visible,
  onClose,
  day,
  activity,
  isEditing,
  onSave,
}: ActivityModalProps) {
  const [title, setTitle] = useState(activity?.title || "");
  const [location, setLocation] = useState(activity?.location || "");
  const [description, setDescription] = useState(activity?.description || "");
  const [startTime, setStartTime] = useState(activity?.startTime || "");
  const [endTime, setEndTime] = useState(activity?.endTime || "");
  const [category, setCategory] = useState(activity?.category || ACTIVITY_CATEGORIES[0]);
  const [status, setStatus] = useState<"planned" | "confirmed" | "completed">(
    activity?.status || "planned"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    activity?.priority || "medium"
  );
  const [cost, setCost] = useState(activity?.cost?.toString() || "");
  const [bookingRef, setBookingRef] = useState(activity?.bookingReference || "");

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Activity title is required");
      return;
    }

    const activityData: ItineraryActivity = {
      id: activity?.id || `activity_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      category,
      status,
      priority,
      cost: cost ? parseFloat(cost) : undefined,
      bookingReference: bookingRef.trim() || undefined,
    };

    onSave(activityData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Activity" : "Add Activity"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Activity title"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Activity location"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Activity description"
              multiline
              numberOfLines={3}
            />

            <View style={styles.timeContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ACTIVITY_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.selectedCategoryText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ACTIVITY_STATUS.map((stat) => (
                <TouchableOpacity
                  key={stat.value}
                  style={[
                    styles.statusButton,
                    status === stat.value && styles.selectedStatus,
                  ]}
                  onPress={() => setStatus(stat.value as any)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === stat.value && styles.selectedStatusText,
                    ]}
                  >
                    {stat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ACTIVITY_PRIORITY.map((pri) => (
                <TouchableOpacity
                  key={pri.value}
                  style={[
                    styles.priorityButton,
                    priority === pri.value && styles.selectedPriority,
                  ]}
                  onPress={() => setPriority(pri.value as any)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === pri.value && styles.selectedPriorityText,
                    ]}
                  >
                    {pri.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Cost</Text>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Booking Reference</Text>
            <TextInput
              style={styles.input}
              value={bookingRef}
              onChangeText={setBookingRef}
              placeholder="Booking reference number"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.input,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    marginRight: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 16,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.button,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 16,
  },
  selectedStatus: {
    backgroundColor: COLORS.primary,
  },
  statusText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.button,
  },
  selectedStatusText: {
    color: COLORS.white,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 16,
  },
  selectedPriority: {
    backgroundColor: COLORS.primary,
  },
  priorityText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.button,
  },
  selectedPriorityText: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.button,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.button,
  },
}); 