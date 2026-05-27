import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCapsules } from '@/context/CapsuleContext';
import { getTodayDateStr } from '@/services/capsuleApi';

interface SectionInfo {
  name: string;
  description: string;
}

const SECTIONS: SectionInfo[] = [
  {
    name: 'AI & ML',
    description: 'Neural network architectures, self-attention mechanics, and model optimizations.',
  },
  {
    name: 'Data Structures & Algorithms',
    description: 'B-Trees, Bloom filters, cache designs, and space-efficient architectures.',
  },
  {
    name: 'System Design',
    description: 'Distributed consensus, logical time, conflict resolution, and CQRS setups.',
  },
  {
    name: 'Database Internals',
    description: 'Storage engines, WAL logs, MVCC models, and crash recovery systems.',
  },
  {
    name: 'Web Performance & Networking',
    description: 'UDP-based QUIC, TCP BBR congestion modeling, and fast TLS encryption.',
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { dailyCapsules, isLoading } = useCapsules();

  const todayStr = getTodayDateStr();
  const todayCapsules = dailyCapsules[todayStr] || [];

  const handleSectionPress = (sectionName: string) => {
    router.push(`/section/${sectionName}` as any);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* App Branding Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.brandTitle}>
            Hi, Satyam
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
            Learn these today as of {new Date().toLocaleDateString()}
          </ThemedText>
        </View>

        {isLoading ? (
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
              { paddingBottom: BottomTabInset + Spacing.four },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {SECTIONS.map((section) => {
              const hasCapsuleForToday = todayCapsules.some((c) => c.category === section.name);

              return (
                <Pressable
                  key={section.name}
                  onPress={() => handleSectionPress(section.name)}
                  style={({ pressed }) => [
                    styles.cardContainer,
                    pressed && styles.pressed
                  ]}
                >
                  <ThemedView type="backgroundElement" style={styles.card}>
                    <View style={styles.cardContent}>
                      <ThemedText type="code" style={styles.capsuleCount} themeColor="textSecondary">
                        {hasCapsuleForToday ? 'DAILY ISSUE' : 'ARCHIVE ONLY'}
                      </ThemedText>
                      
                      <ThemedText type="default" style={styles.sectionTitle} numberOfLines={2}>
                        {section.name}
                      </ThemedText>

                      <ThemedText type="small" style={styles.description} themeColor="textSecondary" numberOfLines={3}>
                        {section.description}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <ThemedText type="code" style={styles.actionText}>
                        Open →
                      </ThemedText>
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
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
});
