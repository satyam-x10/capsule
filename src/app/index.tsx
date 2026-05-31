import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarView } from '@/components/CalendarView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCapsules } from '@/context/CapsuleContext';
import { useTheme } from '@/hooks/use-theme';
import { formatDateString } from '@/utils/dateHelper';
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'topics' | 'communication'>('topics');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const theme = useTheme();
  const router = useRouter();
  const { sections = [], isLoading, error, refresh } = useCapsules();

  const handleSectionPress = (sectionId: number) => {
    router.push({
      pathname: `/section/${sectionId}`,
      params: { date: selectedDate },
    } as any);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* App Branding Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <ThemedText type="subtitle" style={styles.brandTitle}>
                Hi, Satyam
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
                Learn these today as of {formatDateString(selectedDate)}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => setShowCalendar(!showCalendar)}
              style={({ pressed }) => [
                styles.calendarToggleButton,
                showCalendar && styles.calendarActiveButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={[styles.calendarToggleText, showCalendar && styles.calendarActiveText]}>
                {showCalendar ? 'Close ✕' : '📅'}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {showCalendar && (
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
          />
        )}

        {activeTab === 'communication' ? (
          <View style={styles.blankTabContainer}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.blankTabText}>
              Communication tab is blank for now.
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText type="default" style={styles.errorText}>
              An error occurred while loading content.
            </ThemedText>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <ThemedText type="code" style={styles.retryText}>
                RETRY
              </ThemedText>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <ThemedText type="code" style={styles.loadingText} themeColor="textSecondary">
              FETCHING CAPSULES...
            </ThemedText>
          </View>
        ) : (
          /* Scrollable list of sections */
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: BottomTabInset + Spacing.six + 40 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section) => {
              return (
                <Pressable
                  key={section.id}
                  onPress={() => handleSectionPress(section.id)}
                  style={({ pressed }) => [
                    styles.cardContainer,
                    pressed && styles.pressed
                  ]}
                >
                  <ThemedView type="backgroundElement" style={styles.card}>
                    <View style={styles.cardContent}>


                      <ThemedText type="default" style={styles.sectionTitle} numberOfLines={2}>
                        {section.name}
                      </ThemedText>

                      <ThemedText type="small" style={styles.description} themeColor="textSecondary" numberOfLines={3}>
                        {section.description}
                      </ThemedText>
                    </View>

                  </ThemedView>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Floating Custom Bottom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <Pressable
            onPress={() => setActiveTab('topics')}
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === 'topics' && styles.activeTabButton,
              pressed && styles.tabBarPressed,
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'topics' && styles.activeTabText,
              ]}
            >
              Topics
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('communication')}
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === 'communication' && styles.activeTabButton,
              pressed && styles.tabBarPressed,
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'communication' && styles.activeTabText,
              ]}
            >
              Communication
            </ThemedText>
          </Pressable>
        </View>
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
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1D1F',
    alignSelf: 'stretch',
    marginBottom: Spacing.two,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  calendarToggleButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
    marginLeft: Spacing.two,
  },
  calendarActiveButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  calendarToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0B4BA',
  },
  calendarActiveText: {
    color: '#000000',
    fontWeight: '700',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: Spacing.three,
  },
  card: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3135',
    justifyContent: 'space-between',
  },
  cardContent: {
    gap: Spacing.one,
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    marginTop: Spacing.half,
  },
  capsuleCount: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    color: '#B0B4BA',
    marginTop: Spacing.half,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: Spacing.one,
  },
  actionText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  errorText: {
    fontSize: 14,
    color: '#B0B4BA',
    textAlign: 'center',
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
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 29, 31, 0.92)',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 30,
    padding: 6,
    alignSelf: 'center',
    width: 320,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
  },
  activeTabButton: {
    backgroundColor: '#2E3135',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#B0B4BA',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBarPressed: {
    opacity: 0.85,
  },
  blankTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankTabText: {
    fontSize: 14,
    color: '#B0B4BA',
  },
});
