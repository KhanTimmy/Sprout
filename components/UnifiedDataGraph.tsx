import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { SleepData, FeedData, DiaperData, ActivityData, MilestoneData, WeightData } from '@/services/ChildService';
import type { TrendType } from './TrendSelector';
import SleepVisualization from './visualizations/SleepDataVisualization';
import FeedVisualization from './visualizations/FeedDataVisualization';
import DiaperVisualization from './visualizations/DiaperDataVisualization';
import ActivityVisualization from './visualizations/ActivityDataVisualization';
import MilestoneVisualization from './visualizations/MilestoneDataVisualization';
import WeightVisualization from './visualizations/WeightDataVisualization';

interface UnifiedDataGraphProps {
  sleepData: SleepData[];
  feedData: FeedData[];
  diaperData: DiaperData[];
  activityData: ActivityData[];
  milestoneData: MilestoneData[];
  weightData: WeightData[];
  rangeDays: number;
  activeDataType: TrendType;
}

const UnifiedDataGraph = ({
  sleepData: rawSleepData,
  feedData: rawFeedData,
  diaperData: rawDiaperData,
  activityData: rawActivityData,
  milestoneData: rawMilestoneData,
  weightData: rawWeightData,
  rangeDays,
  activeDataType,
}: UnifiedDataGraphProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ScrollView>
      <View>
        {activeDataType === 'sleep' && (
          <SleepVisualization sleepData={rawSleepData} rangeDays={rangeDays} />
        )}
        {activeDataType === 'feed' && (
          <FeedVisualization feedData={rawFeedData} rangeDays={rangeDays} />
        )}
        {activeDataType === 'diaper' && (
          <DiaperVisualization diaperData={rawDiaperData} rangeDays={rangeDays} />
        )}
        {activeDataType === 'activity' && (
          <ActivityVisualization activityData={rawActivityData} rangeDays={rangeDays} />
        )}
        {activeDataType === 'milestone' && (
          <MilestoneVisualization milestoneData={rawMilestoneData} rangeDays={rangeDays} />
        )}
        {activeDataType === 'weight' && (
          <WeightVisualization weightData={rawWeightData} rangeDays={rangeDays} />
        )}
      </View>
    </ScrollView>
  );
};

export default UnifiedDataGraph; 