import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingAnimationProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingAnimation({ 
  text = 'Loading...', 
  size = 'medium' 
}: LoadingAnimationProps) {
  const { theme } = useTheme();
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // Pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 20, height: 20, borderWidth: 2 };
      case 'large':
        return { width: 60, height: 60, borderWidth: 4 };
      default:
        return { width: 40, height: 40, borderWidth: 3 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeValue }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            ...getSizeStyles(),
            borderColor: theme.primary,
            borderTopColor: 'transparent',
            transform: [{ rotate: spin }, { scale: pulseValue }],
          },
        ]}
      />
      {text && (
        <Text style={[styles.text, { color: theme.text, fontSize: getTextSize() }]}>
          {text}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: 50,
    marginBottom: 16,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
