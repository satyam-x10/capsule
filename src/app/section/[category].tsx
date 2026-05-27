import React, { useState, useMemo, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Pressable, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DateNavigator } from '@/components/DateNavigator';
import { CapsuleCard } from '@/components/CapsuleCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCapsules } from '@/context/CapsuleContext';
import { getCurrentMonthId } from '@/services/capsuleApi';
import { generateDatesForMonth } from '@/utils/dateHelper';

const VALID_CATEGORIES = [
  'AI & ML',
  'Data Structures & Algorithms',
  'System Design',
  'Database Internals',
  'Web Performance & Networking'
];

export default function SectionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { dailyCapsules, isLoading, fetchDayCapsules } = useCapsules();

  const decodedCategory = useMemo(() => {
    return category ? decodeURIComponent(category) : '';
  }, [category]);

  const isValidSection = useMemo(() => {
    return VALID_CATEGORIES.includes(decodedCategory);
  }, [decodedCategory]);

  // Generate available days for the current calendar month
  const availableDates = useMemo(() => {
    const monthId = getCurrentMonthId();
    return generateDatesForMonth(monthId);
  }, []);

  // Selected date state (defaults to the latest day)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return availableDates[availableDates.length - 1] || '';
  });

  // Fetch the daily capsule for the selected date on-demand
  useEffect(() => {
    if (selectedDate && isValidSection) {
      fetchDayCapsules(selectedDate);
    }
  }, [selectedDate, isValidSection]);

  // Get the active capsule for this section on the selected date
  const activeCapsule = useMemo(() => {
    const dayCapsules = dailyCapsules[selectedDate] || [];
    return dayCapsules.find((c) => c.category === decodedCategory) || null;
  }, [dailyCapsules, selectedDate, decodedCategory]);

  if (!isValidSection) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="default">Section not found.</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="linkPrimary">Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Navigation Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText type="code" style={styles.backText}>
              ← TOPICS
            </ThemedText>
          </Pressable>
          <ThemedText type="code" style={styles.headerCategory} themeColor="textSecondary">
            {decodedCategory.toUpperCase()}
          </ThemedText>
        </View>

        {/* Date Navigation */}
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableDates={availableDates}
        />

        {/* Scrollable list of cards for this date */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introBox}>
            <ThemedText type="code" style={styles.introLabel} themeColor="textSecondary">
              DAILY CONCEPT
            </ThemedText>
            <ThemedText type="small" style={styles.introText} themeColor="textSecondary">
              Tap the card below to read the full engineering capsule detailing this concept.
            </ThemedText>
          </View>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText type="code" style={styles.loaderText} themeColor="textSecondary">
                LOADING DAILY TOPIC...
              </ThemedText>
            </View>
          ) : activeCapsule ? (
            <CapsuleCard capsule={activeCapsule} />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText type="small" themeColor="textSecondary">
                No topic available for this edition.
              </ThemedText>
            </View>
          )}
        </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1D1F',
    alignSelf: 'stretch',
  },
  backButton: {
    paddingVertical: Spacing.one,
  },
  backText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerCategory: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: 'bold',
    maxWidth: 200,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  introBox: {
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  introLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: Spacing.half,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
  },
  loaderContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loaderText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  emptyState: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
