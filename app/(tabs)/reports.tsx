import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, FeedData, SleepData, DiaperData, ActivityData, MilestoneData } from '@/services/ChildService';
import UnifiedDataGraph from '@/components/UnifiedDataGraph';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import TrendSelector, { TrendType } from '@/components/TrendSelector';
import ChildSelectionModal from '../modals/ChildSelectionModal';
import { useTheme } from '@/contexts/ThemeContext';
import CornerIndicators from '@/components/CornerIndicators';
import { useTabSwipeNavigation } from '@/hooks/useSwipeNavigation';
import AnimatedCloudBackground from '@/components/AnimatedCloudBackground';
import { View as SafeAreaView } from 'react-native';


export default function Reports() {
  const { theme } = useTheme();
  
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild, loading } = useSelectedChild();
  const [rangeDays, setRangeDays] = useState(7);
  const [selectedTrend, setSelectedTrend] = useState<TrendType>('sleep');

  const [feedings, setFeedings] = useState<FeedData[]>([]);
  const [sleeps, setSleeps] = useState<SleepData[]>([]);
  const [diapers, setDiapers] = useState<DiaperData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);

  const [childSelectionModalVisible, setChildSelectionModalVisible] = useState(false);

  // Swipe navigation for tab switching
  const { panGesture, translateX } = useTabSwipeNavigation('reports');

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
    return unsubscribeAuth;
  }, []);

  const fetchUserChildrenList = async () => {
    try {
      console.log('[reports] fetchUserChildrenList called [ChildService]fetchUserChildren');
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
    } catch (error) {
      console.error('Error fetching children list for reports:', error);
      Alert.alert('Error', 'Could not fetch your children list.');
    }
  };

  const handleNavigateToAddChild = () => {
    router.push('/addchild');
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!selectedChild) {
        console.log('[Reports] No child selected, clearing all data states');
        setFeedings([]);
        setSleeps([]);
        setDiapers([]);
        setActivities([]);
        setMilestones([]);
        return;
      }

      console.log('[Reports] fetchAllData executing for child:', selectedChild.first_name, selectedChild.last_name);
      try {
        console.log('[Reports] Fetching all data types from ChildService...');
        const [feedingsData, sleepsData, diapersData, activitiesData, milestonesData] = await Promise.all([
          ChildService.getFeed(selectedChild.id),
          ChildService.getSleep(selectedChild.id),
          ChildService.getDiaper(selectedChild.id),
          ChildService.getActivity(selectedChild.id),
          ChildService.getMilestone(selectedChild.id)
        ]);

        console.log('[Reports] Data fetched successfully:');
        console.log('...[Reports] Feedings:', feedingsData.length, 'entries');
        console.log('...[Reports] Sleeps:', sleepsData.length, 'entries');
        console.log('...[Reports] Diapers:', diapersData.length, 'entries');
        console.log('...[Reports] Activities:', activitiesData.length, 'entries');
        console.log('...[Reports] Milestones:', milestonesData.length, 'entries');

        setFeedings(feedingsData);
        setSleeps(sleepsData);
        setDiapers(diapersData);
        setActivities(activitiesData);
        setMilestones(milestonesData);
        
        console.log('[Reports] All data states updated, ready for visualization');
      } catch (error) {
        console.error('[Reports] Error fetching data:', error);
        Alert.alert('Error', 'Could not fetch data');
      }
    };

    fetchAllData();
  }, [selectedChild]);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedCloudBackground>
        <CornerIndicators
          selectedChild={selectedChild}
          childrenList={childrenList}
          onSelectChild={saveSelectedChild}
          onNavigateToAddChild={handleNavigateToAddChild}
        />
        <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.headerSection}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Reports</Text>
            </View>

            <View style={styles.controlsSection}>
              <TrendSelector
                selected={selectedTrend}
                onSelect={setSelectedTrend}
              />
              <TimeRangeSelector
                selectedRange={rangeDays}
                onRangeChange={setRangeDays}
              />
            </View>

            <View style={styles.graphSection}>
              <View style={[styles.graphContainer, { backgroundColor: theme.cardBackground }]}>
                <UnifiedDataGraph
                  sleepData={sleeps}
                  feedData={feedings}
                  diaperData={diapers}
                  activityData={activities}
                  milestoneData={milestones}
                  rangeDays={rangeDays}
                  activeDataType={selectedTrend}
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
        </GestureDetector>
      </AnimatedCloudBackground>

      <ChildSelectionModal
        visible={childSelectionModalVisible}
        onClose={() => setChildSelectionModalVisible(false)}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={saveSelectedChild}
        onClearSelection={clearSelectedChild}
      />
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Extra padding at bottom for better scrolling
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
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
  controlsSection: {
    marginBottom: 16,
  },
  graphSection: {
    minHeight: 400, // Minimum height for the graph section
  },
  graphContainer: {
    minHeight: 400, // Minimum height for the graph container
    width: '100%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
