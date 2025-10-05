import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface AnimatedActionButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  delay?: number;
}

export default function AnimatedActionButton({
  icon,
  label,
  color,
  onPress,
  disabled = false,
  delay = 0
}: AnimatedActionButtonProps) {
  const { theme } = useTheme();
  
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, scaleValue, opacityValue]);

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(pressScale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled) {
      hapticFeedback.medium();
      onPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [
            { scale: scaleValue },
            { scale: pressScale }
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: theme.cardBackground },
          disabled && styles.actionButtonDisabled
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <Text style={[
          styles.actionLabel,
          { color: disabled ? theme.secondaryText : theme.text }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
