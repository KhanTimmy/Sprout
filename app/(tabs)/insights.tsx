import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView, ViewStyle, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, FeedData, SleepData, DiaperData, ActivityData, MilestoneData, WeightData } from '@/services/ChildService';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import CornerIndicators from '@/components/CornerIndicators';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import Markdown from 'react-native-markdown-display';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const TREND_TYPES = [
  { key: 'sleep', icon: 'power-sleep', label: 'Sleep' },
  { key: 'feed', icon: 'food-apple', label: 'Feed' },
  { key: 'diaper', icon: 'baby-face-outline', label: 'Diaper' },
  { key: 'activity', icon: 'run', label: 'Activity' },
  { key: 'milestone', icon: 'star', label: 'Milestone' },
  { key: 'weight', icon: 'scale-bathroom', label: 'Weight' }
] as const;

const InsightsTrendSelector: React.FC<{
  selectedTypes: string[];
  onSelect: (type: string) => void;
}> = ({ selectedTypes, onSelect }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const getBorderRadius = (index: number): ViewStyle => {
    const isSelected = selectedTypes.includes(TREND_TYPES[index].key);
    if (!isSelected) return {};

    let blockStart = index;
    let blockEnd = index;

    while (blockStart > 0 && selectedTypes.includes(TREND_TYPES[blockStart - 1].key)) {
      blockStart--;
    }

    while (blockEnd < TREND_TYPES.length - 1 && selectedTypes.includes(TREND_TYPES[blockEnd + 1].key)) {
      blockEnd++;
    }

    return {
      borderTopLeftRadius: blockStart === index ? 20 : 0,
      borderBottomLeftRadius: blockStart === index ? 20 : 0,
      borderTopRightRadius: blockEnd === index ? 20 : 0,
      borderBottomRightRadius: blockEnd === index ? 20 : 0,
      borderWidth: 1,
      borderColor: theme.tint,
      borderLeftWidth: blockStart === index ? 1 : 0,
      borderRightWidth: blockEnd === index ? 1 : 0,
      borderTopWidth: 1,
      borderBottomWidth: 1,
    };
  };

  return (
    <View style={[styles.trendSelectorContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.trendTrack, { backgroundColor: theme.secondaryBackground }]}>
        {TREND_TYPES.map((type, index) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.trendOption,
              selectedTypes.includes(type.key) && { backgroundColor: theme.slider },
              getBorderRadius(index)
            ]}
            onPress={() => onSelect(type.key)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={type.icon as any}
              size={28}
              color={selectedTypes.includes(type.key) ? theme.tint : theme.secondaryText}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild } = useSelectedChild();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['feed', 'sleep']);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const [rangeDays, setRangeDays] = useState(7);

  const [feedData, setFeedData] = useState<FeedData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [diaperData, setDiaperData] = useState<DiaperData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [milestoneData, setMilestoneData] = useState<MilestoneData[]>([]);
  const [weightData, setWeightData] = useState<WeightData[]>([]);

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

  useEffect(() => {
    if (selectedChild) {
      console.log('Selected child:', selectedChild);
      fetchAllData();
    }
  }, [selectedChild]);

  const fetchUserChildrenList = async () => {
    try {
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your children list.');
    }
  };

  const fetchAllData = async () => {
    if (!selectedChild) return;
    
    console.log('[Insights] fetchAllData executing for child:', selectedChild.first_name, selectedChild.last_name);
    try {
      setLoading(true);
      console.log('[Insights] Fetching all data types from ChildService...');
      const [feeds, sleeps, diapers, activities, milestones, weights] = await Promise.all([
        ChildService.getFeed(selectedChild.id),
        ChildService.getSleep(selectedChild.id),
        ChildService.getDiaper(selectedChild.id),
        ChildService.getActivity(selectedChild.id),
        ChildService.getMilestone(selectedChild.id),
        ChildService.getWeight(selectedChild.id)
      ]);

      console.log('[Insights] Data fetched successfully:');
      console.log('...[Insights] Feeds:', feeds.length, 'entries');
      console.log('...[Insights] Sleeps:', sleeps.length, 'entries');
      console.log('...[Insights] Diapers:', diapers.length, 'entries');
      console.log('...[Insights] Activities:', activities.length, 'entries');
      console.log('...[Insights] Milestones:', milestones.length, 'entries');
      console.log('...[Insights] Weights:', weights.length, 'entries');

      setFeedData(feeds);
      setSleepData(sleeps);
      setDiaperData(diapers);
      setActivityData(activities);
      setMilestoneData(milestones);
      setWeightData(weights);
      
      console.log('[Insights] All data states updated, ready for AI analysis');
    } catch (error) {
      console.error('[Insights] Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch child data');
    } finally {
      setLoading(false);
    }
  };

  const filterDataByTimeRange = (data: any[]) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeDays + 1);
    
    return data.filter(item => {
      const itemDate = new Date(item.dateTime);
      return itemDate >= startDate && itemDate <= now;
    });
  };

  const filterSleepDataByTimeRange = (data: SleepData[]) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeDays + 1);
    
    return data.filter(item => {
      return (
        (item.start >= startDate && item.start <= now) ||
        (item.end >= startDate && item.end <= now)
      );
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type) && prev.length === 1) {
        return prev;
      }
      
      const newTypes = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      console.log('Selected trends:', newTypes);
      return newTypes;
    });
  };

  const handleChildSelection = (child: ChildData | null) => {
    const isNewChild = !selectedChild || child?.id !== selectedChild.id;
    saveSelectedChild(child);
    if (isNewChild) {
      setAiResponse(null);
    }
  };

  const handleFetchInsights = async () => {
    if (!selectedChild) {
      Alert.alert('Select Child', 'Please select a child first.');
      return;
    }
    if (selectedTypes.length === 0) {
      Alert.alert('Select Data', 'Please select at least one data type.');
      return;
    }
    setLoading(true);
    setAiResponse(null);

    console.log('[Insights] handleFetchInsights executing');
    console.log('...[Insights] Time range selected:', rangeDays, 'days');
    console.log('...[Insights] Selected trends for analysis:', selectedTypes);

    const abortController = new AbortController();
    setController(abortController);

    try {
      const dataSummary: Record<string, any> = {
        child: {
          id: selectedChild.id,
          first_name: selectedChild.first_name,
          last_name: selectedChild.last_name,
          type: selectedChild.type,
          dob: selectedChild.dob,
          sex: selectedChild.sex,
        },
        range_days: rangeDays,
      };

      console.log('[Insights] Preparing data summary for AI analysis...');

      if (selectedTypes.includes('feed')) {
        const filteredFeed = filterDataByTimeRange(feedData);
        console.log('...[Insights] Feed data - Total:', feedData.length, 'Filtered:', filteredFeed.length, 'entries');
        dataSummary.feed = filteredFeed;
      }
      if (selectedTypes.includes('sleep')) {
        const filteredSleep = filterSleepDataByTimeRange(sleepData);
        console.log('...[Insights] Sleep data - Total:', sleepData.length, 'Filtered:', filteredSleep.length, 'entries');
        dataSummary.sleep = filteredSleep;
      }
      if (selectedTypes.includes('diaper')) {
        const filteredDiaper = filterDataByTimeRange(diaperData);
        console.log('...[Insights] Diaper data - Total:', diaperData.length, 'Filtered:', filteredDiaper.length, 'entries');
        dataSummary.diaper = filteredDiaper;
      }
      if (selectedTypes.includes('activity')) {
        const filteredActivity = filterDataByTimeRange(activityData);
        console.log('...[Insights] Activity data - Total:', activityData.length, 'Filtered:', filteredActivity.length, 'entries');
        dataSummary.activity = filteredActivity;
      }
      if (selectedTypes.includes('milestone')) {
        const filteredMilestone = filterDataByTimeRange(milestoneData);
        console.log('...[Insights] Milestone data - Total:', milestoneData.length, 'Filtered:', filteredMilestone.length, 'entries');
        dataSummary.milestone = filteredMilestone;
      }
      if (selectedTypes.includes('weight')) {
        const filteredWeight = filterDataByTimeRange(weightData);
        console.log('...[Insights] Weight data - Total:', weightData.length, 'Filtered:', filteredWeight.length, 'entries');
        dataSummary.weight = filteredWeight;
      }

      console.log('[Insights] Data summary prepared, sending to AI...');
      console.log('...[Insights] Final data summary structure:', Object.keys(dataSummary));

      const { id, ...childInfoWithoutId } = dataSummary.child;
      const today = new Date();
      const formattedToday = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const requestPayload = {
        model: `${Constants.expoConfig?.extra?.AI_MODEL}`,
        messages: [
          {
            role: 'system',
            content: `You are a pediatric child development expert AI. You will be given a structured JSON object containing a baby's caregiving history and developmental data.
            The data may include sections on: feeding, sleep, diaper changes, physical activities, milestones, and weight. Sometimes not all sections will be included, only what is selected by the caregiver.

            CRITICAL RULES – DO NOT IGNORE THIS:
            Do not confirm understanding of the prompt before generating the response, just generate the response.
            If a section is NOT selected, you MUST NOT provide ANY insight or mention of it.
            If a section is selected but contains no data, you MUST also skip it – no guessing or assumptions.
            Refrain from using timestamps
            Do not use lines to visually separate sections.
            Only respond to sections that meet BOTH conditions. Skip everything else completely.
            Convert timestamps to name of Month and Day (e.g., May 26th).
            Only generate insights for sections that BOTH:
            1. Contain data in the JSON, AND
            2. Were explicitly selected by the caregiver (via the keys: "feed", "sleep", "diaper", "activity", "milestone", "weight").

            Use the following Markdown headers only if their associated section meets both criteria:

            Section Titles

            ## General Well-Being
            This is a required section. You must include this section.
            Short summary of overall wellness based on the selected and included data only.
            Highlight positive trends and strengths.

            ## Sleep
            You must include this section ONLY if "sleep" has data
            Assess sleep duration, routines, and nap patterns compared to norms.

            ## Feed
            You must include this section ONLY if "feed" has data
            Evaluate feeding quantity, type, and scheduling.

            ## Diaper
            You must include this section ONLY if "diaper" has data
            Review frequency, consistency, and signs of hydration or issues.

            ## Activity
            You must include this section ONLY if "activity" has data
            Comment on physical and sensory activity variety and developmental stimulation.

            ## Milestone
            You must include this section ONLY if "milestone" has data
            Analyze developmental progress and upcoming age-appropriate goals.

            ## Weight
            You must include this section ONLY if "weight" has data
            Review weight trends, growth patterns, and nutritional adequacy.

            ## Warnings or Concerns
            This is a required section. You must include this section.
            Give actionable, gentle suggestions drawn from the included and selected data.
            Focus on comfort, development, and daily care optimization.
            
            ## Opportunities for Improvement
            This is a required section. You must include this section.
            Give actionable, gentle suggestions drawn from the included and selected data.
            Focus on comfort, development, and daily care optimization.
            Use generated insights to answer this section.

            Use warm, clear, parent-friendly language in every section. DO NOT include any code, technical instructions, or mention JSON structures. End your response with a short, encouraging sentence that affirms the caregiver's effort and supports them.`
          },
          {
            role: 'user',
            content: (() => {
              console.log('Child Info (without id):', childInfoWithoutId);
              console.log('Time Range:', dataSummary.range_days);
              console.log('Current Date:', formattedToday);
              console.log('Selected Types:', selectedTypes);

              selectedTypes.forEach(type => {
                const sectionData = dataSummary[type];
                if (sectionData) {
                  console.log(`Included Section: ${type.toUpperCase()}`);
                  console.log(sectionData);
                } else {
                  console.log(`Skipped Section: ${type.toUpperCase()} - No data found`);
                }
              });

              return `Provide insights, recommendations, concerns, and commentary on my child's health and development based on the following data:

              Child Information:
              ${JSON.stringify(childInfoWithoutId)}
              
              Time Range: Last ${dataSummary.range_days} days (as of ${formattedToday})
              
              Selected Data:
              ${selectedTypes.map(type => {
                if (dataSummary[type]) {
                  return `${type.toUpperCase()}:\n${JSON.stringify(dataSummary[type])}\n`;
                }
                return '';
              }).join('\n')}`;
            })()
          }
        ],
      };

      console.log(`[Insights] Sending request to ${Constants.expoConfig?.extra?.AI_MODEL} via ${Constants.expoConfig?.extra?.AI_API_ENDPOINT}`);
      const response = await fetch(`${Constants.expoConfig?.extra?.AI_API_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.AI_API_KEY}`,
        },
        body: JSON.stringify(requestPayload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Insights] API Response Error:', errorText);
        throw new Error(`API returned error: ${response.status}`);
      }
      const result = await response.json();
      console.log(result.choices[0]);
      const rawContent = result.choices?.[0]?.message?.content || 'No insights returned. Try again later.';
      const aiText = rawContent.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      console.log('[Insights] AI response received successfully');
      setAiResponse(aiText);
    } catch (error: any) {
      console.error('[Insights] Error during insight fetch:', error);
      if (error.name === 'AbortError') {
        console.log('[Insights] Fetch was aborted by user');
        setAiResponse(null);
      } else {
        setAiResponse('Error fetching insights. Please try again.');
      }
    } finally {
      setLoading(false);
      setController(null);
    }
  };

  const handleNavigateToAddChild = () => {
    router.push('/addchild');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <CornerIndicators
        selectedChild={selectedChild}
        childrenList={childrenList}
        onSelectChild={handleChildSelection}
        onNavigateToAddChild={handleNavigateToAddChild}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Insights</Text>
        </View>
        
        <View style={styles.controlsSection}>
          <InsightsTrendSelector
            selectedTypes={selectedTypes}
            onSelect={toggleType}
          />

          <TimeRangeSelector
            selectedRange={rangeDays}
            onRangeChange={setRangeDays}
          />

          {loading && controller && (
            <TouchableOpacity
              style={[styles.fetchButton, { backgroundColor: '#DC3545' }]}
              onPress={() => {
                controller.abort();
                setController(null);
              }}
            >
              <Text style={[styles.fetchButtonText, { color: '#fff' }]}>Cancel</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.tint} />
              <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
                Analyzing data...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.fetchButton,
                { backgroundColor: theme.tint },
                (!selectedChild || loading) && styles.fetchButtonDisabled
              ]}
              onPress={handleFetchInsights}
              disabled={!selectedChild || loading}
            >
              <MaterialCommunityIcons name="brain" size={20} color={selectedChild ? theme.background : theme.secondaryText} />
              <Text style={[styles.fetchButtonText, { color: selectedChild ? theme.background : theme.secondaryText }]}>
                Generate Insights
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {aiResponse && (
          <View style={styles.aiResponseSection}>
            <ScrollView 
              style={[styles.aiResponseContainer, { backgroundColor: theme.secondaryBackground }]}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.aiResponseContent}
            >
              <Markdown style={{
                body: { color: theme.text, fontSize: 14, lineHeight: 20 },
                heading2: { color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
                bullet_list: { color: theme.text },
                paragraph: { color: theme.text, marginBottom: 8 },
                strong: { color: theme.text, fontWeight: '600' },
                em: { color: theme.text },
              }}>
                {aiResponse}
              </Markdown>
              <View style={styles.aiResponseSpacer} />
            </ScrollView>
          </View>
        )}
      </View>
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
    marginBottom: 8,
  },
  fetchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fetchButtonDisabled: {
    opacity: 0.6,
  },
  fetchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  aiResponseSection: {
    flex: 1,
    marginTop: 4,
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  aiResponseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aiResponseContainer: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiResponseContent: {
    flexGrow: 1,
  },
  aiResponseSpacer: {
    height: 40,
  },
  trendSelectorContainer: {
    width: '100%',
    height: 70,
    marginVertical: 10,
    paddingHorizontal: 0,
  },
  trendTrack: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});