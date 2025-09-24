import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, FeedData, SleepData, DiaperData, ActivityData, MilestoneData, WeightData } from '@/services/ChildService';
import UnifiedDataGraph from '@/components/UnifiedDataGraph';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import TrendSelector, { TrendType } from '@/components/TrendSelector';
import ChildSelectionModal from '../modals/ChildSelectionModal';
import Colors from '@/constants/Colors';
import CornerIndicators from '@/components/CornerIndicators';


export default function Reports() {
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

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
            />
          </View>
        </View>
      </View>

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
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerSection: {
    alignItems: 'center',
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
    flex: 1,
  },
  graphContainer: {
    flex: 1,
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
