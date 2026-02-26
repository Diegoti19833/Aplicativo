import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Animated, Easing } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const VideoPlayer = ({ videoUrl, onVideoComplete, lesson }) => {
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const video = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for play button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePlaybackStatusUpdate = (status) => {
    setStatus(status);
    if (status.isLoaded) {
      setIsLoading(false);
      if (status.didJustFinish && onVideoComplete) {
        onVideoComplete();
      }
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const renderVideoPlaceholder = () => (
    <View style={styles.videoPlaceholder}>
      {/* Background decoration circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Play button with pulse */}
      <Animated.View style={[styles.playOuterRing, { opacity: glowOpacity }]} />
      <Pressable
        style={({ pressed }) => [styles.playButton, pressed && { transform: [{ scale: 0.95 }] }]}
        onPress={() => {
          Alert.alert(
            '🎬 Vídeo da Aula',
            `Assistindo: ${lesson?.title}\n\nEste é um exemplo de como o vídeo seria reproduzido.`,
            [
              { text: 'Pular Vídeo', style: 'cancel', onPress: onVideoComplete },
              { text: '▶️ Assistir', onPress: onVideoComplete }
            ]
          );
        }}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={['#129151', '#0FA968', '#34D399']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.playCircle}
          >
            <Icon name="play" size={28} color="#FFF" style={{ marginLeft: 3 }} />
          </LinearGradient>
        </Animated.View>
      </Pressable>

      {/* Title */}
      <Text style={styles.videoTitle} numberOfLines={2}>
        {lesson?.title}
      </Text>

      {/* Info chips */}
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Icon name="clock" size={12} color="#34D399" />
          <Text style={styles.chipText}>{lesson?.duration || 15} min</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
          <Icon name="star" size={12} color="#F59E0B" />
          <Text style={[styles.chipText, { color: '#F59E0B' }]}>{lesson?.xp_reward || 20} XP</Text>
        </View>
      </View>

      {/* Bottom note */}
      <View style={styles.noteContainer}>
        <Icon name="unlock" size={12} color="#34D399" />
        <Text style={styles.videoNote}>Assista para desbloquear o quiz</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1B2A4A', '#162236']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        {renderVideoPlaceholder()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  gradientBg: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  bgCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(18,145,81,0.08)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52,211,153,0.06)',
  },
  playOuterRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(18,145,81,0.4)',
  },
  playButton: {
    marginBottom: 16,
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#129151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(18,145,81,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.7,
  },
  videoNote: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
});

export default VideoPlayer;