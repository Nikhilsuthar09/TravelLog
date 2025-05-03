import { COLORS, FONTS, FONT_SIZES } from "@constants/theme";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  title: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  message: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
}); 