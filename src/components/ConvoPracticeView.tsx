import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, Platform, KeyboardAvoidingView } from 'react-native';
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
  const [isPracticeModeActive, setIsPracticeModeActive] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const typingInputRef = useRef<TextInput>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const cardYPositions = useRef<Record<number, number>>({});

  // Vocabulary Matching Game States
  const [vocabAnswers, setVocabAnswers] = useState<Record<number, string>>({}); // indexed by shuffled meanings index
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [incorrectMatchIdx, setIncorrectMatchIdx] = useState<number | null>(null);

  // Shuffled Word Bank & Meanings lists
  const shuffledWords = useMemo(() => {
    return [...vocabulary].map(v => v.word).sort(() => Math.random() - 0.5);
  }, [vocabulary]);

  const shuffledMeanings = useMemo(() => {
    return [...vocabulary]
      .map((v, idx) => ({ ...v, originalIndex: idx }))
      .sort(() => Math.random() - 0.5);
  }, [vocabulary]);

  const handleWordBankPress = (word: string) => {
    const isAlreadyMatched = Object.values(vocabAnswers).includes(word);
    if (isAlreadyMatched) return;

    if (selectedWord === word) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  const handleSlotPress = (meaningIdx: number, correctWord: string) => {
    if (!selectedWord) return;

    if (selectedWord.trim().toLowerCase() === correctWord.trim().toLowerCase()) {
      setVocabAnswers(prev => ({
        ...prev,
        [meaningIdx]: selectedWord
      }));
      setSelectedWord(null);
    } else {
      setIncorrectMatchIdx(meaningIdx);
      setTimeout(() => {
        setIncorrectMatchIdx(null);
      }, 800);
    }
  };

  // Current focused utterance
  const activeUtterance = selectedUtteranceIndex !== null ? conversation[selectedUtteranceIndex] : null;

  const handleSelectUtterance = (idx: number) => {
    setSelectedUtteranceIndex(idx);
    setTypedText('');
    setIsPracticeModeActive(true);
  };

  const handleNextUtterance = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex < conversation.length - 1) {
      setSelectedUtteranceIndex(selectedUtteranceIndex + 1);
      setTypedText('');
    }
  };

  const handlePrevUtterance = () => {
    if (selectedUtteranceIndex !== null && selectedUtteranceIndex > 0) {
      setSelectedUtteranceIndex(selectedUtteranceIndex - 1);
      setTypedText('');
    }
  };

  useEffect(() => {
    if (isPracticeModeActive && typingInputRef.current) {
      typingInputRef.current.focus();
    }
  }, [selectedUtteranceIndex, isPracticeModeActive]);

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

  const correctVocabCount = useMemo(() => {
    return Object.keys(vocabAnswers).length;
  }, [vocabAnswers]);

  const resetVocabGame = () => {
    setVocabAnswers({});
    setSelectedWord(null);
    setIncorrectMatchIdx(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="always"
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Title block */}
      {!isPracticeModeActive && (
        <View style={styles.titleCard}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.themeTag}>
            {theme.toUpperCase()}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.convoTitle}>
            {title}
          </ThemedText>
        </View>
      )}

      {/* Premium Horizontal Sub-Tabs Switcher */}
      {!isPracticeModeActive && (
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
      )}

      {/* Conditionally Render dialogue list vs vocabulary matching */}
      {activeSubTab === 'dialogue' ? (
        isPracticeModeActive ? (
          <View style={styles.practiceContainer}>
            {/* Progress Header */}
            <View style={styles.practiceHeader}>
              <ThemedText type="smallBold" style={styles.practiceProgressText}>
                LINE {selectedUtteranceIndex! + 1} OF {conversation.length}
              </ThemedText>
              <Pressable
                onPress={() => setIsPracticeModeActive(false)}
                style={({ pressed }) => [styles.exitPracticeButton, pressed && styles.pressed]}
              >
                <ThemedText style={styles.exitPracticeText}>Exit ✕</ThemedText>
              </Pressable>
            </View>

            {/* Simple horizontal progress bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${((selectedUtteranceIndex! + 1) / conversation.length) * 100}%` }
                ]}
              />
            </View>

            {/* Active Line Card */}
            <ThemedView type="backgroundElement" style={styles.practiceCard}>
              <ThemedText style={styles.speakerLabel} themeColor="textSecondary">
                {activeUtterance?.speaker.toUpperCase()}
              </ThemedText>
              
              {/* Target text characters grid */}
              <View style={styles.practiceTargetDisplay}>
                {renderTypedCharacters()}
              </View>

              <TextInput
                ref={typingInputRef}
                style={styles.practiceInput}
                value={typedText}
                onChangeText={(text) => {
                  if (activeUtterance && text.length <= activeUtterance.text.length) {
                    setTypedText(text);
                    if (text.toLowerCase() === activeUtterance.text.toLowerCase()) {
                      setTimeout(() => {
                        if (selectedUtteranceIndex !== null && selectedUtteranceIndex < conversation.length - 1) {
                          handleNextUtterance();
                        } else {
                          // Finished last line!
                          setIsPracticeModeActive(false);
                        }
                      }, 300);
                    }
                  }
                }}
                placeholder="Type the dialogue exactly above..."
                placeholderTextColor="#60646C"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                autoFocus={true}
              />

              <View style={styles.practiceFooter}>
                {selectedUtteranceIndex! > 0 && (
                  <Pressable onPress={handlePrevUtterance} style={styles.practiceBackButton}>
                    <ThemedText style={styles.practiceBackButtonText}>
                      ← Back
                    </ThemedText>
                  </Pressable>
                )}

                {selectedUtteranceIndex! < conversation.length - 1 ? (
                  <Pressable onPress={handleNextUtterance} style={styles.practiceNextButton}>
                    <ThemedText style={styles.practiceNextButtonText}>
                      Next →
                    </ThemedText>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => setIsPracticeModeActive(false)}
                    style={[styles.practiceNextButton, { backgroundColor: '#4CAF50' }]}
                  >
                    <ThemedText style={[styles.practiceNextButtonText, { color: '#FFFFFF' }]}>
                      Finish
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            </ThemedView>
          </View>
        ) : (
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

            {/* Start Practice Card */}
            <Pressable
              onPress={() => handleSelectUtterance(0)}
              style={({ pressed }) => [
                styles.startPracticeCard,
                { marginTop: Spacing.four },
                pressed && styles.pressed
              ]}
            >
              <ThemedText style={styles.startPracticeText}>
                ⚡ Start Conversation Practice
              </ThemedText>
            </Pressable>
          </View>
        )
      ) : (
        <View>
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              VOCABULARY MATCHING CHALLENGE
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Tap a word from the Word Bank, then tap its corresponding definition to match.
            </ThemedText>
          </View>

          {/* Word Bank Display */}
          <View style={styles.wordBankContainer}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.bankLabel}>
              WORD BANK:
            </ThemedText>
            <View style={styles.wordBankGrid}>
              {shuffledWords.map((word, idx) => {
                const isMatched = Object.values(vocabAnswers).includes(word);
                const isSelected = selectedWord === word;

                return (
                  <Pressable
                    key={`bank-word-${idx}`}
                    onPress={() => handleWordBankPress(word)}
                    disabled={isMatched}
                    style={({ pressed }) => [
                      styles.wordBankPill,
                      isMatched && styles.wordBankPillMatched,
                      isSelected && styles.wordBankPillSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.wordBankText,
                        isMatched && styles.wordBankTextMatched,
                        isSelected && styles.wordBankTextSelected,
                      ]}
                    >
                      {word}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Matching Questions */}
          <View style={styles.vocabList}>
            {shuffledMeanings.map((item, idx) => {
              const matchedWord = vocabAnswers[idx];
              const isCorrect = !!matchedWord;
              const isFlashError = incorrectMatchIdx === idx;

              return (
                <ThemedView
                  key={`vocab-match-${idx}`}
                  type="backgroundElement"
                  style={styles.vocabMatchCard}
                >
                  <View style={styles.vocabMeaningContainer}>
                    <ThemedText style={styles.meaningText}>
                      • {item.meaning}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => handleSlotPress(idx, item.word)}
                    disabled={isCorrect}
                    style={({ pressed }) => [
                      styles.vocabSlot,
                      isCorrect && styles.vocabSlotCorrect,
                      isFlashError && styles.vocabSlotIncorrect,
                      pressed && styles.pressed,
                    ]}
                  >
                    {isCorrect ? (
                      <View style={styles.slotMatchedContent}>
                        <ThemedText style={styles.vocabSlotCorrectText}>
                          ✓ {matchedWord}
                        </ThemedText>
                      </View>
                    ) : isFlashError ? (
                      <View style={styles.slotMatchedContent}>
                        <ThemedText style={styles.vocabSlotIncorrectText}>
                          ✗ {selectedWord} (Incorrect)
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.vocabSlotPlaceholderText}>
                        {selectedWord ? `Tap to match "${selectedWord}"` : "Tap to place word..."}
                      </ThemedText>
                    )}
                  </Pressable>
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
    </KeyboardAvoidingView>
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
  startPracticeCard: {
    backgroundColor: '#1E222A',
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  startPracticeText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  practiceContainer: {
    gap: Spacing.three,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  practiceProgressText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B0B4BA',
    letterSpacing: 1.5,
  },
  exitPracticeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  exitPracticeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1C1D1F',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4285F4',
  },
  practiceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E3135',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  speakerLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  practiceTargetDisplay: {
    padding: 14,
    backgroundColor: '#000000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#232527',
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
  practiceInput: {
    height: 48,
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: '#FFFFFF',
    fontSize: 14,
  },
  practiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  practiceBackButton: {
    backgroundColor: '#1C1D1F',
    borderWidth: 1,
    borderColor: '#2E3135',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceBackButtonText: {
    color: '#B0B4BA',
    fontWeight: '700',
    fontSize: 12,
  },
  practiceNextButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  practiceNextButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  smallNextButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallNextButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  wordBankPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  wordBankTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  vocabSlot: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#2E3135',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(28, 29, 31, 0.4)',
    width: '100%',
  },
  vocabSlotCorrect: {
    borderColor: '#4CAF50',
    borderStyle: 'solid',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  vocabSlotIncorrect: {
    borderColor: '#F44336',
    borderStyle: 'solid',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  slotMatchedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocabSlotCorrectText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 14,
  },
  vocabSlotIncorrectText: {
    color: '#F44336',
    fontWeight: '700',
    fontSize: 14,
  },
  vocabSlotPlaceholderText: {
    color: '#60646C',
    fontSize: 13,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.6,
  },
});
