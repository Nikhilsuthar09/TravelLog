// src/utils/getMarkedDates.ts
import { COLORS } from "../constants/theme";

export const getMarkedDates = (start: string, end: string) => {
  const marked: any = {};

  if (!start) return marked;

  // If only startDate is selected
  if (start && !end) {
    marked[start] = {
      startingDay: true,
      endingDay: true,
      color: COLORS.calendarStartColor,
      textColor: COLORS.calendarTextColor,
    };
    return marked;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  let current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];

    if (dateStr === start) {
      marked[dateStr] = {
        startingDay: true,
        color: COLORS.calendarStartColor,
        textColor: COLORS.calendarTextColor,
      };
    } else if (dateStr === end) {
      marked[dateStr] = {
        endingDay: true,
        color: COLORS.calendarEndColor,
        textColor: COLORS.calendarTextColor,
      };
    } else {
      marked[dateStr] = {
        color: COLORS.calendarMiddleColor,
        textColor: COLORS.calendarMiddleTextColor,
      };
    }

    current.setDate(current.getDate() + 1);
  }

  return marked;
};
