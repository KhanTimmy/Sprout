import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export type TrendType = 'sleep' | 'feed' | 'diaper' | 'activity' | 'milestone' | 'weight';

interface TrendSelectorProps {
  onSelect: (type: TrendType) => void;
  selected: TrendType;
}

const TREND_TYPES = [
  { key: 'sleep' as const, icon: 'power-sleep', label: 'Sleep' },
  { key: 'feed' as const, icon: 'food-apple', label: 'Feed' },
  { key: 'diaper' as const, icon: 'baby-face-outline', label: 'Diaper' },
  { key: 'activity' as const, icon: 'run', label: 'Activity' },
  { key: 'milestone' as const, icon: 'star', label: 'Milestone' },
  { key: 'weight' as const, icon: 'scale-bathroom', label: 'Weight' }
];

const TrendSelector: React.FC<TrendSelectorProps> = ({ onSelect, selected }) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (sliderWidth > 0) {
      const selectedIndex = TREND_TYPES.findIndex(t => t.key === selected);
      const itemWidth = sliderWidth / TREND_TYPES.length;
      Animated.spring(slideAnim, {
        toValue: selectedIndex * itemWidth,
        useNativeDriver: true,
        tension: 100,
        friction: 10
      }).start();
    }
  }, [selected, sliderWidth]);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const handlePress = (type: typeof TREND_TYPES[number]) => {
    onSelect(type.key);
  };

  const itemWidth = sliderWidth / TREND_TYPES.length;

  return (
    <View style={[styles.trendSelectorContainer, { backgroundColor: theme.background }]} onLayout={handleLayout}>
      {/* Track */}
      <View style={[styles.trendTrack, { backgroundColor: theme.secondaryBackground }]}>
        {TREND_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={styles.trendOption}
            onPress={() => handlePress(type)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={type.icon as any}
              size={28}
              color={type.key === selected ? theme.tint : theme.secondaryText}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        style={[
          styles.trendSlider,
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
            borderRadius: 16,
            borderWidth: 1,
          }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  trendSelectorContainer: {
    height: 70,
    marginVertical: 10,
    marginHorizontal: 0,
    position: 'relative',
  },
  trendTrack: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  trendSlider: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});

export default TrendSelector; 