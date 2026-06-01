import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarView } from '@/components/CalendarView';
import { ConvoPracticeView } from '@/components/ConvoPracticeView';
import { DateNavigator } from '@/components/DateNavigator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCapsules } from '@/context/CapsuleContext';
import { useTheme } from '@/hooks/use-theme';
import { getConvo } from '@/services/capsuleApi';
import { ConvoData, Capsule } from '@/types/capsule';
import { formatDateString } from '@/utils/dateHelper';

const getDateSeed = (dateStr: string): number => {
  if (!dateStr) return 0;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 10000;
};

const getSectionEmoji = (id: number): string => {
  switch (id) {
    case 1: return '🤖';
    case 2: return '💻';
    case 3: return '📈';
    case 4: return '🗣️';
    case 5: return '💰';
    case 6: return '🧠';
    default: return '📦';
  }
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'capsules' | 'convo'>('home');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [convoData, setConvoData] = useState<ConvoData | null>(null);
  const [isConvoLoading, setIsConvoLoading] = useState<boolean>(false);
  const [convoError, setConvoError] = useState<string | null>(null);

  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState<boolean>(false);
  const [isCapsuleLoading, setIsCapsuleLoading] = useState<boolean>(false);

  const theme = useTheme();
  const { sections = [], dailyCapsules, isLoading, error, refresh, fetchDayCapsules } = useCapsules();

  const handleSectionPress = async (sectionId: number) => {
    setIsCapsuleModalOpen(true);
    setIsCapsuleLoading(true);
    try {
      const dayCapsules = await fetchDayCapsules(selectedDate);
      const capsule = dayCapsules.find((c) => c.sectionId === sectionId) || null;
      setSelectedCapsule(capsule);
    } catch (err) {
      console.error('[HomeScreen] Failed to load day capsule:', err);
      setSelectedCapsule(null);
    } finally {
      setIsCapsuleLoading(false);
    }
  };

  const loadConvo = async () => {
    if (!selectedDate) return;
    setIsConvoLoading(true);
    setConvoError(null);
    try {
      const data = await getConvo(selectedDate);
      setConvoData(data);
    } catch (err) {
      console.error('[HomeScreen] Failed to load convo:', err);
      setConvoError('Failed to load conversation.');
      setConvoData(null);
    } finally {
      setIsConvoLoading(false);
    }
  };

  useEffect(() => {
    loadConvo();
    if (selectedDate) {
      fetchDayCapsules(selectedDate).catch(err => {
        console.error('[HomeScreen] Pre-fetching day capsules failed:', err);
      });
    }
  }, [selectedDate]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* App Branding Header */}
        {activeTab === 'home' && (
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
        )}

        {/* Topics Header */}
        {activeTab === 'capsules' && (
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <ThemedText type="subtitle" style={styles.brandTitle}>
                  Daily Capsules
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
                  Choose a category to start learning for {formatDateString(selectedDate)}
                </ThemedText>
              </View>
            </View>
          </View>
        )}


        {activeTab === 'home' && showCalendar && (
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
          />
        )}

        {activeTab === 'home' ? (
          <View style={styles.homeTabContainer}>
            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <ScrollView
              style={styles.homeScroll}
              contentContainerStyle={styles.homeScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.imageCard}>
                <View style={styles.imageHeader}>
                  <ThemedText type="smallBold" style={styles.imageTag}>
                    🖼️ DAILY VIEW
                  </ThemedText>
                </View>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: `https://picsum.photos/600/850?random=${getDateSeed(selectedDate)}` }}
                    style={styles.randomImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        ) : activeTab === 'convo' ? (
          isConvoLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <ThemedText type="code" style={styles.loadingText} themeColor="textSecondary">
                FETCHING CONVERSATION...
              </ThemedText>
            </View>
          ) : convoError ? (
            <View style={styles.errorContainer}>
              <ThemedText type="default" style={styles.errorText}>
                {convoError}
              </ThemedText>
              <Pressable onPress={loadConvo} style={styles.retryButton}>
                <ThemedText type="code" style={styles.retryText}>
                  RETRY
                </ThemedText>
              </Pressable>
            </View>
          ) : convoData ? (
            <ConvoPracticeView convo={convoData} />
          ) : (
            <View style={styles.blankTabContainer}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.blankTabText}>
                No conversation available for this edition.
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={[styles.blankTabText, { marginTop: 4, fontSize: 11 }]}>
                Try selecting a different date from the calendar.
              </ThemedText>
            </View>
          )
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
                    <View style={styles.emojiContainer}>
                      <ThemedText style={styles.sectionEmojiBg}>
                        {getSectionEmoji(section.id)}
                      </ThemedText>
                    </View>
                    <View style={styles.cardContent}>
                      <ThemedText type="default" style={styles.sectionTitle} numberOfLines={3}>
                        {section.name}
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
            onPress={() => setActiveTab('home')}
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === 'home' && styles.activeTabButton,
              pressed && styles.tabBarPressed,
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'home' && styles.activeTabText,
              ]}
            >
              Home
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('capsules')}
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === 'capsules' && styles.activeTabButton,
              pressed && styles.tabBarPressed,
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'capsules' && styles.activeTabText,
              ]}
            >
              Capsules
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('convo')}
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === 'convo' && styles.activeTabButton,
              pressed && styles.tabBarPressed,
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'convo' && styles.activeTabText,
              ]}
            >
              Convo
            </ThemedText>
          </Pressable>
        </View>

        {/* Full-Screen Capsule Reader Modal */}
        <Modal
          visible={isCapsuleModalOpen}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setIsCapsuleModalOpen(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <SafeAreaView style={styles.modalSafeArea} edges={['top', 'left', 'right', 'bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setIsCapsuleModalOpen(false)} style={styles.modalBackButton}>
                  <ThemedText type="code" style={styles.modalBackText}>
                    ← CLOSE
                  </ThemedText>
                </Pressable>
                {selectedCapsule && (
                  <ThemedText type="code" style={styles.modalHeaderCategory} themeColor="textSecondary">
                    {selectedCapsule.category.toUpperCase()}
                  </ThemedText>
                )}
              </View>

              {isCapsuleLoading ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <ThemedText type="code" style={styles.modalLoadingText} themeColor="textSecondary">
                    LOADING CAPSULE...
                  </ThemedText>
                </View>
              ) : selectedCapsule ? (
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Title & Metadata */}
                  <View style={styles.modalTitleSection}>
                    <ThemedText type="subtitle" style={styles.modalTitle}>
                      {selectedCapsule.title}
                    </ThemedText>
                    <View style={styles.modalMetadata}>
                      <ThemedText type="code" style={styles.modalMetaText} themeColor="textSecondary">
                        {selectedCapsule.readTime}
                      </ThemedText>
                      <ThemedText type="code" style={styles.modalMetaDivider} themeColor="textSecondary">
                        •
                      </ThemedText>
                      <ThemedText type="code" style={styles.modalMetaText} themeColor="textSecondary">
                        Published: {formatDateString(selectedCapsule.date)}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.modalDivider} />

                  {/* Reading Content */}
                  <View style={styles.modalContentSection}>
                    {selectedCapsule.content.split('\n\n').map((p, idx) => (
                      <ThemedText key={idx} style={styles.modalParagraph}>
                        {p}
                      </ThemedText>
                    ))}
                  </View>

                  {/* Takeaway Section */}
                  <View style={styles.modalTakeawayContainer}>
                    <View style={styles.modalTakeawayAccent} />
                    <View style={styles.modalTakeawayContent}>
                      <ThemedText type="code" style={styles.modalTakeawayLabel}>
                        KEY TAKEAWAY
                      </ThemedText>
                      <ThemedText style={styles.modalTakeawayText}>
                        {selectedCapsule.takeaway}
                      </ThemedText>
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.modalLoadingContainer}>
                  <ThemedText type="default" style={styles.modalLoadingText}>
                    No capsule available for this section today.
                  </ThemedText>
                  <Pressable onPress={() => setIsCapsuleModalOpen(false)} style={styles.modalRetryButton}>
                    <ThemedText type="code" style={styles.modalRetryText}>
                      GO BACK
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </SafeAreaView>
          </ThemedView>
        </Modal>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    textAlign: 'center',
  },
  emojiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sectionEmojiBg: {
    fontSize: 100,
    lineHeight: 100,
    opacity: 0.08,
    textAlign: 'center',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.4)',
      },
    }),
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
  homeTabContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
  },
  welcomeContainer: {
    padding: Spacing.four,
    backgroundColor: '#0F1011',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 16,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 22,
  },
  homeScroll: {
    flex: 1,
    width: '100%',
  },
  homeScrollContent: {
    paddingBottom: BottomTabInset + Spacing.six + 40,
  },
  imageCard: {
    padding: Spacing.four,
    backgroundColor: '#0F1011',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 16,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.half,
  },
  imageTag: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  refreshImageButton: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  refreshImageText: {
    color: '#B0B4BA',
    fontSize: 11,
    fontWeight: '600',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#121314',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  randomImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  modalSafeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1D1F',
    alignSelf: 'stretch',
  },
  modalBackButton: {
    paddingVertical: Spacing.one,
  },
  modalBackText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalHeaderCategory: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  modalTitleSection: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    color: '#FFFFFF',
  },
  modalMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalMetaText: {
    fontSize: 12,
  },
  modalMetaDivider: {
    fontSize: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#2E3135',
    marginVertical: Spacing.three,
  },
  modalContentSection: {
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  modalParagraph: {
    fontSize: 17,
    lineHeight: 27,
    color: '#E0E1E6',
    fontWeight: '400',
  },
  modalTakeawayContainer: {
    flexDirection: 'row',
    backgroundColor: '#111214',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.five,
  },
  modalTakeawayAccent: {
    width: 4,
    backgroundColor: '#FFFFFF',
  },
  modalTakeawayContent: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  modalTakeawayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  modalTakeawayText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#E0E1E6',
    fontStyle: 'italic',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    gap: Spacing.three,
  },
  modalLoadingText: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#B0B4BA',
  },
  modalRetryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginTop: Spacing.one,
  },
  modalRetryText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
});
