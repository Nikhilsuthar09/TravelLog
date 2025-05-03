import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ItineraryActivity, ItineraryDay } from "@types";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { formatCurrencyString } from '@utils/currency';

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
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState(ACTIVITY_CATEGORIES[0]);
  const [cost, setCost] = useState("");
  const [bookingRef, setBookingRef] = useState("");

  // Reset form when modal visibility changes
  useEffect(() => {
    if (visible) {
      if (isEditing && activity) {
        // If editing, populate with activity data
        setTitle(activity.title);
        setLocation(activity.location || "");
        setDescription(activity.description || "");
        setStartTime(activity.startTime || "");
        setEndTime(activity.endTime || "");
        setCategory(activity.category);
        setCost(activity.cost?.toString() || "");
        setBookingRef(activity.bookingReference || "");
      } else {
        // If adding new, reset all fields
        setTitle("");
        setLocation("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setCategory(ACTIVITY_CATEGORIES[0]);
        setCost("");
        setBookingRef("");
      }
    }
  }, [visible, isEditing, activity]);

  const validateTime = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const formatTimeInput = (input: string) => {
    // Remove any non-digit characters
    const numbers = input.replace(/\D/g, '');
    
    // Format as HH:MM
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
    }
    return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
  };

  const handleStartTimeChange = (text: string) => {
    const formattedTime = formatTimeInput(text);
    setStartTime(formattedTime);
  };

  const handleEndTimeChange = (text: string) => {
    const formattedTime = formatTimeInput(text);
    setEndTime(formattedTime);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Activity title is required");
      return;
    }

    if (startTime && !validateTime(startTime)) {
      Alert.alert("Error", "Please enter a valid start time (HH:MM)");
      return;
    }

    if (endTime && !validateTime(endTime)) {
      Alert.alert("Error", "Please enter a valid end time (HH:MM)");
      return;
    }

    const activityData: ItineraryActivity = {
      id: activity?.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      category,
      cost: cost ? parseFloat(formatCurrencyString(parseFloat(cost))) : undefined,
      bookingReference: bookingRef.trim() || undefined,
      status: "planned",
      priority: "medium",
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Activity" : "Add Activity"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Category Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryContainer}>
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
              </View>
            </View>

            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Activity title"
                placeholderTextColor={COLORS.gray}
              />

              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <MaterialIcons name="location-on" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Activity location"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Activity description"
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.gray}
              />
            </View>

            {/* Time Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeInput}>
                  <Text style={styles.label}>Start Time</Text>
                  <View style={styles.inputWithIcon}>
                    <MaterialIcons name="access-time" size={20} color={COLORS.gray} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.inputWithIconText]}
                      value={startTime}
                      onChangeText={handleStartTimeChange}
                      placeholder="HH:MM"
                      keyboardType="numeric"
                      maxLength={5}
                      placeholderTextColor={COLORS.gray}
                    />
                  </View>
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.label}>End Time</Text>
                  <View style={styles.inputWithIcon}>
                    <MaterialIcons name="access-time" size={20} color={COLORS.gray} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.inputWithIconText]}
                      value={endTime}
                      onChangeText={handleEndTimeChange}
                      placeholder="HH:MM"
                      keyboardType="numeric"
                      maxLength={5}
                      placeholderTextColor={COLORS.gray}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Cost and Booking Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cost and Booking</Text>
              <Text style={styles.label}>Cost</Text>
              <View style={styles.inputWithIcon}>
                <MaterialIcons name="currency-rupee" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={cost}
                  onChangeText={setCost}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <Text style={styles.label}>Booking Reference</Text>
              <View style={styles.inputWithIcon}>
                <MaterialIcons name="confirmation-number" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={bookingRef}
                  onChangeText={setBookingRef}
                  placeholder="Booking reference number"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>
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
      </KeyboardAvoidingView>
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    marginBottom: 4,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.caption,
  },
  selectedCategoryText: {
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
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 15,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWithIconText: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
}); 