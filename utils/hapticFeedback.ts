import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Helper function to safely execute haptic feedback
const safeHaptic = (hapticFunction: () => Promise<void>) => {
  try {
    // Only run haptics on iOS and Android
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      hapticFunction();
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.log('Haptic feedback not available:', error);
  }
};

export const hapticFeedback = {
  light: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  selection: () => safeHaptic(() => Haptics.selectionAsync()),
};
