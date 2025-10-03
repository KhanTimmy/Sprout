import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";

interface AnimatedCloudBackgroundProps {
  children: React.ReactNode;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedCloudBackground: React.FC<AnimatedCloudBackgroundProps> = ({ children }) => {
  const { theme } = useTheme();
  
  // Animation values for different clouds
  const cloud1Anim = useRef(new Animated.Value(0)).current;
  const cloud2Anim = useRef(new Animated.Value(0)).current;
  const cloud3Anim = useRef(new Animated.Value(0)).current;
  const cloud4Anim = useRef(new Animated.Value(0)).current;
  const cloud5Anim = useRef(new Animated.Value(0)).current;
  const cloud6Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create different animation patterns for each cloud
    const createFloatingAnimation = (animValue: Animated.Value, duration: number, delay: number = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start all animations
    createFloatingAnimation(cloud1Anim, 8000, 0).start();
    createFloatingAnimation(cloud2Anim, 10000, 1000).start();
    createFloatingAnimation(cloud3Anim, 12000, 2000).start();
    createFloatingAnimation(cloud4Anim, 9000, 3000).start();
    createFloatingAnimation(cloud5Anim, 11000, 4000).start();
    createFloatingAnimation(cloud6Anim, 13000, 5000).start();
  }, []);

  // Animation styles for each cloud
  const cloud1Style = {
    transform: [
      {
        translateY: cloud1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        translateX: cloud1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }),
      },
      {
        scale: cloud1Anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.05, 1],
        }),
      },
    ],
    opacity: cloud1Anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 0.8, 0.6],
    }),
  };

  const cloud2Style = {
    transform: [
      {
        translateY: cloud2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 15],
        }),
      },
      {
        translateX: cloud2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        scale: cloud2Anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.95, 1],
        }),
      },
    ],
    opacity: cloud2Anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.7, 0.5],
    }),
  };

  const cloud3Style = {
    transform: [
      {
        translateY: cloud3Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -25],
        }),
      },
      {
        translateX: cloud3Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 12],
        }),
      },
      {
        scale: cloud3Anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.08, 1],
        }),
      },
    ],
    opacity: cloud3Anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.55, 0.75, 0.55],
    }),
  };

  const cloud4Style = {
    transform: [
      {
        translateY: cloud4Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 18],
        }),
      },
      {
        translateX: cloud4Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
      {
        scale: cloud4Anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.92, 1],
        }),
      },
    ],
    opacity: cloud4Anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.45, 0.65, 0.45],
    }),
  };

  const cloud5Style = {
    transform: [
      {
        translateY: cloud5Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -22],
        }),
      },
      {
        translateX: cloud5Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
        }),
      },
      {
        scale: cloud5Anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.03, 1],
        }),
      },
    ],
    opacity: cloud5Anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.7, 0.5],
    }),
  };

  const cloud6Style = {
    transform: [
      {
        translateY: cloud6Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 16],
        }),
      },
      {
        translateX: cloud6Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        scale: cloud6Anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.98, 1],
        }),
      },
    ],
    opacity: cloud6Anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.4, 0.6, 0.4],
    }),
  };

  return (
    <View style={styles.container}>
      {/* Gradient background that matches the logo */}
      <LinearGradient
        colors={[
          theme.softPink,
          theme.background,
          theme.softBlue,
          theme.softPurple,
          theme.background,
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.2, 0.5, 0.8, 1]}
      />

      {/* Animated Clouds */}
      <View style={styles.cloudsContainer}>
        {/* Cloud 1 - Top Left */}
        <Animated.View style={[styles.cloud, styles.cloud1, cloud1Style]}>
          <Image
            source={require('@/assets/images/clouds.png')}
            style={styles.cloudImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cloud 2 - Top Right */}
        <Animated.View style={[styles.cloud, styles.cloud2, cloud2Style]}>
          <Image
            source={require('@/assets/images/clouds.png')}
            style={[styles.cloudImage, { transform: [{ scaleX: -1 }] }]} // Flip horizontally
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cloud 3 - Middle Left */}
        <Animated.View style={[styles.cloud, styles.cloud3, cloud3Style]}>
          <Image
            source={require('@/assets/images/clouds.png')}
            style={[styles.cloudImage, { transform: [{ scale: 0.8 }] }]} // Smaller
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cloud 4 - Middle Right */}
        <Animated.View style={[styles.cloud, styles.cloud4, cloud4Style]}>
          <Image
            source={require('@/assets/images/clouds.png')}
            style={[styles.cloudImage, { transform: [{ scaleX: -1 }, { scale: 0.9 }] }]} // Flip and scale
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cloud 5 - Bottom Left */}
        <Animated.View style={[styles.cloud, styles.cloud5, cloud5Style]}>
          <Image
            source={require('@/assets/images/clouds.png')}
            style={[styles.cloudImage, { transform: [{ scale: 0.7 }] }]} // Smaller
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cloud 6 - Bottom Right */}
        <Animated.View style={[styles.cloud, styles.cloud6, cloud6Style]}>
          <Image
            source={require('@/assets/images/clouds.png')}
            style={[styles.cloudImage, { transform: [{ scaleX: -1 }, { scale: 0.85 }] }]} // Flip and scale
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cloudsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  cloud: {
    position: "absolute",
  },
  cloudImage: {
    width: 120,
    height: 80,
  },
  cloud1: {
    top: 60,
    left: 20,
  },
  cloud2: {
    top: 40,
    right: 30,
  },
  cloud3: {
    top: 250,
    left: 10,
  },
  cloud4: {
    top: 350,
    right: 20,
  },
  cloud5: {
    top: 500,
    left: 40,
  },
  cloud6: {
    top: 600,
    right: 10,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

export default AnimatedCloudBackground;
