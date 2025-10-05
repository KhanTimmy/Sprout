import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TimeRangeSelectorProps {
  selectedRange: number;
  onRangeChange: (days: number) => void;
}

const TIME_RANGES = [
  { key: 7, label: '7 days' },
  { key: 15, label: '15 days' },
  { key: 30, label: '30 days' },
  { key: 60, label: '60 days' },
  { key: 90, label: '90 days' }
] as const;

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedRange, onRangeChange }) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { theme } = useTheme();

  useEffect(() => {
    if (sliderWidth > 0) {
      const selectedIndex = TIME_RANGES.findIndex(t => t.key === selectedRange);
      const itemWidth = sliderWidth / TIME_RANGES.length;
      Animated.spring(slideAnim, {
        toValue: selectedIndex * itemWidth,
        useNativeDriver: true,
        tension: 100,
        friction: 10
      }).start();
    }
  }, [selectedRange, sliderWidth]);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const handlePress = (range: typeof TIME_RANGES[number]) => {
    onRangeChange(range.key);
  };

  const itemWidth = sliderWidth / TIME_RANGES.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderRadius: 20 }]} onLayout={handleLayout}>
      <View style={[styles.track, { backgroundColor: theme.secondaryBackground }]}>
        {TIME_RANGES.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={styles.option}
            onPress={() => handlePress(range)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.label,
              { color: range.key === selectedRange ? theme.tint : theme.secondaryText },
              range.key === selectedRange && { fontWeight: '600' }
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{ translateX: slideAnim }],
            width: itemWidth
          }
        ]}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.slider,
            borderColor: theme.tint,
            borderRadius: 20,
            borderWidth: 1,
          }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    marginVertical: 0,
    marginHorizontal: 0,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  slider: {
    position: 'absolute',
    top: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});

export default TimeRangeSelector; 