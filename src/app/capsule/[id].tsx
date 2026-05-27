import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCapsules } from '@/context/CapsuleContext';
import { formatDateString } from '@/utils/dateHelper';
import { getTodayDateStr } from '@/services/capsuleApi';
import { useEffect, useState } from 'react';

export default function CapsuleDetailScreen() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const router = useRouter();
  const { dailyCapsules, isLoading, fetchDayCapsules } = useCapsules();
  const [detailError, setDetailError] = useState<boolean>(false);

  const activeDate = date || getTodayDateStr();

  // Load the daily capsule file if not in memory
  const loadDetail = async () => {
    if (activeDate) {
      try {
        setDetailError(false);
        await fetchDayCapsules(activeDate);
      } catch (err) {
        console.error('[CapsuleDetailScreen] Failed to load day capsules:', err);
        setDetailError(true);
      }
    }
  };

  useEffect(() => {
    loadDetail();
  }, [activeDate]);

  const dayCapsules = dailyCapsules[activeDate] || [];
  const capsule = dayCapsules.find((c) => c.id === id);

  if (detailError) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="default" style={styles.errorText}>
          An error occurred while loading content.
        </ThemedText>
        <Pressable onPress={loadDetail} style={styles.retryButton}>
          <ThemedText type="code" style={styles.retryText}>
            RETRY
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <ThemedText type="code" style={styles.loadingText} themeColor="textSecondary">
          LOADING TEXT...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!capsule) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="default">Capsule not found.</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="linkPrimary">Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Split content by double newlines for paragraph spacing
  const paragraphs = capsule.content.split('\n\n');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Navigation Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText type="code" style={styles.backText}>
              ← BACK
            </ThemedText>
          </Pressable>
          <ThemedText type="code" style={styles.headerCategory} themeColor="textSecondary">
            {capsule.category.toUpperCase()}
          </ThemedText>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title & Metadata */}
          <View style={styles.titleSection}>
            <ThemedText type="subtitle" style={styles.title}>
              {capsule.title}
            </ThemedText>
            <View style={styles.metadata}>
              <ThemedText type="code" style={styles.metaText} themeColor="textSecondary">
                {capsule.readTime}
              </ThemedText>
              <ThemedText type="code" style={styles.metaDivider} themeColor="textSecondary">
                •
              </ThemedText>
              <ThemedText type="code" style={styles.metaText} themeColor="textSecondary">
                Published: {formatDateString(capsule.date)}
              </ThemedText>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Reading Content */}
          <View style={styles.contentSection}>
            {paragraphs.map((p, idx) => (
              <ThemedText key={idx} style={styles.paragraph}>
                {p}
              </ThemedText>
            ))}
          </View>

          {/* Takeaway Section */}
          <View style={styles.takeawayContainer}>
            <View style={styles.takeawayAccent} />
            <View style={styles.takeawayContent}>
              <ThemedText type="code" style={styles.takeawayLabel}>
                KEY TAKEAWAY
              </ThemedText>
              <ThemedText style={styles.takeawayText}>
                {capsule.takeaway}
              </ThemedText>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 12,
    letterSpacing: 1,
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
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  titleSection: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    color: '#FFFFFF',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaText: {
    fontSize: 12,
  },
  metaDivider: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#2E3135',
    marginVertical: Spacing.three,
  },
  contentSection: {
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 27,
    color: '#E0E1E6',
    fontWeight: '400',
  },
  takeawayContainer: {
    flexDirection: 'row',
    backgroundColor: '#111214',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.five,
  },
  takeawayAccent: {
    width: 4,
    backgroundColor: '#FFFFFF',
  },
  takeawayContent: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  takeawayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  takeawayText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#E0E1E6',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#B0B4BA',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginTop: Spacing.one,
  },
  retryText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
});
