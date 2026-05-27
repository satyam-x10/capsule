import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { capsules } from '@/data/capsules';
import { getRevisionById, saveRevision, removeRevision } from '@/store/revisionStore';

export default function CapsuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const capsule = capsules.find((c) => c.id === id);

  const [isLoading, setIsLoading] = useState(true);
  const [isMarked, setIsMarked] = useState(false);
  const [note, setNote] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load existing revision data on mount
  useEffect(() => {
    async function loadRevision() {
      if (!id) return;
      const revision = await getRevisionById(id);
      if (revision) {
        setIsMarked(true);
        setNote(revision.note);
      }
      setIsLoading(false);
    }
    loadRevision();
  }, [id]);

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

  const handleToggleMark = async () => {
    const newMarked = !isMarked;
    setIsMarked(newMarked);
    
    if (!newMarked) {
      // If unmarking, remove from store immediately
      setSaveStatus('saving');
      await removeRevision(capsule.id);
      setSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    if (isMarked) {
      await saveRevision(capsule.id, capsule.title, capsule.category, note);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      await removeRevision(capsule.id);
      setNote('');
      setSaveStatus('idle');
    }
  };

  // Split content by paragraphs to render them beautifully
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
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
                  Published: {capsule.date}
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

            {/* Revision Section */}
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
            ) : (
              <View style={styles.revisionContainer}>
                <View style={styles.revisionHeader}>
                  <Pressable
                    onPress={handleToggleMark}
                    style={styles.checkboxRow}
                  >
                    <View style={[styles.checkbox, isMarked && styles.checkboxChecked]}>
                      {isMarked && <View style={styles.checkboxInner} />}
                    </View>
                    <ThemedText type="default" style={styles.revisionLabel}>
                      Mark for Revision
                    </ThemedText>
                  </Pressable>

                  {saveStatus === 'saving' && (
                    <ThemedText type="code" style={styles.statusText} themeColor="textSecondary">
                      Saving...
                    </ThemedText>
                  )}
                  {saveStatus === 'saved' && (
                    <ThemedText type="code" style={styles.statusTextSaved}>
                      Saved ✓
                    </ThemedText>
                  )}
                </View>

                {isMarked && (
                  <View style={styles.noteContainer}>
                    <ThemedText type="code" style={styles.noteSublabel} themeColor="textSecondary">
                      OPTIONAL NOTE / SUMMARY
                    </ThemedText>
                    <TextInput
                      style={styles.textInput}
                      value={note}
                      onChangeText={setNote}
                      placeholder="Add key highlights, questions or mnemonics..."
                      placeholderTextColor="#60646C"
                      multiline
                      numberOfLines={4}
                    />

                    <Pressable
                      onPress={handleSave}
                      disabled={saveStatus === 'saving'}
                      style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.saveButtonPressed,
                      ]}
                    >
                      <ThemedText type="code" style={styles.saveButtonText}>
                        {saveStatus === 'saving' ? 'SAVING...' : 'SAVE REVISION NOTE'}
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    width: '100%',
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
  loader: {
    marginVertical: Spacing.four,
  },
  revisionContainer: {
    backgroundColor: '#111214',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 8,
    padding: Spacing.three,
  },
  revisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#B0B4BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#000000',
  },
  revisionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
  },
  statusTextSaved: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noteContainer: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  noteSublabel: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    borderColor: '#2E3135',
    borderWidth: 1,
    borderRadius: 6,
    padding: Spacing.two,
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
