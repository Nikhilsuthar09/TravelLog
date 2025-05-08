import { Share } from 'react-native';
import { Trip } from '../types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const shareTrip = async (trip: Trip) => {
  try {
    // Format dates
    const startDateFormatted = formatDate(trip.startDate);
    const endDateFormatted = formatDate(trip.endDate);

    // Build the share message
    let shareMessage = `Trip Details for: ${trip.title}\n\n`;
    shareMessage += `Destination: ${trip.destination}\n`;
    shareMessage += `Dates: ${startDateFormatted} → ${endDateFormatted}\n`;
    if (trip.budget) {
      shareMessage += `Budget: ₹${trip.budget.toLocaleString('en-IN')}\n`;
    }
    shareMessage += '\n';

    // Add Itinerary if exists
    if (trip.structuredItinerary) {
      try {
        const structuredItinerary = JSON.parse(trip.structuredItinerary);
        shareMessage += '📅 Itinerary:\n';
        structuredItinerary.forEach((day: any) => {
          shareMessage += `\nDay ${day.dayNumber} (${day.date}):\n`;
          day.activities.forEach((activity: any) => {
            shareMessage += `• ${activity.title}`;
            if (activity.startTime && activity.endTime) {
              shareMessage += ` (${activity.startTime} - ${activity.endTime})`;
            }
            if (activity.location) {
              shareMessage += ` @ ${activity.location}`;
            }
            shareMessage += '\n';
          });
        });
        shareMessage += '\n';
      } catch (error) {
        console.error('Error parsing structured itinerary:', error);
      }
    }

    // Add Packing List if exists
    if (trip.packing) {
      try {
        const packingItems = JSON.parse(trip.packing);
        shareMessage += '\n🧳 Packing List:\n';
        packingItems.forEach((item: any) => {
          shareMessage += `• ${item.name}`;
          if (item.quantity > 1) shareMessage += ` (${item.quantity})`;
          if (item.isPacked) shareMessage += ' ✓';
          if (item.note) shareMessage += ` - ${item.note}`;
          shareMessage += '\n';
        });
      } catch (error) {
        console.error("Failed to parse packing list:", error);
      }
    }

    // Add Expenses if exists
    if (trip.expenses) {
      try {
        const expenses = JSON.parse(trip.expenses);
        shareMessage += '\n💰 Expenses:\n';
        let totalSpent = 0;
        expenses.forEach((expense: any) => {
          shareMessage += `• ${expense.category}: ₹${expense.amount.toLocaleString('en-IN')}`;
          if (expense.description && expense.description !== expense.category) {
            shareMessage += ` - ${expense.description}`;
          }
          shareMessage += '\n';
          totalSpent += expense.amount;
        });
        shareMessage += `\nTotal Spent: ₹${totalSpent.toLocaleString('en-IN')}\n`;
        if (trip.budget) {
          const remaining = trip.budget - totalSpent;
          shareMessage += `Remaining: ₹${remaining.toLocaleString('en-IN')}\n`;
        }
      } catch (error) {
        console.error("Failed to parse expenses:", error);
      }
    }

    // Add Notes if exists
    if (trip.notes && trip.notes.length > 0) {
      shareMessage += '\n📝 Notes:\n';
      trip.notes.forEach((note: any) => {
        shareMessage += `\n${note.title || 'Note'}:\n`;
        shareMessage += `${note.description}\n`;
      });
    }

    shareMessage += '\nShared via TravelLog App';

    const result = await Share.share({
      message: shareMessage,
      title: `My Trip to ${trip.destination}`,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('Shared with activity type:', result.activityType);
      } else {
        console.log('Shared successfully');
      }
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }

    return result;
  } catch (error) {
    console.error('Error sharing trip:', error);
    throw error;
  }
}; 