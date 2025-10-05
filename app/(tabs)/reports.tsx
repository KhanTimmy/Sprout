import React, { useEffect, useState } from 'react';
<<<<<<< Updated upstream
import { StyleSheet, TouchableOpacity, Text, View, Alert, ScrollView } from 'react-native';
=======
import { StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> Stashed changes
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildUpdateService, ChildData, FeedData, SleepData, DiaperData, ActivityData, MilestoneData, WeightData } from '@/services/ChildService';
import UnifiedDataGraph from '@/components/UnifiedDataGraph';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import TrendSelector, { TrendType } from '@/components/TrendSelector';
import ChildSelectionModal from '../modals/ChildSelectionModal';
<<<<<<< Updated upstream
import { useTheme } from '@/contexts/ThemeContext';
import CornerIndicators from '@/components/CornerIndicators';
import { useTabSwipeNavigation } from '@/hooks/useSwipeNavigation';
import AnimatedCloudBackground from '@/components/AnimatedCloudBackground';
import { View as SafeAreaView } from 'react-native';
=======
import SleepModal from '../modals/SleepModal';
import FeedModal from '../modals/FeedModal';
import DiaperModal from '../modals/DiaperModal';
import ActivityModal from '../modals/ActivityModal';
import WeightModal from '../modals/WeightModal';
import { useTheme } from '@/contexts/ThemeContext';
import CornerIndicators from '@/components/CornerIndicators';
import AnimatedCloudBackground from '@/components/AnimatedCloudBackground';
>>>>>>> Stashed changes


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
  const [weights, setWeights] = useState<WeightData[]>([]);

  const [childSelectionModalVisible, setChildSelectionModalVisible] = useState(false);
  const [editContext, setEditContext] = useState<{ type: TrendType; entry: any } | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  
  // Modal visibility states
  const [modalVisibility, setModalVisibility] = useState({
    sleep: false,
    feed: false,
    diaper: false,
    activity: false,
    weight: false,
  });

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
        setWeights([]);
        return;
      }

      console.log('[Reports] fetchAllData executing for child:', selectedChild.first_name, selectedChild.last_name);
      try {
        console.log('[Reports] Fetching all data types from ChildService...');
        const [feedingsData, sleepsData, diapersData, activitiesData, milestonesData, weightsData] = await Promise.all([
          ChildService.getFeed(selectedChild.id),
          ChildService.getSleep(selectedChild.id),
          ChildService.getDiaper(selectedChild.id),
          ChildService.getActivity(selectedChild.id),
          ChildService.getMilestone(selectedChild.id),
          ChildService.getWeight(selectedChild.id)
        ]);

        console.log('[Reports] Data fetched successfully:');
        console.log('...[Reports] Feedings:', feedingsData.length, 'entries');
        console.log('...[Reports] Sleeps:', sleepsData.length, 'entries');
        console.log('...[Reports] Diapers:', diapersData.length, 'entries');
        console.log('...[Reports] Activities:', activitiesData.length, 'entries');
        console.log('...[Reports] Milestones:', milestonesData.length, 'entries');
        console.log('...[Reports] Weights:', weightsData.length, 'entries');

        setFeedings(feedingsData);
        setSleeps(sleepsData);
        setDiapers(diapersData);
        setActivities(activitiesData);
        setMilestones(milestonesData);
        setWeights(weightsData);
        
        console.log('[Reports] All data states updated, ready for visualization');
      } catch (error) {
        console.error('[Reports] Error fetching data:', error);
        Alert.alert('Error', 'Could not fetch data');
      }
    };

    fetchAllData();
  }, [selectedChild]);

<<<<<<< Updated upstream
  return (
    <SafeAreaView style={styles.container}>
=======
  const { theme } = useTheme();

  const handleEditRequest = (args: { type: TrendType; payload: any }) => {
    setEditContext({ type: args.type, entry: args.payload });
    setModalVisibility(prev => ({ ...prev, [args.type]: true }));
  };

  const handleModalClose = (type: TrendType) => {
    setModalVisibility(prev => ({ ...prev, [type]: false }));
    setEditContext(null);
  };

  const handleSave = async (type: TrendType, data: any) => {
    if (!selectedChild) return;
    
    try {
      if (editContext?.entry?.docId) {
        // Update existing entry
        const { docId, ...updateData } = data;
        switch (type) {
          case 'sleep':
            await ChildUpdateService.updateSleep(selectedChild.id, editContext.entry.docId, updateData);
            break;
          case 'feed':
            await ChildUpdateService.updateFeed(selectedChild.id, editContext.entry.docId, updateData);
            break;
          case 'diaper':
            await ChildUpdateService.updateDiaper(selectedChild.id, editContext.entry.docId, updateData);
            break;
          case 'activity':
            await ChildUpdateService.updateActivity(selectedChild.id, editContext.entry.docId, updateData);
            break;
          case 'weight':
            await ChildUpdateService.updateWeight(selectedChild.id, editContext.entry.docId, updateData);
            break;
        }
      } else {
        // Create new entry
        switch (type) {
          case 'sleep':
            await ChildService.addSleep(data);
            break;
          case 'feed':
            await ChildService.addFeed(data);
            break;
          case 'diaper':
            await ChildService.addDiaper(data);
            break;
          case 'activity':
            await ChildService.addActivity(data);
            break;
          case 'weight':
            await ChildService.addWeight(data);
            break;
        }
      }
      
      // Refresh data
      const fetchAllData = async () => {
        if (!selectedChild) return;
        
        try {
          const [feedingsData, sleepsData, diapersData, activitiesData, milestonesData, weightsData] = await Promise.all([
            ChildService.getFeed(selectedChild.id),
            ChildService.getSleep(selectedChild.id),
            ChildService.getDiaper(selectedChild.id),
            ChildService.getActivity(selectedChild.id),
            ChildService.getMilestone(selectedChild.id),
            ChildService.getWeight(selectedChild.id)
          ]);

          setFeedings(feedingsData);
          setSleeps(sleepsData);
          setDiapers(diapersData);
          setActivities(activitiesData);
          setMilestones(milestonesData);
          setWeights(weightsData);
        } catch (error) {
          console.error('[Reports] Error refreshing data:', error);
        }
      };
      
      await fetchAllData();
      setDataVersion(prev => prev + 1); // Increment to trigger popup refresh
      handleModalClose(type);
    } catch (error) {
      console.error(`Error saving ${type} data:`, error);
      Alert.alert('Error', `Could not save ${type} data`);
    }
  };

  const handleDelete = async (type: TrendType, docId: string) => {
    if (!selectedChild) return;
    
    try {
      switch (type) {
        case 'sleep':
          await ChildUpdateService.deleteSleep(selectedChild.id, docId);
          break;
        case 'feed':
          await ChildUpdateService.deleteFeed(selectedChild.id, docId);
          break;
        case 'diaper':
          await ChildUpdateService.deleteDiaper(selectedChild.id, docId);
          break;
        case 'activity':
          await ChildUpdateService.deleteActivity(selectedChild.id, docId);
          break;
        case 'weight':
          await ChildUpdateService.deleteWeight(selectedChild.id, docId);
          break;
      }
      
      // Refresh data
      const fetchAllData = async () => {
        if (!selectedChild) return;
        
        try {
          const [feedingsData, sleepsData, diapersData, activitiesData, milestonesData, weightsData] = await Promise.all([
            ChildService.getFeed(selectedChild.id),
            ChildService.getSleep(selectedChild.id),
            ChildService.getDiaper(selectedChild.id),
            ChildService.getActivity(selectedChild.id),
            ChildService.getMilestone(selectedChild.id),
            ChildService.getWeight(selectedChild.id)
          ]);

          setFeedings(feedingsData);
          setSleeps(sleepsData);
          setDiapers(diapersData);
          setActivities(activitiesData);
          setMilestones(milestonesData);
          setWeights(weightsData);
        } catch (error) {
          console.error('[Reports] Error refreshing data:', error);
        }
      };
      
      await fetchAllData();
      setDataVersion(prev => prev + 1); // Increment to trigger popup refresh
      handleModalClose(type);
    } catch (error) {
      console.error(`Error deleting ${type} data:`, error);
      Alert.alert('Error', `Could not delete ${type} data`);
    }
  };

  return (
    <View style={styles.container}>
>>>>>>> Stashed changes
      <AnimatedCloudBackground>
        <CornerIndicators
          selectedChild={selectedChild}
          childrenList={childrenList}
          onSelectChild={saveSelectedChild}
          onNavigateToAddChild={handleNavigateToAddChild}
        />
<<<<<<< Updated upstream
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
=======
        <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
          <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Reports</Text>
        </View>
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
        <View style={styles.graphSection}>
          <View style={[styles.graphContainer, { backgroundColor: theme.secondaryBackground }]}>
            <UnifiedDataGraph
              sleepData={sleeps}
              feedData={feedings}
              diaperData={diapers}
              activityData={activities}
              milestoneData={milestones}
              weightData={weights}
              rangeDays={rangeDays}
              activeDataType={selectedTrend}
              onEditRequest={handleEditRequest}
              dataVersion={dataVersion}
            />
          </View>
        </View>
          </View>
        </SafeAreaView>
>>>>>>> Stashed changes
      </AnimatedCloudBackground>

      <ChildSelectionModal
        visible={childSelectionModalVisible}
        onClose={() => setChildSelectionModalVisible(false)}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={saveSelectedChild}
        onClearSelection={clearSelectedChild}
      />

      {/* Edit Modals */}
      <SleepModal
        visible={modalVisibility.sleep}
        onClose={() => handleModalClose('sleep')}
        onSave={(data) => handleSave('sleep', data)}
        childId={selectedChild?.id}
        initialData={editContext?.type === 'sleep' ? editContext.entry : undefined}
        onDelete={editContext?.type === 'sleep' ? (docId) => handleDelete('sleep', docId) : undefined}
      />

      <FeedModal
        visible={modalVisibility.feed}
        onClose={() => handleModalClose('feed')}
        onSave={(data) => handleSave('feed', data)}
        childId={selectedChild?.id}
        initialData={editContext?.type === 'feed' ? editContext.entry : undefined}
        onDelete={editContext?.type === 'feed' ? (docId) => handleDelete('feed', docId) : undefined}
      />

      <DiaperModal
        visible={modalVisibility.diaper}
        onClose={() => handleModalClose('diaper')}
        onSave={(data) => handleSave('diaper', data)}
        childId={selectedChild?.id}
        initialData={editContext?.type === 'diaper' ? editContext.entry : undefined}
        onDelete={editContext?.type === 'diaper' ? (docId) => handleDelete('diaper', docId) : undefined}
      />

      <ActivityModal
        visible={modalVisibility.activity}
        onClose={() => handleModalClose('activity')}
        onSave={(data) => handleSave('activity', data)}
        childId={selectedChild?.id}
        initialData={editContext?.type === 'activity' ? editContext.entry : undefined}
        onDelete={editContext?.type === 'activity' ? (docId) => handleDelete('activity', docId) : undefined}
      />

      <WeightModal
        visible={modalVisibility.weight}
        onClose={() => handleModalClose('weight')}
        onSave={(data) => handleSave('weight', data)}
        childId={selectedChild?.id}
        initialData={editContext?.type === 'weight' ? editContext.entry : undefined}
        onDelete={editContext?.type === 'weight' ? (docId) => handleDelete('weight', docId) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
<<<<<<< Updated upstream
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
=======
  },
  safeAreaContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 90, // Add padding for tab bar
>>>>>>> Stashed changes
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
