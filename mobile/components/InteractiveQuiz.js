import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const InteractiveQuiz = ({ quiz, onAnswerSubmit, onNext, isLastQuiz }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleAnswerSelect = (optionIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('Atenção', 'Por favor, selecione uma resposta antes de continuar.');
      return;
    }

    const correct = selectedAnswer === quiz.correct_answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onAnswerSubmit({
      quizId: quiz.id,
      selectedAnswer: selectedAnswer,
      isCorrect: correct,
      explanation: quiz.explanation
    });
  };

  const handleNext = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      fadeAnim.setValue(1);
      onNext();
    });
  };

  const getOptionStyle = (optionIndex) => {
    const baseStyle = [styles.option];

    if (showFeedback) {
      if (optionIndex === quiz.correct_answer) {
        baseStyle.push(styles.optionCorrect);
      } else if (optionIndex === selectedAnswer && !isCorrect) {
        baseStyle.push(styles.optionIncorrect);
      } else {
        baseStyle.push(styles.optionDisabled);
      }
    } else if (selectedAnswer === optionIndex) {
      baseStyle.push(styles.optionSelected);
    }

    return baseStyle;
  };

  const getIndicatorStyle = (optionIndex) => {
    const baseStyle = [styles.optionIndicator];

    if (showFeedback) {
      if (optionIndex === quiz.correct_answer) {
        baseStyle.push({ backgroundColor: '#129151', borderColor: '#129151' });
      } else if (optionIndex === selectedAnswer && !isCorrect) {
        baseStyle.push({ backgroundColor: '#EF4444', borderColor: '#EF4444' });
      }
    } else if (selectedAnswer === optionIndex) {
      baseStyle.push({ backgroundColor: '#129151', borderColor: '#129151' });
    }

    return baseStyle;
  };

  const getLetterStyle = (optionIndex) => {
    const baseStyle = [styles.optionLetter];

    if (showFeedback) {
      if (optionIndex === quiz.correct_answer) {
        baseStyle.push({ color: '#FFFFFF' });
      } else if (optionIndex === selectedAnswer && !isCorrect) {
        baseStyle.push({ color: '#FFFFFF' });
      }
    } else if (selectedAnswer === optionIndex) {
      baseStyle.push({ color: '#FFFFFF' });
    }

    return baseStyle;
  };

  const getOptionTextStyle = (optionIndex) => {
    const baseStyle = [styles.optionText];

    if (showFeedback) {
      if (optionIndex === quiz.correct_answer) {
        baseStyle.push(styles.optionTextCorrect);
      } else if (optionIndex === selectedAnswer && !isCorrect) {
        baseStyle.push(styles.optionTextIncorrect);
      } else {
        baseStyle.push(styles.optionTextDisabled);
      }
    } else if (selectedAnswer === optionIndex) {
      baseStyle.push(styles.optionTextSelected);
    }

    return baseStyle;
  };

  const parseOptions = (options) => {
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try { return JSON.parse(options); }
      catch (error) { return []; }
    }
    return [];
  };

  const options = parseOptions(quiz.options || []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>
            📝 Pergunta {quiz.order_index || 1}
          </Text>
        </View>
        <Text style={styles.question}>{quiz.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              ...getOptionStyle(index),
              pressed && !showFeedback && { transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => handleAnswerSelect(index)}
            disabled={showFeedback}
          >
            <View style={styles.optionContent}>
              <View style={getIndicatorStyle(index)}>
                <Text style={getLetterStyle(index)}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={getOptionTextStyle(index)}>
                {option}
              </Text>
            </View>

            {showFeedback && index === quiz.correct_answer && (
              <View style={styles.feedbackIcon}>
                <Text style={{ fontSize: 16, color: '#129151' }}>✓</Text>
              </View>
            )}
            {showFeedback && index === selectedAnswer && !isCorrect && (
              <View style={[styles.feedbackIcon, { backgroundColor: '#FEE2E2' }]}>
                <Text style={{ fontSize: 16, color: '#EF4444' }}>✗</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Feedback Card */}
      {showFeedback && (
        <View style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackEmoji}>
              {isCorrect ? '🎉' : '💡'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.feedbackTitle, { color: isCorrect ? '#065F46' : '#991B1B' }]}>
                {isCorrect ? 'Parabéns, acertou!' : 'Não foi dessa vez'}
              </Text>
              {isCorrect && (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpReward}>
                    +{quiz.xp_reward || 10} XP
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.feedbackExplanation}>
            {quiz.explanation}
          </Text>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        {!showFeedback ? (
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              selectedAnswer === null && styles.submitButtonDisabled,
              pressed && selectedAnswer !== null && { opacity: 0.9 }
            ]}
            onPress={handleSubmitAnswer}
            disabled={selectedAnswer === null}
          >
            <LinearGradient
              colors={selectedAnswer !== null ? ['#129151', '#0B6E3D'] : ['#D1D5DB', '#9CA3AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitButtonText}>Confirmar Resposta</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && { opacity: 0.9 }
            ]}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#129151', '#064E29']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuiz ? '🏁 Finalizar Aula' : 'Próxima Pergunta →'}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAF9',
  },

  // Question Card
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  questionBadge: {
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  question: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 28,
  },

  // Options
  optionsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#129151',
    shadowColor: '#129151',
    shadowOpacity: 0.12,
    elevation: 4,
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#129151',
    shadowColor: '#129151',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  optionDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIndicator: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLetter: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B7280',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#065F46',
    fontWeight: '700',
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#991B1B',
    fontWeight: '700',
  },
  optionTextDisabled: {
    color: '#9CA3AF',
  },

  // Feedback icons
  feedbackIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Feedback Card
  feedbackContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  feedbackCorrect: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  feedbackIncorrect: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  feedbackEmoji: {
    fontSize: 32,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  feedbackExplanation: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  xpBadge: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  xpReward: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },

  // Buttons
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 8,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default InteractiveQuiz;