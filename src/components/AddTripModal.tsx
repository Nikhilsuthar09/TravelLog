// src/components/AddTripModal.tsx
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import Modal from "react-native-modal"
import * as ImagePicker from "expo-image-picker"
import { COLORS, FONTS, FONT_SIZES } from "../constants/theme";
import { Calendar } from "react-native-calendars";
import { getMarkedDates } from "../utils/getMarkedDates";
import { useTrip } from "@context/TripContext";
import { Trip } from "../types";

// Helper function to generate a unique ID
const generateUniqueId = () => {
  return 'trip_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (trip: Omit<Trip, 'id'> & { id?: string }) => void;
}

export default function AddTripModal({ visible, onClose, onConfirm }: Props) {
  const [tripTitle, setTripTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUri, setimageUri] = useState<string | undefined>(undefined)
  const [budget, setBudget] = useState("")

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality:0.7
    })
    if(!result.canceled){
      setimageUri(result.assets[0].uri);
    }
  }

  const handleDayPress = (day: any) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate("");
    } else {
      if (new Date(day.dateString) > new Date(startDate)) {
        setEndDate(day.dateString);
      } else {
        setStartDate(day.dateString);
      }
    }
  };

  const { addTrip } = useTrip();
  const handleConfirm = () => {
    if (!tripTitle || !destination || !startDate || !endDate) return;
    const defaultCategories = JSON.stringify(['Food', 'Petrol','Hotel', 'Travel'])
    const newTrip = {
      id: generateUniqueId(),
      title: tripTitle,
      destination,
      startDate,
      endDate,
      imageUri,
      budget:budget ? parseFloat(budget) : undefined,
      categories: defaultCategories
    }
    onConfirm(newTrip);
    addTrip(newTrip)
    setTripTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setimageUri(undefined)
    setBudget("")
  };

  return (
    <Modal
    isVisible={visible} 
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    onSwipeComplete={onClose}
    swipeDirection="down"
    style = {styles.modalContainer}
    animationIn="slideInUp"
    animationOut="slideOutDown"
    backdropTransitionOutTiming={0}
    >
        <View style={styles.modal}>
          <Text style={styles.heading}>Add Trip</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <TextInput
              style={styles.input}
              placeholder="Trip Title"
              placeholderTextColor={COLORS.textSecondary}
              value={tripTitle}
              onChangeText={setTripTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Destination"
              placeholderTextColor={COLORS.textSecondary}
              value={destination}
              onChangeText={setDestination}
            />
            <TextInput
              style={styles.input}
              placeholder="Budget (₹)"
              placeholderTextColor={COLORS.textSecondary}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
            
            <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
              <Text style={styles.pickImageText}>
                {imageUri ? "Change Image" : "Pick Trip Image"}
              </Text>
            </TouchableOpacity>
            {imageUri && (
              <Image 
              source={{uri:imageUri}}
              style={{width: "100%", height:180, borderRadius: 10, marginTop: 10}}
              />
            )}

            <Calendar
            minDate= {new Date().toISOString().split("T")[0]}
              onDayPress={handleDayPress}
              markingType="period"
              markedDates={getMarkedDates(startDate, endDate)}
              theme={{
                todayTextColor: COLORS.primary,
                selectedDayTextColor: COLORS.white,
                textDayFontFamily: FONTS.regular,
                textMonthFontFamily: FONTS.bold,
                textDayHeaderFontFamily: FONTS.medium,
              }}
            />

            {startDate && endDate ? (
              <Text style={styles.dateInfo}>
                Selected: {startDate} → {endDate}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !(tripTitle && destination && startDate && endDate) && {
                  backgroundColor: COLORS.primaryLight,
                },
              ]}
              onPress={handleConfirm}
              disabled={!(tripTitle && destination && startDate && endDate)}
            >
              <Text style={styles.confirmText}>Confirm Trip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalContainer:{
    justifyContent:"flex-end",
    margin:0,
  },
  heading: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 10,
    padding: 12,
    fontSize: FONT_SIZES.input,
    fontFamily: FONTS.medium,
    marginBottom: 12,
    color: COLORS.text,
  },
  dateInfo: {
    marginTop: 8,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.button,
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
  },
  closeText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  pickImageBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  pickImageText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.body2,
  }
});
