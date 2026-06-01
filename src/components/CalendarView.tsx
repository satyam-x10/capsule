import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate && selectedDate.includes('-')) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const now = new Date();
  const todayStr = formatDateToYYYYMMDD(now);

  const daysInGrid: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDate = new Date(currentYear, currentMonth - 1, prevMonthTotalDays - i);
    daysInGrid.push({
      dateStr: formatDateToYYYYMMDD(prevDate),
      dayNum: prevDate.getDate(),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const currDate = new Date(currentYear, currentMonth, i);
    daysInGrid.push({
      dateStr: formatDateToYYYYMMDD(currDate),
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to fill 42 cells (6 rows of 7 days)
  const remainingCells = 42 - daysInGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(currentYear, currentMonth + 1, i);
    daysInGrid.push({
      dateStr: formatDateToYYYYMMDD(nextDate),
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  return (
    <ThemedView type="background" style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <Pressable onPress={handlePrevMonth} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}>
          <ThemedText style={styles.arrowText}>←</ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.monthTitle}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </ThemedText>
        <Pressable onPress={handleNextMonth} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}>
          <ThemedText style={styles.arrowText}>→</ThemedText>
        </Pressable>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((label, idx) => (
          <View key={`weekday-${idx}`} style={styles.weekdayCell}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.weekdayText}>
              {label}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.grid}>
        {daysInGrid.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;

          return (
            <Pressable
              key={`day-${idx}-${item.dateStr}`}
              onPress={() => onDateSelect(item.dateStr)}
              style={styles.cell}
            >
              <View
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedDayContainer,
                  !isSelected && isToday && styles.todayDayContainer,
                  !item.isCurrentMonth && styles.otherMonthDayContainer,
                ]}
              >
                <ThemedText
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    !isSelected && isToday && styles.todayDayText,
                    !item.isCurrentMonth && styles.otherMonthDayText,
                  ]}
                >
                  {item.dayNum}
                </ThemedText>
                {!isSelected && isToday && <View style={styles.todayIndicator} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E3135',
    backgroundColor: '#0C0D0E',
    alignSelf: 'stretch',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  arrowText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.6,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1D1F',
    paddingBottom: Spacing.two,
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  dayContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDayContainer: {
    backgroundColor: '#FFFFFF',
  },
  todayDayContainer: {
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#3E4247',
  },
  otherMonthDayContainer: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedDayText: {
    color: '#000000',
    fontWeight: '700',
  },
  todayDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  otherMonthDayText: {
    color: '#B0B4BA',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
