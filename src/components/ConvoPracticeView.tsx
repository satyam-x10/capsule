import React, { useState, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { Spacing } from '@/constants/theme';
import { ConvoData, ConvoUtterance, VocabularyWord } from '@/types/capsule';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ConvoPracticeViewProps {
  convo: ConvoData;
}

export function ConvoPracticeView({ convo }: ConvoPracticeViewProps) {
  const { conversation, vocabulary, title, theme, takeaway } = convo;

  // Sub-tab Navigation state
  const [activeSubTab, setActiveSubTab] = useState<'dialogue' | 'vocabulary'>('dialogue');

  // Dialogue Practice States
  const [selectedUtteranceIndex, setSelectedUtteranceIndex] = useState<number | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const typingInputRef = useRef<TextInput>(null);

  // Vocabulary Matching Game States
  const [vocabAnswers, setVocabAnswers] = useState<Record<number, string>>({}); // indexed by shuffled meanings index

  // Shuffled Word Bank & Meanings lists
  const shuffledWords = useMemo(() => {
    return [...vocabulary].map(v => v.word).sort(() => Math.random() - 0.5);
  }, [vocabulary]);

  const shuffledMeanings = useMemo(() => {
    return [...vocabulary]
      .map((v, idx) => ({ ...v, originalIndex: idx }))
      .sort(() => Math.random() - 0.5);
  }, [vocabulary]);

  // Current focused utterance
  const activeUtterance = selectedUtteranceIndex !== null ? conversation[selectedUtteranceIndex] : null;

  const handleSelectUtterance = (idx: number) => {
    setSelectedUtteranceIndex(idx);
    setTypedText('');
    setIsPracticeModalOpen(true);
    setTimeout(() => {
      typingInputRef.current?.focus();
    }, 150);
  };

  const handleNextUtterance = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex < conversation.length - 1) {
      handleSelectUtterance(selectedUtteranceIndex + 1);
    }
  };

  // Real-time character accuracy matching for dialogue practice (case-insensitive)
  const renderTypedCharacters = () => {
    if (!activeUtterance) return null;
    const target = activeUtterance.text;
    const chars = target.split('');

    return (
      <View style={styles.charContainer}>
        {chars.map((char, index) => {
          let charColor = '#60646C'; // Grey (untyped)
          let charBg = 'transparent';

          if (index < typedText.length) {
            // Case-insensitive comparison for typing feedback
            if (typedText[index].toLowerCase() === char.toLowerCase()) {
              charColor = '#4CAF50'; // Green (correct)
            } else {
              charColor = '#F44336'; // Red (incorrect)
              charBg = 'rgba(244, 67, 54, 0.15)'; // Subtle red highlight for typos
            }
          }

          // Show a cursor indicator
          const isCursor = index === typedText.length;

          return (
            <View key={`char-${index}`} style={[styles.charBox, { backgroundColor: charBg }, isCursor && styles.cursorCharBox]}>
              <ThemedText
                style={[
                  styles.charText,
                  { color: charColor },
                  isCursor && styles.cursorCharText
                ]}
              >
                {char === ' ' ? ' ' : char}
              </ThemedText>
            </View>
          );
        })}
      </View>
    );
  };

  // Case-insensitive match check for completion
  const isDialogueCompleted = activeUtterance && typedText.toLowerCase() === activeUtterance.text.toLowerCase();

  // Vocab Matching Logic
  const handleVocabAnswerChange = (shuffledIdx: number, val: string) => {
    setVocabAnswers(prev => ({
      ...prev,
      [shuffledIdx]: val
    }));
  };

  // Calculate score/correct matches in vocabulary (case-insensitive)
  const vocabCorrectStatus = useMemo(() => {
    const status: Record<number, boolean> = {};
    shuffledMeanings.forEach((item, idx) => {
      const userAns = (vocabAnswers[idx] || '').trim().toLowerCase();
      const correctAns = item.word.trim().toLowerCase();
      status[idx] = userAns === correctAns;
    });
    return status;
  }, [vocabAnswers, shuffledMeanings]);

  const correctVocabCount = useMemo(() => {
    return Object.values(vocabCorrectStatus).filter(Boolean).length;
  }, [vocabCorrectStatus]);

  const resetVocabGame = () => {
    setVocabAnswers({});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Title block */}
      <View style={styles.titleCard}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.themeTag}>
          {theme.toUpperCase()}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.convoTitle}>
          {title}
        </ThemedText>
      </View>

      {/* Premium Horizontal Sub-Tabs Switcher */}
      <View style={styles.subTabBar}>
        <Pressable
          onPress={() => setActiveSubTab('dialogue')}
          style={({ pressed }) => [
            styles.subTabButton,
            activeSubTab === 'dialogue' && styles.activeSubTabButton,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={[styles.subTabText, activeSubTab === 'dialogue' && styles.activeSubTabText]}>
            Dialogue Practice
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('vocabulary')}
          style={({ pressed }) => [
            styles.subTabButton,
            activeSubTab === 'vocabulary' && styles.activeSubTabButton,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={[styles.subTabText, activeSubTab === 'vocabulary' && styles.activeSubTabText]}>
            Vocabulary Game
          </ThemedText>
        </Pressable>
      </View>

      {/* Conditionally Render dialogue list vs vocabulary matching */}
      {activeSubTab === 'dialogue' ? (
        <View>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              DIALOGUE TYPING PRACTICE
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Tap any bubble to practice typing it.
            </ThemedText>
          </View>

          <View style={styles.dialogueList}>
            {conversation.map((utterance, idx) => {
              const isSelected = selectedUtteranceIndex === idx;
              const isSpeakerA = idx % 2 === 0;

              return (
                <Pressable
                  key={`convo-line-${idx}`}
                  onPress={() => handleSelectUtterance(idx)}
                  style={[
                    styles.dialogueRow,
                    isSpeakerA ? styles.rowLeft : styles.rowRight,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isSpeakerA ? styles.bubbleLeft : styles.bubbleRight,
                      isSelected && styles.bubbleSelected,
                    ]}
                  >
                    <ThemedText style={styles.speakerName} themeColor="textSecondary">
                      {utterance.speaker}
                    </ThemedText>
                    <ThemedText style={styles.bubbleText}>
                      {utterance.text}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Dialogue Practice Modal Overlay */}
          {activeUtterance && (
            <Modal
              visible={isPracticeModalOpen}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setIsPracticeModalOpen(false)}
            >
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalKeyboardAvoiding}
                >
                  <ThemedView type="backgroundSelected" style={styles.modalCard}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                      <ThemedText type="smallBold" style={styles.practiceTitle}>
                        PRACTICING {activeUtterance.speaker.toUpperCase()}'S LINE
                      </ThemedText>
                      <Pressable
                        onPress={() => setIsPracticeModalOpen(false)}
                        style={({ pressed }) => [styles.closeModalButton, pressed && styles.pressed]}
                      >
                        <ThemedText style={styles.closeModalText}>✕</ThemedText>
                      </Pressable>
                    </View>

                    {/* Character practice grid */}
                    <View style={styles.targetDisplay}>
                      {renderTypedCharacters()}
                    </View>

                    <TextInput
                      ref={typingInputRef}
                      style={styles.typingInput}
                      value={typedText}
                      onChangeText={(text) => {
                        // Prevent typing longer than the target text
                        if (text.length <= activeUtterance.text.length) {
                          setTypedText(text);
                        }
                      }}
                      placeholder="Type the dialogue exactly above..."
                      placeholderTextColor="#60646C"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                      autoFocus={true}
                    />

                    {isDialogueCompleted && (
                      <View style={styles.completedWrapper}>
                        <ThemedText type="smallBold" style={styles.completedTag}>
                          ✓ PERFECT MATCH!
                        </ThemedText>

                        {selectedUtteranceIndex! < conversation.length - 1 ? (
                          <Pressable onPress={handleNextUtterance} style={styles.nextLineButton}>
                            <ThemedText type="code" style={styles.nextLineButtonText}>
                              NEXT LINE →
                            </ThemedText>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => setIsPracticeModalOpen(false)}
                            style={[styles.nextLineButton, { backgroundColor: '#4CAF50' }]}
                          >
                            <ThemedText type="code" style={[styles.nextLineButtonText, { color: '#FFFFFF' }]}>
                              FINISH & CLOSE
                            </ThemedText>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </ThemedView>
                </KeyboardAvoidingView>
              </View>
            </Modal>
          )}
        </View>
      ) : (
        <View>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              VOCABULARY MATCHING CHALLENGE
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Type the correct word from the bank next to its meaning.
            </ThemedText>
          </View>

          {/* Word Bank Display */}
          <View style={styles.wordBankContainer}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.bankLabel}>
              WORD BANK:
            </ThemedText>
            <View style={styles.wordBankGrid}>
              {shuffledWords.map((word, idx) => {
                const isMatched = shuffledMeanings.some((item, mIdx) => {
                  return item.word.toLowerCase() === word.toLowerCase() && vocabCorrectStatus[mIdx];
                });

                return (
                  <View
                    key={`bank-word-${idx}`}
                    style={[
                      styles.wordBankPill,
                      isMatched && styles.wordBankPillMatched
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.wordBankText,
                        isMatched && styles.wordBankTextMatched
                      ]}
                    >
                      {word}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Matching Questions */}
          <View style={styles.vocabList}>
            {shuffledMeanings.map((item, idx) => {
              const isCorrect = vocabCorrectStatus[idx];

              return (
                <ThemedView key={`vocab-match-${idx}`} type="backgroundElement" style={styles.vocabMatchCard}>
                  <View style={styles.vocabMeaningContainer}>
                    <ThemedText style={styles.meaningText}>
                      • {item.meaning}
                    </ThemedText>
                  </View>

                  <View style={styles.vocabInputWrapper}>
                    <TextInput
                      style={[
                        styles.vocabInput,
                        isCorrect && styles.vocabInputCorrect
                      ]}
                      value={vocabAnswers[idx] || ''}
                      onChangeText={(text) => handleVocabAnswerChange(idx, text)}
                      placeholder="Type word..."
                      placeholderTextColor="#60646C"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isCorrect} // Lock input once matched correctly
                    />
                    {isCorrect && (
                      <View style={styles.checkWrapper}>
                        <ThemedText style={styles.checkText}>✓</ThemedText>
                      </View>
                    )}
                  </View>
                </ThemedView>
              );
            })}
          </View>

          {/* Game completion Card */}
          {correctVocabCount === vocabulary.length ? (
            <ThemedView type="backgroundElement" style={styles.vocabSuccessCard}>
              <ThemedText type="subtitle" style={styles.successTitle}>
                🏆 Match Challenge Complete!
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.successDesc}>
                Amazing! You typed and matched all vocabulary words correctly.
              </ThemedText>
              <Pressable onPress={resetVocabGame} style={styles.resetButton}>
                <ThemedText type="code" style={styles.resetButtonText}>
                  PLAY AGAIN ↻
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <View style={styles.scoreContainer}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                SCORE: {correctVocabCount} / {vocabulary.length} MATCHED
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Takeaway message */}
      <View style={styles.takeawayCard}>
        <ThemedText type="smallBold" style={styles.takeawayLabel} themeColor="textSecondary">
          TODAY'S TAKEAWAY
        </ThemedText>
        <ThemedText style={styles.takeawayText}>
          "{takeaway}"
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six + 80,
  },
  titleCard: {
    marginBottom: Spacing.four,
  },
  themeTag: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: Spacing.one,
  },
  convoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#121314',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 24,
    padding: 4,
    marginBottom: Spacing.four,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  activeSubTabButton: {
    backgroundColor: '#2E3135',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B0B4BA',
  },
  activeSubTabText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: 'bold',
    marginBottom: Spacing.half,
  },
  dialogueList: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  dialogueRow: {
    flexDirection: 'row',
    width: '100%',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleLeft: {
    backgroundColor: '#151618',
    borderColor: '#242629',
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#1E222A',
    borderColor: '#2B313C',
    borderTopRightRadius: 4,
  },
  bubbleSelected: {
    borderColor: '#4285F4',
    borderWidth: 1.5,
  },
  speakerName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalKeyboardAvoiding: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E3135',
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  practiceTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B0B4BA',
    letterSpacing: 1,
  },
  closeModalButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  targetDisplay: {
    padding: 14,
    backgroundColor: '#000000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#232527',
    marginBottom: Spacing.three,
  },
  charContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  charBox: {
    paddingHorizontal: 0.5,
    minWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cursorCharBox: {
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
    borderRadius: 2,
  },
  charText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },
  cursorCharText: {
    color: '#4285F4',
    textDecorationLine: 'underline',
  },
  typingInput: {
    height: 48,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: '#FFFFFF',
    fontSize: 14,
  },
  completedWrapper: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  completedTag: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
    alignSelf: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 4,
  },
  nextLineButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextLineButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  wordBankContainer: {
    backgroundColor: '#0E0F10',
    borderWidth: 1,
    borderColor: '#1C1D1F',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  bankLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
    letterSpacing: 0.8,
  },
  wordBankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  wordBankPill: {
    backgroundColor: '#1E2022',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  wordBankPillMatched: {
    backgroundColor: '#142517',
    borderColor: '#1F3F24',
    opacity: 0.5,
  },
  wordBankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wordBankTextMatched: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  vocabList: {
    gap: Spacing.three,
  },
  vocabMatchCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
    flexDirection: 'column',
    gap: Spacing.two,
  },
  vocabMeaningContainer: {
    flex: 1,
  },
  meaningText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#B0B4BA',
  },
  vocabInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocabInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: '#FFFFFF',
    fontSize: 13,
  },
  vocabInputCorrect: {
    backgroundColor: '#142517',
    borderColor: '#2E7D32',
    color: '#81C784',
    fontWeight: '700',
  },
  checkWrapper: {
    position: 'absolute',
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vocabSuccessCard: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#0F1A11',
    alignItems: 'center',
    marginTop: Spacing.four,
    gap: Spacing.one,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#81C784',
  },
  successDesc: {
    fontSize: 12,
    textAlign: 'center',
    color: '#C8E6C9',
    marginBottom: Spacing.two,
  },
  resetButton: {
    backgroundColor: '#81C784',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#0A1A0F',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  takeawayCard: {
    marginTop: Spacing.five,
    padding: Spacing.four,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4285F4',
    backgroundColor: '#0D1117',
  },
  takeawayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  takeawayText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: '#D0D4DA',
  },
  pressed: {
    opacity: 0.6,
  },
});
