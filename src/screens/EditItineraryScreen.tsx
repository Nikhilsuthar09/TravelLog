// src/screens/EditItineraryScreen
import { COLORS, FONTS } from '@constants/theme';
import { Feather } from '@expo/vector-icons';
import { RouteProp,useNavigation, useRoute } from '@react-navigation/native';
import { ItineraryActivity, ItineraryDay } from '@types';
import { useTrip } from 'context/TripContext';
import { RootStackParamList } from 'navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Switch, FlatList, Modal, ScrollView } from 'react-native'

type EditItineraryRouteProp = RouteProp<RootStackParamList,'EditItinerary'> 
// constants for dropdown options
const ACTIVITY_CATEGORIES = [
  'Sightseeing',
  'Food',
  'Transportation',
  'Accommodation',
  'Shopping',
  'Entertainment',
  'Other'
];
const ACTIVITY_PRIORITY = [
  { label: 'Low Priority', value: 'low' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'High Priority', value: 'high' }
]
const ACTIVITY_STATUS = [
  { label: 'Planned', value: 'planned' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' }
]

export default function EditItineraryScreen() {
  const navigation = useNavigation()
  const route = useRoute<EditItineraryRouteProp>();
  const {tripId} = route.params;
  const {trips, updateItinerary, updateStructuredItinerary} = useTrip();
  const trip = trips.find((t) => t.id === tripId);

  const [itineraryText, setItineraryText] = useState('')
  // itinerary state
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [useStructuredFormat, setUseStructuredFormat] = useState(false)
  // modal States
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [currentDay, setCurrentDay] = useState<ItineraryDay | null>(null)
  const [currentActivity, setcurrentActivity] = useState<ItineraryActivity | null>(null)
  const [isEditingActivity, setIsEditingActivity] = useState(false)

  // activity form states
  const [activityTitle, setActivityTitle] = useState('')
  const [activityLocation, setActivityLocation] = useState('')
  const [activityDescription, setActivityDescription] = useState('')
  const [activityStartTime, setActivityStartTime] = useState('')
  const [activityEndTime, setActivityEndTime] = useState('')
  const [activityCategory, setActivityCategory] = useState(ACTIVITY_CATEGORIES[0]);
  const [activityStatus, setactivityStatus] = useState<'planned' | 'confirmed' | 'completed'>('planned');
  const [activityPriority, setActivityPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [activityCost, setActivityCost] = useState('')
  const [activityBookingRef, setActivityBookingRef] = useState('')
  // category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  // status and priority
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPriorityModal, setShowPriorityModal] = useState(false)

  useEffect(() => {
    if (!trip) return;
    
    // Set legacy text itinerary
    if (trip.itinerary) {
      setItineraryText(trip.itinerary);
    }
    
    // Check if structured itinerary exists
    if (trip.structuredItinerary) {
      try {
        const parsedItinerary = JSON.parse(trip.structuredItinerary);
        if (Array.isArray(parsedItinerary) && parsedItinerary.length > 0) {
          setDays(parsedItinerary);
          setUseStructuredFormat(true);
        }
      } catch (error) {
        console.error('Failed to parse structured itinerary', error);
      }
    } else if (trip.startDate && trip.endDate) {
      // If no structured itinerary, create empty days based on trip dates
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      
      // Calculate number of days in the trip
      const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Create an array of empty days
      const newDays: ItineraryDay[] = [];
      for (let i = 0; i < dayDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        newDays.push({
          id: `day_${i + 1}_${Date.now()}`,
          date: currentDate.toISOString().split('T')[0],
          dayNumber: i + 1,
          activities: []
        });
      }
      
      setDays(newDays);
    }
  }, [trip]);
  
  // Reset activity form
  const resetActivityForm = () => {
    setActivityTitle('');
    setActivityLocation('');
    setActivityDescription('');
    setActivityStartTime('');
    setActivityEndTime('');
    setActivityCategory(ACTIVITY_CATEGORIES[0]);
    setactivityStatus('planned');
    setActivityPriority('medium');
    setActivityCost('');
    setActivityBookingRef('');
  };
  
  // Set form values when editing an activity
  const setupActivityForm = (activity: ItineraryActivity) => {
    setActivityTitle(activity.title);
    setActivityLocation(activity.location || '');
    setActivityDescription(activity.description || '');
    setActivityStartTime(activity.startTime || '');
    setActivityEndTime(activity.endTime || '');
    setActivityCategory(activity.category);
    setactivityStatus(activity.status);
    setActivityPriority(activity.priority);
    setActivityCost(activity.cost ? activity.cost.toString() : '');
    setActivityBookingRef(activity.bookingReference || '');
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
    setcurrentActivity(activity);
    setIsEditingActivity(true);
    setupActivityForm(activity);
    setShowActivityModal(true);
  };
  
  // Delete an activity from a day
  const handleDeleteActivity = (dayId: string, activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDays(days.map(day => 
              day.id === dayId 
                ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
                : day
            ));
          }
        }
      ]
    );
  };
  
  // Save activity to a day
  const saveActivity = () => {
    if (!activityTitle.trim()) {
      Alert.alert('Error', 'Activity title is required');
      return;
    }
    
    if (!currentDay) return;
    
    const activityData: ItineraryActivity = {
      id: currentActivity ? currentActivity.id : `activity_${Date.now()}`,
      title: activityTitle.trim(),
      description: activityDescription.trim() || undefined,
      location: activityLocation.trim() || undefined,
      startTime: activityStartTime.trim() || undefined,
      endTime: activityEndTime.trim() || undefined,
      category: activityCategory,
      status: activityStatus,
      priority: activityPriority,
      cost: activityCost ? parseFloat(activityCost) : undefined,
      bookingReference: activityBookingRef.trim() || undefined
    };
    
    if (isEditingActivity && currentActivity) {
      // Update existing activity
      setDays(days.map(day => 
        day.id === currentDay.id 
          ? {
              ...day,
              activities: day.activities.map(a => 
                a.id === currentActivity.id ? activityData : a
              )
            }
          : day
      ));
    } else {
      // Add new activity
      setDays(days.map(day => 
        day.id === currentDay.id 
          ? { ...day, activities: [...day.activities, activityData] }
          : day
      ));
    }
    
    setShowActivityModal(false);
  };
  
  // Save the entire itinerary
  const handleSave = () => {
    if (useStructuredFormat) {
      updateStructuredItinerary(tripId, days);
      // For backward compatibility, create a text version too
      const textVersion = days.map(day => {
        const dayHeader = `Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString()}`;
        const activities = day.activities.map(activity => {
          const timeStr = activity.startTime ? `${activity.startTime}${activity.endTime ? ' - ' + activity.endTime : ''}` : '';
          return `• ${timeStr} ${timeStr ? '| ' : ''}${activity.title}${activity.location ? ' @ ' + activity.location : ''}`;
        }).join('\n');
        return `${dayHeader}\n${activities}`;
      }).join('\n\n');
      updateItinerary(tripId, textVersion);
    } else {
      // Save legacy text format
      updateItinerary(tripId, itineraryText);
    }
    
    navigation.goBack();
  };
  
  // Format for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Toggle structured format on/off
  const toggleFormat = () => {
    if (!useStructuredFormat && !days.length) {
      // If switching to structured and no days exist, create them
      if (trip?.startDate && trip?.endDate) {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        const newDays: ItineraryDay[] = [];
        for (let i = 0; i < dayDiff; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          
          newDays.push({
            id: `day_${i + 1}_${Date.now()}`,
            date: currentDate.toISOString().split('T')[0],
            dayNumber: i + 1,
            activities: []
          });
        }
        
        setDays(newDays);
      }
    }
    
    setUseStructuredFormat(!useStructuredFormat);
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text>Trip not found</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Itinerary for {trip.title}</Text>
        <View style={styles.formatToggleContainer}>
          <Text style={styles.formatToggleLabel}>
            {useStructuredFormat ? 'Interactive' : 'Simple Text'}
          </Text>
          <Switch
            value={useStructuredFormat}
            onValueChange={toggleFormat}
            trackColor={{ false: '#D0D0D0', true: COLORS.primary }}
            thumbColor={useStructuredFormat ? '#FFFFFF' : '#F0F0F0'}
          />
        </View>
      </View>
      
      {!useStructuredFormat ? (
        // Legacy text-based itinerary editor
        <TextInput 
          style={styles.textInput}
          value={itineraryText}
          onChangeText={setItineraryText}
          multiline
          placeholder="Eg: Day 1 - Arrival, Check-in"
        />
      ) : (
        // Structured day-by-day itinerary
        <FlatList
          data={days}
          keyExtractor={(item) => item.id}
          renderItem={({ item: day }) => (
            <View style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
              </View>
              
              {day.activities.length === 0 ? (
                <View style={styles.emptyActivities}>
                  <Text style={styles.emptyActivitiesText}>No activities yet</Text>
                </View>
              ) : (
                day.activities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityHeader}>
                      <View style={styles.activityTitleRow}>
                        <View style={[
                          styles.priorityIndicator,
                          activity.priority === 'high' && styles.highPriority,
                          activity.priority === 'medium' && styles.mediumPriority,
                          activity.priority === 'low' && styles.lowPriority,
                        ]} />
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                      </View>
                      
                      <View style={styles.activityActions}>
                        <TouchableOpacity
                          style={styles.activityAction}
                          onPress={() => handleEditActivity(day, activity)}
                        >
                          <Feather name="edit-2" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.activityAction}
                          onPress={() => handleDeleteActivity(day.id, activity.id)}
                        >
                          <Feather name="trash-2" size={16} color={COLORS.danger || '#FF3B30'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.activityDetails}>
                      {(activity.startTime || activity.endTime) && (
                        <View style={styles.activityDetailRow}>
                          <Feather name="clock" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.activityDetailText}>
                            {activity.startTime || ''}
                            {activity.startTime && activity.endTime ? ' - ' : ''}
                            {activity.endTime || ''}
                          </Text>
                        </View>
                      )}
                      
                      {activity.location && (
                        <View style={styles.activityDetailRow}>
                          <Feather name="map-pin" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.activityDetailText}>{activity.location}</Text>
                        </View>
                      )}
                      
                      {activity.cost !== undefined && (
                        <View style={styles.activityDetailRow}>
                          <Feather name="dollar-sign" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.activityDetailText}>
                            ₹{activity.cost.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.activityStatus}>
                        <Text style={[
                          styles.activityStatusText,
                          activity.status === 'planned' && styles.statusPlanned,
                          activity.status === 'confirmed' && styles.statusConfirmed,
                          activity.status === 'completed' && styles.statusCompleted,
                        ]}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    
                    {activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}
                  </View>
                ))
              )}
              
              <TouchableOpacity
                style={styles.addActivityButton}
                onPress={() => handleAddActivity(day)}
              >
                <Feather name="plus" size={16} color={COLORS.white} />
                <Text style={styles.addActivityButtonText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.daysList}
        />
      )}
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Itinerary</Text>
      </TouchableOpacity>
      
      {/* Activity Edit Modal */}
      <Modal
        visible={showActivityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingActivity ? 'Edit Activity' : 'Add Activity'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowActivityModal(false)}
              >
                <Feather name="x" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <TextInput
                style={styles.modalInput}
                placeholder="Activity Title"
                value={activityTitle}
                onChangeText={setActivityTitle}
              />
              
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={[styles.modalInput, styles.timeInput]}
                  placeholder="Start Time"
                  value={activityStartTime}
                  onChangeText={setActivityStartTime}
                />
                <TextInput
                  style={[styles.modalInput, styles.timeInput]}
                  placeholder="End Time"
                  value={activityEndTime}
                  onChangeText={setActivityEndTime}
                />
              </View>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Location"
                value={activityLocation}
                onChangeText={setActivityLocation}
              />
              
              {/* Category Selector */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.dropdownButtonText}>Category: {activityCategory}</Text>
                <Feather name="chevron-down" size={18} color={COLORS.text} />
              </TouchableOpacity>
              
              {/* Status Selector */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowStatusModal(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  Status: {activityStatus.charAt(0).toUpperCase() + activityStatus.slice(1)}
                </Text>
                <Feather name="chevron-down" size={18} color={COLORS.text} />
              </TouchableOpacity>
              
              {/* Priority Selector */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPriorityModal(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  Priority: {activityPriority.charAt(0).toUpperCase() + activityPriority.slice(1)}
                </Text>
                <Feather name="chevron-down" size={18} color={COLORS.text} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Cost (₹)"
                value={activityCost}
                onChangeText={setActivityCost}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Booking Reference"
                value={activityBookingRef}
                onChangeText={setActivityBookingRef}
              />
              
              <TextInput
                style={[styles.modalInput, styles.descriptionInput]}
                placeholder="Description"
                value={activityDescription}
                onChangeText={setActivityDescription}
                multiline
              />
              
              <TouchableOpacity style={styles.saveActivityButton} onPress={saveActivity}>
                <Text style={styles.saveActivityButtonText}>Save Activity</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.pickerModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Feather name="x" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={ACTIVITY_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    activityCategory === item && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    setActivityCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    activityCategory === item && styles.pickerItemTextSelected
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
      {/* Status Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.pickerModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Feather name="x" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={ACTIVITY_STATUS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    activityStatus === item.value && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    setactivityStatus(item.value as 'planned' | 'confirmed' | 'completed');
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    activityStatus === item.value && styles.pickerItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.pickerModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Priority</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPriorityModal(false)}
              >
                <Feather name="x" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={ACTIVITY_PRIORITY}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    activityPriority === item.value && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    setActivityPriority(item.value as 'low' | 'medium' | 'high');
                    setShowPriorityModal(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    activityPriority === item.value && styles.pickerItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { 
    padding: 20,
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    flex: 1,
  },
  formatToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatToggleLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    fontFamily: FONTS.regular,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
    flex: 1,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center'
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  daysList: {
    paddingBottom: 20,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  dayDate: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  emptyActivities: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyActivitiesText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  activityItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  highPriority: {
    backgroundColor: COLORS.danger || '#FF3B30',
  },
  mediumPriority: {
    backgroundColor: '#FFC107',
  },
  lowPriority: {
    backgroundColor: '#4CAF50',
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    flex: 1,
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityAction: {
    padding: 6,
    marginLeft: 8,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  activityDetailText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  activityStatus: {
    marginLeft: 'auto',
  },
  activityStatusText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusPlanned: {
    backgroundColor: '#E0F7FA',
    color: '#00ACC1',
  },
  statusConfirmed: {
    backgroundColor: '#E8F5E9',
    color: '#43A047',
  },
  statusCompleted: {
    backgroundColor: '#EEEEEE',
    color: '#757575',
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 20,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  addActivityButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  pickerModalContent: {
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInput: {
    flex: 0.48,
    marginBottom: 0,
  },
  dropdownButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  pickerItemTextSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveActivityButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveActivityButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: 16,
  }
});