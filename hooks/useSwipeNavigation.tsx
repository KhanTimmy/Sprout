import { useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface SwipeNavigationConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  enableHaptics?: boolean;
}

export const useSwipeNavigation = (config: SwipeNavigationConfig = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    swipeThreshold = 50,
    velocityThreshold = 500,
    enableHaptics = true,
  } = config;

  const translateX = useSharedValue(0);

  const handleSwipeLeft = () => {
    if (enableHaptics) {
      hapticFeedback.selection();
    }
    if (onSwipeLeft) {
      onSwipeLeft();
    }
  };

  const handleSwipeRight = () => {
    if (enableHaptics) {
      hapticFeedback.selection();
    }
    if (onSwipeRight) {
      onSwipeRight();
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial position
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      
      // Determine if swipe is significant enough
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        if (translationX > 0) {
          // Swipe right
          runOnJS(handleSwipeRight)();
        } else {
          // Swipe left
          runOnJS(handleSwipeLeft)();
        }
      }
      
      // Reset position with spring animation
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    });

  return {
    panGesture,
    translateX,
  };
};

// Predefined navigation patterns for tabs
// Navigation flow: Home → Reports → Insights → Settings → Home (circular)
export const useTabSwipeNavigation = (currentTab: 'home' | 'insights' | 'reports' | 'settings') => {
  const getNavigationConfig = (): SwipeNavigationConfig => {
    switch (currentTab) {
      case 'home':
        return {
          onSwipeLeft: () => router.push('/(tabs)/reports'),   // Home → Reports
          onSwipeRight: () => router.push('/(tabs)/settings'), // Home ← Settings
        };
      case 'reports':
        return {
          onSwipeLeft: () => router.push('/(tabs)/insights'),  // Reports → Insights
          onSwipeRight: () => router.push('/(tabs)/home'),     // Reports ← Home
        };
      case 'insights':
        return {
          onSwipeLeft: () => router.push('/(tabs)/settings'),  // Insights → Settings
          onSwipeRight: () => router.push('/(tabs)/reports'),  // Insights ← Reports
        };
      case 'settings':
        return {
          onSwipeLeft: () => router.push('/(tabs)/home'),      // Settings → Home
          onSwipeRight: () => router.push('/(tabs)/insights'), // Settings ← Insights
        };
      default:
        return {};
    }
  };

  return useSwipeNavigation(getNavigationConfig());
};
