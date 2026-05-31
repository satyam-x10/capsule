import { Spacing } from '@/constants/theme';
import { formatDateString } from '@/utils/dateHelper';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableDates: string[];
}

export function DateNavigator({ selectedDate, onDateChange, availableDates }: DateNavigatorProps) {
  const currentIndex = availableDates.indexOf(selectedDate);

  const hasPrev = currentIndex > 0;
  const hasNext = true;
  // const hasNext = currentIndex < availableDates.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onDateChange(availableDates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onDateChange(availableDates[currentIndex + 1]);
    }
  };


  return (
    <ThemedView style={styles.container}>
      <Pressable
        onPress={handlePrev}
        disabled={!hasPrev}
        style={({ pressed }) => [
          styles.button,
          !hasPrev && styles.disabledButton,
          pressed && hasPrev && styles.pressed,
        ]}
      >
        <ThemedText style={styles.arrow} themeColor={hasPrev ? 'text' : 'textSecondary'}>
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
        disabled={!hasNext}
        style={({ pressed }) => [
          styles.button,
          !hasNext && styles.disabledButton,
          pressed && hasNext && styles.pressed,
        ]}
      >
        <ThemedText style={styles.arrow} themeColor={hasNext ? 'text' : 'textSecondary'}>
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
    justifyContent: 'space-between',
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
    flex: 1,
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
