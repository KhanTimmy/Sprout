import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface CloudBackgroundProps {
  children: React.ReactNode;
}

const CloudBackground: React.FC<CloudBackgroundProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Enhanced sky gradient background */}
      <LinearGradient
        colors={[theme.background, theme.softBlue, theme.softPurple]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.6, 1]}
      />
      
      {/* Additional gradient overlay for depth */}
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'transparent', 'rgba(139,92,246,0.05)']}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating clouds */}
      <View style={styles.cloudsContainer}>
        {/* Cloud 1 - Top left */}
        <View style={[styles.cloud, styles.cloud1]}>
          <View style={[styles.cloudPart, styles.cloudPart1, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart2, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart3, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart4, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart5, { backgroundColor: theme.cloudColor }]} />
        </View>

        {/* Cloud 2 - Top right */}
        <View style={[styles.cloud, styles.cloud2]}>
          <View style={[styles.cloudPart, styles.cloudPart1, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart2, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart3, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart4, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart5, { backgroundColor: theme.cloudColor }]} />
        </View>

        {/* Cloud 3 - Middle */}
        <View style={[styles.cloud, styles.cloud3]}>
          <View style={[styles.cloudPart, styles.cloudPart1, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart2, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart3, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart4, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart5, { backgroundColor: theme.cloudColor }]} />
        </View>

        {/* Cloud 4 - Bottom right */}
        <View style={[styles.cloud, styles.cloud4]}>
          <View style={[styles.cloudPart, styles.cloudPart1, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart2, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart3, { backgroundColor: theme.cloudColor }]} />
        </View>

        {/* Cloud 5 - Top right */}
        <View style={[styles.cloud, styles.cloud5]}>
          <View style={[styles.cloudPart, styles.cloudPart1, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart2, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart3, { backgroundColor: theme.cloudColor }]} />
          <View style={[styles.cloudPart, styles.cloudPart4, { backgroundColor: theme.cloudColor }]} />
        </View>
      </View>

      {/* Decorative floating elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.floatingElement, styles.element1, { backgroundColor: theme.softPink }]} />
        <View style={[styles.floatingElement, styles.element2, { backgroundColor: theme.softGreen }]} />
        <View style={[styles.floatingElement, styles.element3, { backgroundColor: theme.softYellow }]} />
        <View style={[styles.floatingElement, styles.element4, { backgroundColor: theme.softPurple }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloud: {
    position: 'absolute',
    opacity: 0.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cloud1: {
    top: '8%',
    left: '3%',
    width: 100,
    height: 50,
  },
  cloud2: {
    top: '12%',
    right: '5%',
    width: 120,
    height: 60,
  },
  cloud3: {
    top: '35%',
    left: '15%',
    width: 140,
    height: 70,
  },
  cloud4: {
    top: '60%',
    right: '10%',
    width: 90,
    height: 45,
  },
  cloud5: {
    top: '5%',
    right: '20%',
    width: 110,
    height: 55,
  },
  cloudPart: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cloudPart1: {
    width: 35,
    height: 35,
    top: 5,
    left: 5,
  },
  cloudPart2: {
    width: 45,
    height: 45,
    top: -5,
    left: 20,
  },
  cloudPart3: {
    width: 50,
    height: 50,
    top: 0,
    left: 40,
  },
  cloudPart4: {
    width: 40,
    height: 40,
    top: 8,
    left: 60,
  },
  cloudPart5: {
    width: 30,
    height: 30,
    top: 12,
    left: 75,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  element1: {
    width: 20,
    height: 20,
    top: '25%',
    left: '80%',
  },
  element2: {
    width: 16,
    height: 16,
    top: '45%',
    left: '5%',
  },
  element3: {
    width: 24,
    height: 24,
    top: '70%',
    left: '75%',
  },
  element4: {
    width: 18,
    height: 18,
    top: '15%',
    left: '60%',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default CloudBackground;
