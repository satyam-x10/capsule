import React, { useState, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DateNavigator } from '@/components/DateNavigator';
import { CapsuleCard } from '@/components/CapsuleCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { capsules } from '@/data/capsules';

export default function SectionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  // Filter capsules by this category
  const sectionCapsules = useMemo(() => {
    if (!category) return [];
    // Decode URI component if category contains special characters like "&"
    const decodedCategory = decodeURIComponent(category);
    return capsules.filter((c) => c.category === decodedCategory);
  }, [category]);

  // Extract unique sorted dates for this category
  const availableDates = useMemo(() => {
    return Array.from(new Set(sectionCapsules.map((c) => c.date))).sort();
  }, [sectionCapsules]);

  // Initialize selected date to the latest available date for this category
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return availableDates[availableDates.length - 1] || '';
  });

  // Filtered capsule(s) for the selected date
  const activeCapsules = useMemo(() => {
    return sectionCapsules.filter((c) => c.date === selectedDate);
  }, [sectionCapsules, selectedDate]);

  if (!category || sectionCapsules.length === 0) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="default">Section not found.</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="linkPrimary">Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const decodedCategory = decodeURIComponent(category);

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
        {availableDates.length > 0 && (
          <DateNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            availableDates={availableDates}
          />
        )}

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
              TODAY'S TOPIC
            </ThemedText>
            <ThemedText type="small" style={styles.introText} themeColor="textSecondary">
              Tap the card below to read the full engineering capsule detailing this concept.
            </ThemedText>
          </View>

          {activeCapsules.length > 0 ? (
            activeCapsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText type="small" themeColor="textSecondary">
                No topic available for this date.
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
  emptyState: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
