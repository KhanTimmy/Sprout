import React from 'react';
import { View } from 'react-native';
import { SleepData, FeedData, DiaperData, ActivityData, MilestoneData } from '@/services/ChildService';
import type { TrendType } from './TrendSelector';
import SleepVisualization from './visualizations/SleepDataVisualization';
import FeedVisualization from './visualizations/FeedDataVisualization';
import DiaperVisualization from './visualizations/DiaperDataVisualization';
import ActivityVisualization from './visualizations/ActivityDataVisualization';
import MilestoneVisualization from './visualizations/MilestoneDataVisualization';

interface UnifiedDataGraphProps {
  sleepData: SleepData[];
  feedData: FeedData[];
  diaperData: DiaperData[];
  activityData: ActivityData[];
  milestoneData: MilestoneData[];
  rangeDays: number;
  activeDataType: TrendType;
}

const UnifiedDataGraph = ({
  sleepData: rawSleepData,
  feedData: rawFeedData,
  diaperData: rawDiaperData,
  activityData: rawActivityData,
  milestoneData: rawMilestoneData,
  rangeDays,
  activeDataType,
}: UnifiedDataGraphProps) => {
  const renderVisualization = () => {
    switch (activeDataType) {
      case 'sleep':
        return <SleepVisualization sleepData={rawSleepData} rangeDays={rangeDays} />;
      case 'feed':
        return <FeedVisualization feedData={rawFeedData} rangeDays={rangeDays} />;
      case 'diaper':
        return <DiaperVisualization diaperData={rawDiaperData} rangeDays={rangeDays} />;
      case 'activity':
        return <ActivityVisualization activityData={rawActivityData} rangeDays={rangeDays} />;
      case 'milestone':
        return <MilestoneVisualization milestoneData={rawMilestoneData} rangeDays={rangeDays} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderVisualization()}
    </View>
  );
};

export default UnifiedDataGraph; 