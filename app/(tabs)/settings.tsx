import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTabSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedCloudBackground from '@/components/AnimatedCloudBackground';
import CornerIndicators from '@/components/CornerIndicators';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData } from '@/services/ChildService';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { View as SafeAreaView } from 'react-native';

export default function SettingsScreen() {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild, loading } = useSelectedChild();

  // Swipe navigation for tab switching
  const { panGesture, translateX } = useTabSwipeNavigation('settings');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    const unsubscribeAuth = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/');
      } else {
        fetchUserChildrenList();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchUserChildrenList = async () => {
    try {
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleThemeToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  const handleChildSelection = (child: ChildData) => {
    saveSelectedChild(child);
  };

  const handleNavigateToAddChild = () => {
    router.push('/addchild');
  };

  const showCOPPADisclaimer = () => {
    Alert.alert(
      'COPPA Compliance',
      'Swaddle is fully compliant with the Children\'s Online Privacy Protection Act (COPPA).\n\n' +
      '• We do not collect personal information from children under 13 without verifiable parental consent\n' +
      '• All data is stored securely and locally on your device\n' +
      '• We do not share personal information with third parties\n' +
      '• Parents have full control over their child\'s data\n' +
      '• You can delete all data at any time\n\n' +
      'For more information, please review our Privacy Policy.',
      [{ text: 'OK' }]
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Privacy Policy Summary:\n\n' +
      '• Data Collection: We only collect data you explicitly provide\n' +
      '• Data Storage: All data is stored locally on your device\n' +
      '• Data Sharing: We do not share your data with third parties\n' +
      '• Data Security: Your data is protected with industry-standard encryption\n' +
      '• Your Rights: You can access, modify, or delete your data at any time\n' +
      '• Children\'s Privacy: We are COPPA compliant and protect children\'s privacy\n\n' +
      'For the complete Privacy Policy, please contact our support team.',
      [{ text: 'OK' }]
    );
  };

  const showAccessibilityInfo = () => {
    Alert.alert(
      'Accessibility Features',
      'Swaddle includes several accessibility features:\n\n' +
      '• High contrast mode for better visibility\n' +
      '• Large, easy-to-read fonts\n' +
      '• Simple, intuitive navigation\n' +
      '• Voice-over compatible\n' +
      '• Color-blind friendly design\n' +
      '• One-handed operation support\n\n' +
      'If you need additional accessibility features, please contact our support team.',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: theme.primary }]}>
          <MaterialCommunityIcons name={icon as any} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.secondaryText }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent || (
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.secondaryText} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedCloudBackground>
        <CornerIndicators
          selectedChild={selectedChild}
          childrenList={childrenList}
          onSelectChild={handleChildSelection}
          onNavigateToAddChild={handleNavigateToAddChild}
        />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.contentContainer, animatedStyle]}>
            <View style={styles.headerSection}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
              <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>
                Customize your experience
              </Text>
            </View>

            <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
              {/* Accessibility Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Accessibility</Text>
                
                <SettingItem
                  icon="theme-light-dark"
                  title="Theme"
                  subtitle={isDark ? 'Dark mode' : 'Light mode'}
                  rightComponent={
                    <Switch
                      value={isDark}
                      onValueChange={handleThemeToggle}
                      trackColor={{ false: theme.placeholder, true: theme.primary }}
                      thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                    />
                  }
                />

                <SettingItem
                  icon="accessibility"
                  title="Accessibility Features"
                  subtitle="Learn about available features"
                  onPress={showAccessibilityInfo}
                />
              </View>

              {/* Privacy & Compliance Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy & Compliance</Text>
                
                <SettingItem
                  icon="shield-check"
                  title="COPPA Compliance"
                  subtitle="Children's privacy protection"
                  onPress={showCOPPADisclaimer}
                />

                <SettingItem
                  icon="file-document-outline"
                  title="Privacy Policy"
                  subtitle="How we protect your data"
                  onPress={showPrivacyPolicy}
                />
              </View>

              {/* App Information Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>App Information</Text>
                
                <SettingItem
                  icon="information"
                  title="About "
                  subtitle="Version 1.0.0"
                  onPress={() => Alert.alert('About Swaddle', 'Swaddle - Baby Growth Tracker\nVersion 1.0.0\n\nA safe, COPPA-compliant app for tracking your baby\'s growth and development.')}
                />

                <SettingItem
                  icon="help-circle"
                  title="Help & Support"
                  subtitle="Get help and contact support"
                  onPress={() => Alert.alert('Help & Support', 'Need help? Contact our support team:\n\nEmail: support@swaddleapp.com\nPhone: 1-800-SWADDLE-1\n\nWe\'re here to help!')}
                />
              </View>

              {/* Data Management Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
                
                <SettingItem
                  icon="download"
                  title="Export Data"
                  subtitle="Download your data"
                  onPress={() => Alert.alert('Export Data', 'Data export feature coming soon! This will allow you to download all your child\'s data in a secure format.')}
                />

                <SettingItem
                  icon="delete"
                  title="Delete All Data"
                  subtitle="Remove all stored information"
                  onPress={() => {
                    Alert.alert(
                      'Delete All Data',
                      'This will permanently delete all your child\'s data. This action cannot be undone.\n\nAre you sure you want to continue?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => {
                            Alert.alert('Data Deletion', 'Data deletion feature coming soon! This will allow you to completely remove all stored data.')}
                        }
                      ]
                    );
                  }}
                />
              </View>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </AnimatedCloudBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 80, // Account for corner indicator buttons
    paddingBottom: 90, // Account for overlapping tab bar
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  settingsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
});
