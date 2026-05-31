import { Spacing } from '@/constants/theme';
import { formatDateString } from '@/utils/dateHelper';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableDates?: string[];
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const getOffsetDate = (offset: number) => {
    if (!selectedDate || !selectedDate.includes('-')) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const [yearStr, monthStr, dayStr] = selectedDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const date = new Date(year, month, day);
    date.setDate(date.getDate() + offset);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');

    return `${newYear}-${newMonth}-${newDay}`;
  };

  const handlePrev = () => {
    onDateChange(getOffsetDate(-1));
  };

  const handleNext = () => {
    onDateChange(getOffsetDate(1));
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable
        onPress={handlePrev}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <ThemedText style={styles.arrow} themeColor="text">
          ←
        </ThemedText>
      </Pressable>

      <View style={styles.dateLabelContainer}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.subtext}>
          DAILY ISSUE
        </ThemedText>
        <ThemedText type="default" style={styles.dateText}>
          {formatDateString(selectedDate)}
        </ThemedText>
      </View>

      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <ThemedText style={styles.arrow} themeColor="text">
          →
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3135', // Subtle dark border
    alignSelf: 'stretch',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  disabledButton: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateLabelContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.six,
  },
  subtext: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: Spacing.half,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
