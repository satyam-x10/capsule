import React, { useState, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateNavigator } from '@/components/DateNavigator';
import { CapsuleCard } from '@/components/CapsuleCard';
import { TabBar } from '@/components/TabBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { capsules } from '@/data/capsules';

export default function HomeScreen() {
  const theme = useTheme();

  // Extract unique sorted dates
  const availableDates = useMemo(() => {
    return Array.from(new Set(capsules.map((c) => c.date))).sort();
  }, []);

  // Default to the latest date
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[availableDates.length - 1] || '2026-05-27'
  );

  // Filter capsules for the selected date
  const filteredCapsules = useMemo(() => {
    return capsules.filter((c) => c.date === selectedDate);
  }, [selectedDate]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* App Branding Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.brandTitle}>
            Capsule
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
            Daily byte-sized insights for engineers.
          </ThemedText>
        </View>

        {/* Date Navigation */}
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableDates={availableDates}
        />

        {/* Scrollable list of cards */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + Spacing.five },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredCapsules.length > 0 ? (
            filteredCapsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText type="small" themeColor="textSecondary">
                No capsules available for this date.
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Navigation Bar */}
        <TabBar />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'web' ? Spacing.four : Spacing.two,
    paddingBottom: Spacing.three,
    alignSelf: 'stretch',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: Spacing.half,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  emptyState: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
