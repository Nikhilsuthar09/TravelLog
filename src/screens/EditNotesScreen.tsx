import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Animated, 
  StatusBar, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '@constants/theme';
import { useTrip } from '@context/TripContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import CommonEditHeader, { HEADER_CONFIG } from '../components/CommonEditHeader';
import { Trip, TripNote } from '../types';
import { Feather } from '@expo/vector-icons';

export default function EditNotesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tripId } = route.params as { tripId: string };
  const { trips, updateTrip } = useTrip();
  
  const trip = trips.find(t => t.id === tripId) as Trip | undefined;
  const [notes, setNotes] = useState<TripNote[]>(Array.isArray(trip?.notes) ? trip.notes : []);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleAddNote = () => {
    const newNote: TripNote = {
      id: Date.now().toString(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
    // Scroll to the new note after it's added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const handleUpdateNote = (noteId: string, field: 'title' | 'description', value: string) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          [field]: value,
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };

  const handleSave = () => {
    if (!trip) return;

    const updatedTrip: Trip = {
      ...trip,
      notes: notes.map(note => ({
        ...note,
        title: note.title.trim(),
        description: note.description.trim()
      }))
    };

    updateTrip(updatedTrip);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      <CommonEditHeader
        scrollY={scrollY}
        title="Trip Notes"
        onBackPress={() => navigation.goBack()}
        onSavePress={handleSave}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={1}
        contentContainerStyle={[
          styles.content,
          { paddingTop: HEADER_CONFIG.HEIGHT }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {notes.map((note, index) => (
          <View key={note.id} style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteNumber}>Note {index + 1}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteNote(note.id)}
              >
                <Feather name="trash-2" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                value={note.title}
                onChangeText={(text) => handleUpdateNote(note.id, 'title', text)}
                placeholder="Enter note title..."
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                value={note.description}
                onChangeText={(text) => handleUpdateNote(note.id, 'description', text)}
                placeholder="Add your trip notes here..."
                placeholderTextColor={COLORS.gray}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Feather name="plus" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add New Note</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  noteContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteNumber: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  deleteButton: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  descriptionInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    fontSize: FONT_SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body1,
    fontFamily: FONTS.semiBold,
    marginLeft: 8,
  },
}); 