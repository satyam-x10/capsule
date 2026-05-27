import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TabBar } from '@/components/TabBar';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Revision } from '@/types/capsule';
import { getRevisions, removeRevision } from '@/store/revisionStore';

export default function RevisionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [revisions, setRevisions] = useState<Revision[]>([]);

  // Refresh list when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function loadData() {
        const data = await getRevisions();
        if (isActive) {
          setRevisions(data);
        }
      }
      loadData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleRemove = async (capsuleId: string) => {
    const updated = await removeRevision(capsuleId);
    setRevisions(updated);
  };

  const handleCardPress = (capsuleId: string) => {
    router.push(`/capsule/${capsuleId}` as any);
  };

  const renderRevisionItem = ({ item }: { item: Revision }) => (
    <Pressable
      onPress={() => handleCardPress(item.capsuleId)}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.pressed
      ]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="code" style={styles.category} themeColor="textSecondary">
            {item.category ? item.category.toUpperCase() : 'REVISION'}
          </ThemedText>
          <Pressable
            onPress={() => handleRemove(item.capsuleId)}
            style={styles.removeButton}
          >
            <ThemedText type="code" style={styles.removeText}>
              ✕ REMOVE
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="default" style={styles.title}>
          {item.capsuleTitle}
        </ThemedText>

        {item.note ? (
          <View style={styles.noteBox}>
            <ThemedText type="code" style={styles.noteLabel} themeColor="textSecondary">
              MY NOTES:
            </ThemedText>
            <ThemedText style={styles.noteText}>
              {item.note}
            </ThemedText>
          </View>
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.noNoteText}>
            No custom notes added.
          </ThemedText>
        )}

        <View style={styles.footer}>
          <ThemedText type="code" style={styles.dateText} themeColor="textSecondary">
            Saved: {item.savedDate}
          </ThemedText>
          <ThemedText type="code" style={styles.readLink}>
            Review Capsule →
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Screen Header */}
        <View style={styles.screenHeader}>
          <ThemedText type="subtitle" style={styles.brandTitle}>
            Revisions
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
            Your saved database of engineering concepts.
          </ThemedText>
        </View>

        {/* Revisions List */}
        <FlatList
          data={revisions}
          keyExtractor={(item) => item.capsuleId}
          renderItem={renderRevisionItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: BottomTabInset + Spacing.five },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ThemedText type="code" style={styles.emptyIcon} themeColor="textSecondary">
                💡
              </ThemedText>
              <ThemedText type="default" style={styles.emptyTitle}>
                No revisions saved yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyDesc}>
                Read engineering capsules and mark them for revision to review them here.
              </ThemedText>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

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
  screenHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1D1F',
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
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  cardContainer: {
    marginVertical: Spacing.two,
    alignSelf: 'stretch',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3135',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  removeButton: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.one,
  },
  removeText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#FFFFFF',
  },
  noteBox: {
    backgroundColor: '#000000',
    borderColor: '#2E3135',
    borderWidth: 1,
    borderRadius: 6,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  noteLabel: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#E0E1E6',
  },
  noNoteText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  dateText: {
    fontSize: 11,
  },
  readLink: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.five,
    lineHeight: 20,
  },
});
