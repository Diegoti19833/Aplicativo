import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Vibration
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuizSounds } from '../hooks/useQuizSounds';

const { width, height } = Dimensions.get('window');

const QuizGame = ({ quizzes, onComplete, onQuizComplete, user }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0); // Pontos acumulados na sessão atual
  const [userTotalPoints, setUserTotalPoints] = useState(0); // Pontos totais do usuário
  const [quizResults, setQuizResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de sons
  const { playCorrectSound, playIncorrectSound } = useQuizSounds();

  // Animações
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  // Carregar Pontos totais do usuário ao iniciar
  useEffect(() => {
    loadUserTotalPoints();
  }, [user]);

  // Função para carregar Pontos totais do usuário
  const loadUserTotalPoints = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_dashboard', { user_id_param: user.id });

      if (error) throw error;

      // Aliasing xp_total to userTotalPoints
      if (data?.user?.xp_total !== undefined) {
        setUserTotalPoints(data.user.xp_total);
      } else if (data?.user?.total_points !== undefined) {
        setUserTotalPoints(data.user.total_points);
      }
    } catch (error) {
      console.error('Erro ao carregar Pontos totais do usuário:', error);
    }
  };

  useEffect(() => {
    // Animar entrada da pergunta
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentQuizIndex]);

  const parseOptions = (options) => {
    if (Array.isArray(options)) {
      return options;
    }

    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch (error) {
        console.error('❌ [QuizGame] Erro ao parsear opções:', error);
        return [];
      }
    }

    return [];
  };

  const handleOptionSelect = (optionIndex) => {
    if (showResult || isSubmitting) return;

    setSelectedOption(optionIndex);

    // Animação de seleção
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const submitAnswer = async () => {
    if (selectedOption === null || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Verificar resposta localmente usando a estrutura antiga
      const isCorrect = selectedOption === currentQuiz.correct_answer;
      // Use xp_reward if available, otherwise 0
      const points = isCorrect ? (currentQuiz.xp_reward || currentQuiz.points_reward || 0) : 0;

      // Registrar tentativa no banco - tentativa simples primeiro
      let attemptData, attemptError;

      try {
        // Tentar inserção com selected_answer (estrutura real do banco)
        // Note: keeping xp_earned column name for now if backend expects it, but we can alias if needed
        const result = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: user.id,
            quiz_id: currentQuiz.id,
            selected_answer: selectedOption, // Índice da opção selecionada (0-3)
            is_correct: isCorrect,
            xp_earned: points, // Still mapping to xp_earned in DB for now
            attempt_number: 1
          })
          .select()
          .single();

        attemptData = result.data;
        attemptError = result.error;
      } catch (error) {
        attemptError = error;
      }

      if (attemptError) throw attemptError;

      // Atualizar estados locais
      setIsCorrect(isCorrect);
      setPointsEarned(points);

      // Acumular Pontos da sessão
      if (points > 0) {
        setSessionPoints(prev => prev + points);

        // Recarregar Pontos totais do usuário do banco (sincronização)
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.rpc('get_user_dashboard', { user_id: user.id });
            if (!error) {
              if (data?.user?.xp_total !== undefined) {
                setUserTotalPoints(data.user.xp_total);
              } else if (data?.user?.total_points !== undefined) {
                setUserTotalPoints(data.user.total_points);
              }
            }
          } catch (error) {
            console.error('Erro ao sincronizar Pontos totais:', error);
          }
        }, 500); // Aguardar 500ms para o trigger processar
      }

      setShowResult(true);

      // Adicionar resultado ao array
      setQuizResults(prev => [...prev, {
        quizId: currentQuiz.id,
        correct: isCorrect,
        pointsEarned: points,
        selectedOption
      }]);

      // Feedback de som e vibração
      if (isCorrect) {
        playCorrectSound(); // Som de acerto
        Vibration.vibrate([0, 100, 50, 100]); // Padrão de sucesso
        // Animação de confete
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } else {
        playIncorrectSound(); // Som de erro
        Vibration.vibrate(200); // Vibração de erro
      }

      // Animação de Pontos
      if (points > 0) {
        Animated.timing(pointsAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }

      // Callback para quiz individual
      if (onQuizComplete) {
        onQuizComplete(currentQuiz.id, isCorrect, points);
      }

    } catch (error) {
      console.error('Erro ao submeter resposta:', error);
      Alert.alert('Erro', 'Não foi possível submeter a resposta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      // Próxima pergunta
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setPointsEarned(0); // Reset apenas os Pontos da pergunta atual

      // Reset animações
      slideAnim.setValue(0);
      pointsAnim.setValue(0);
      confettiAnim.setValue(0);

    } else {
      // Quiz completo - enviar Pontos totais da sessão
      if (onComplete) {
        onComplete(quizResults, sessionPoints); // Usar sessionPoints em vez de totalPoints
      }
    }
  };

  const getOptionStyle = (optionIndex) => {
    if (!showResult) {
      return selectedOption === optionIndex ? styles.optionSelected : styles.option;
    }

    // Mostrar resultado
    if (optionIndex === currentQuiz.correct_answer_index) {
      return styles.optionCorrect;
    } else if (selectedOption === optionIndex && !isCorrect) {
      return styles.optionIncorrect;
    }

    return styles.option;
  };

  const renderConfetti = () => {
    if (!isCorrect || confettiAnim._value === 0) return null;

    const confettiPieces = Array.from({ length: 20 }, (_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.confettiPiece,
          {
            left: Math.random() * width,
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, height + 50],
                }),
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
    ));

    return <View style={styles.confettiContainer}>{confettiPieces}</View>;
  };

  if (!currentQuiz) return null;

  const options = parseOptions(currentQuiz.options);

  return (
    <View style={styles.container}>
      {/* Barra de Progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuizIndex + 1} de {quizzes.length}
        </Text>
      </View>

      {/* Pergunta */}
      <Animated.View
        style={[
          styles.questionContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.questionText}>{currentQuiz.question}</Text>
      </Animated.View>

      {/* Opções */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleOptionSelect(index)}
            disabled={showResult || isSubmitting}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback de Resultado */}
      {showResult && (
        <Animated.View style={[styles.resultContainer, { opacity: pointsAnim }]}>
          <Text style={[styles.resultText, isCorrect ? styles.correctText : styles.incorrectText]}>
            {isCorrect ? '🎉 Correto!' : '❌ Incorreto'}
          </Text>
          {pointsEarned > 0 && (
            <Text style={styles.pointsText}>+{pointsEarned} Pontos</Text>
          )}
        </Animated.View>
      )}

      {/* Botão de Ação */}
      <View style={styles.actionContainer}>
        {!showResult ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedOption !== null ? styles.submitButtonActive : styles.submitButtonDisabled
            ]}
            onPress={submitAnswer}
            disabled={selectedOption === null || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuizIndex < quizzes.length - 1 ? 'Próxima' : 'Finalizar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pontos Total e Sessão */}
      <View style={styles.pointsInfoContainer}>
        <View style={styles.totalPointsContainer}>
          <Text style={styles.totalPointsText}>Total: {userTotalPoints} Pontos</Text>
        </View>
        {sessionPoints > 0 && (
          <View style={styles.sessionPointsContainer}>
            <Text style={styles.sessionPointsText}>Nesta sessão: +{sessionPoints}</Text>
          </View>
        )}
      </View>

      {/* Confete */}
      {renderConfetti()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    padding: 20,
  },
  progressContainer: {
    marginBottom: 28,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#129151',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    flex: 1,
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
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
    borderWidth: 2,
    shadowColor: '#129151',
    shadowOpacity: 0.12,
    elevation: 4,
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#129151',
    borderWidth: 2,
    shadowColor: '#129151',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
    shadowColor: '#EF4444',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  resultText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  correctText: {
    color: '#065F46',
  },
  incorrectText: {
    color: '#991B1B',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
  },
  actionContainer: {
    paddingVertical: 16,
  },
  submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonActive: {
    backgroundColor: '#129151',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: '#129151',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pointsInfoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
  },
  totalPointsContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  totalPointsText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 13,
  },
  sessionPointsContainer: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sessionPointsText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default QuizGame;
