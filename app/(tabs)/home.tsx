import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, SleepData, FeedData, DiaperData, ActivityData, MilestoneData } from '@/services/ChildService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import ChildSelectionModal from '../modals/ChildSelectionModal';
import SleepModal from '../modals/SleepModal';
import FeedModal from '../modals/FeedModal';
import DiaperModal from '../modals/DiaperModal';
import ActivityModal from '../modals/ActivityModal';
import MilestoneModal from '../modals/MilestoneModal';
import Colors from "@/constants/Colors";
import CornerIndicators from '@/components/CornerIndicators';

const ACTION_TYPES = [
  { key: 'sleep', icon: 'power-sleep', label: 'Sleep', modalKey: 'sleep' },
  { key: 'feed', icon: 'food-apple', label: 'Feed', modalKey: 'feed' },
  { key: 'diaper', icon: 'baby-face-outline', label: 'Diaper', modalKey: 'diaper' },
  { key: 'activity', icon: 'run', label: 'Activity', modalKey: 'activity' },
  { key: 'milestone', icon: 'star', label: 'Milestone', modalKey: 'milestone' }
] as const;

export default function Home() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild, loading } = useSelectedChild();

  const [modalVisibility, setModalVisibility] = useState({
    childSelection: false,
    sleep: false,
    feed: false,
    diaper: false,
    activity: false,
    milestone: false,
  });

  useEffect(() => {
    const unsubscribeAuth = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/');
      } else {
        fetchUserChildrenList();
      }
    });
    return unsubscribeAuth;
  }, []);

  const fetchUserChildrenList = async () => {
    try {
      console.log('[home] fetchUserChildrenList called [ChildService]fetchUserChildren');
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
    } catch (error) {
      console.error('Error fetching children list:', error);
      Alert.alert('Error', 'Could not fetch your children list. Please try again later.');
    }
  };

  const handleSave = async (data: SleepData | FeedData | DiaperData | ActivityData | MilestoneData, saveFunction: Function, successMessage: string, errorMessage: string) => {
    try {
      await saveFunction(data);
      Alert.alert('Success', successMessage);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      Alert.alert('Error', errorMessage);
      throw error;
    }
  };

  const handleNavigateToAddChild = () => {
    router.push('/addchild');
  };

  const handleActionPress = (actionKey: string) => {
    setModalVisibility(prev => ({ ...prev, [actionKey]: true }));
    console.log(`[Components] ${actionKey}Modal set to visible`);
  };

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMs = today.getTime() - birthDate.getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} day${ageInDays !== 1 ? 's' : ''}`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const remainingMonths = Math.floor((ageInDays % 365) / 30);
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <CornerIndicators
        selectedChild={selectedChild}
        childrenList={childrenList}
        onSelectChild={saveSelectedChild}
        onNavigateToAddChild={handleNavigateToAddChild}
      />

      <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>

        </View>

        {selectedChild ? (
          <View style={[styles.childInfoCard, { backgroundColor: theme.secondaryBackground, borderColor: theme.tint }]}>
            <View style={styles.childInfoLayout}>
              <View style={styles.childDetails}>
                <Text style={[styles.childName, { color: theme.text }]}>
                  {selectedChild.first_name} {selectedChild.last_name}
                </Text>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Age:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {calculateAge(selectedChild.dob)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Born:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatDate(selectedChild.dob)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Sex:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedChild.sex === 'male' ? 'Male' : 'Female'}
                  </Text>
                </View>
              </View>

              <View style={[styles.childImageContainer, { backgroundColor: theme.background }]}>
                <MaterialCommunityIcons
                  name="account-child"
                  size={48}
                  color={theme.tint}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.noChildCard, { backgroundColor: theme.secondaryBackground }]}>
            <MaterialCommunityIcons
              name="account-child-outline"
              size={32}
              color={theme.secondaryText}
            />
            <Text style={[styles.noChildText, { color: theme.secondaryText }]}>
              Please select a child to start tracking
            </Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          {ACTION_TYPES.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[
                styles.actionButton,
                { backgroundColor: theme.secondaryBackground },
                !selectedChild && styles.actionButtonDisabled
              ]}
              onPress={() => handleActionPress(action.modalKey)}
              disabled={!selectedChild}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: selectedChild ? theme.tint : theme.background }]}>
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={24}
                  color={selectedChild ? theme.background : theme.secondaryText}
                />
              </View>
              <Text style={[
                styles.actionLabel,
                { color: selectedChild ? theme.text : theme.secondaryText }
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!selectedChild && (
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: theme.secondaryText }]}>
              Select a child to record activities and track their growth journey
            </Text>
          </View>
        )}
      </View>

      <ChildSelectionModal
        visible={modalVisibility.childSelection}
        onClose={() => setModalVisibility(prev => ({ ...prev, childSelection: false }))}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={saveSelectedChild}
        onClearSelection={clearSelectedChild}
      />

      <SleepModal
        visible={modalVisibility.sleep}
        onClose={() => setModalVisibility(prev => ({ ...prev, sleep: false }))}
        onSave={(data) => handleSave(data, ChildService.addSleep, 'Sleep data added!', 'Error adding sleep data. Please try again.')}
        childId={selectedChild?.id}
      />

      <FeedModal
        visible={modalVisibility.feed}
        onClose={() => setModalVisibility(prev => ({ ...prev, feed: false }))}
        onSave={(data) => handleSave(data, ChildService.addFeed, 'Feed data added!', 'Error adding sleep data. Please try again.')}
        childId={selectedChild?.id}
      />

      <DiaperModal
        visible={modalVisibility.diaper}
        onClose={() => setModalVisibility(prev => ({ ...prev, diaper: false }))}
        onSave={(data) => handleSave(data, ChildService.addDiaper, 'Diaper data added!', 'Error adding diaper data. Please try again.')}
        childId={selectedChild?.id}
      />

      <ActivityModal
        visible={modalVisibility.activity}
        onClose={() => setModalVisibility(prev => ({ ...prev, activity: false }))}
        onSave={(data) => handleSave(data, ChildService.addActivity, 'Activity data added!', 'Error adding activity data. Please try again.')}
        childId={selectedChild?.id}
      />

      <MilestoneModal
        visible={modalVisibility.milestone}
        onClose={() => setModalVisibility(prev => ({ ...prev, milestone: false }))}
        onSave={(data) => handleSave(data, ChildService.addMilestone, 'Milestone data added!', 'Error adding milestone data. Please try again.')}
        childId={selectedChild?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  childInfoCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noChildCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  noChildText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  childInfoLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childDetails: {
    flex: 1,
    marginRight: 16,
  },
  childName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  childImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});
