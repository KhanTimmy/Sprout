import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator, useColorScheme, PanResponder } from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryStack, VictoryContainer } from 'victory-native';
import { MilestoneData } from '@/services/ChildService';
import Colors from '@/constants/Colors';

const MAX_MILESTONES_PER_DAY = 5;
const screenWidth = Dimensions.get('window').width;

// Interfaces
export interface MilestoneSession {
  dateTime: Date;
  type: string;
}

export interface StackedMilestoneData {
  x: string;
  y: number;
  type: string;
  sessionIndex: number;
  dateTime: Date;
}

export interface DayData {
  date: string;
  totalMilestones: number;
  sessions: StackedMilestoneData[];
  milestoneSessions: MilestoneSession[];
}

interface MilestoneSessionsListProps {
  sessions: MilestoneSession[];
}

interface BarPopoutProps {
  data: {
    x: string;
    type: string;
    milestoneCount: number;
    milestoneSessions: MilestoneSession[];
  };
  onClose: () => void;
  position: {
    x: number;
    y: number;
  };
}

interface MilestoneVisualizationProps {
  milestoneData: MilestoneData[];
  rangeDays: number;
}

// Utility Functions
export const getTypeColor = (type: string) => {
  switch (type) {
    case 'smiling': return '#ff9900'; // orange
    case 'rolling over': return '#ff4d4d'; // red
    case 'sitting up': return '#00c896'; // green
    case 'crawling': return '#4287f5'; // blue
    case 'walking': return '#9c27b0'; // purple
    default: return '#ccc'; // fallback
  }
};

export const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Components
export const MilestoneEntry = ({ milestone }: { milestone: MilestoneData }) => {
  const backgroundColor = getTypeColor(milestone.type);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[
      styles.milestoneEntry, 
      { 
        borderLeftColor: backgroundColor,
        backgroundColor: theme.secondaryBackground,
        borderBottomColor: theme.tint
      }
    ]}>
      <View style={styles.milestoneEntryHeader}>
        <Text style={[styles.milestoneDate, { color: theme.text }]}>{formatDate(milestone.dateTime)}</Text>
        <View style={[styles.typeIndicator, { backgroundColor }]}>
          <Text style={styles.typeText}>{milestone.type.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[styles.timeText, { color: theme.secondaryText }]}>
        {formatTime(milestone.dateTime)}
      </Text>
    </View>
  );
};

const MilestoneSessionsList: React.FC<MilestoneSessionsListProps> = ({ sessions }) => (
  <View style={styles.sessionsList}>
    {sessions.map((session, index) => (
      <View 
        key={index} 
        style={[
          styles.sessionItem,
          { borderLeftColor: getTypeColor(session.type) }
        ]}
      >
        <Text style={styles.sessionTime}>
          {formatTime(session.dateTime)}
        </Text>
        <View 
          style={[
            styles.barTypeIndicator,
            { backgroundColor: getTypeColor(session.type) }
          ]}
        >
          <Text style={styles.barTypeText}>{session.type[0].toUpperCase()}</Text>
        </View>
      </View>
    ))}
  </View>
);

const BarPopout: React.FC<BarPopoutProps> = ({ data, onClose, position }) => {
  const [popoutPosition, setPopoutPosition] = useState({ x: 0, y: 0 });
  const lastGestureState = useRef({ dx: 0, dy: 0 });
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastGestureState.current = { dx: 0, dy: 0 };
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx - lastGestureState.current.dx;
        const dy = gestureState.dy - lastGestureState.current.dy;
        
        setPopoutPosition(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        lastGestureState.current = {
          dx: gestureState.dx,
          dy: gestureState.dy
        };
      },
      onPanResponderRelease: () => {
        lastGestureState.current = { dx: 0, dy: 0 };
      }
    })
  ).current;

  return (
    <View 
      style={[
        styles.popout,
        {
          left: popoutPosition.x,
          top: popoutPosition.y,
          position: 'absolute',
          backgroundColor: theme.background,
          borderColor: theme.tint,
          zIndex: 1000,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <View 
        style={[styles.popoutHandle, { backgroundColor: theme.tint}]} 
        {...panResponder.panHandlers}
      />
      <View style={styles.popoutContent}>
        <Text style={[styles.popoutTitle, { color: theme.text }]}>
          {new Date(data.x + 'T12:00:00').toLocaleDateString()}{'\n'}
          Total: {data.milestoneCount} milestones
        </Text>
        <View style={styles.sessionsList}>
          {data.milestoneSessions.map((session, index) => (
            <View 
              key={index} 
              style={[
                styles.popoutSessionItem,
                { 
                  borderLeftColor: getTypeColor(session.type),
                  backgroundColor: theme.secondaryBackground,
                }
              ]}
            >
              <View style={styles.popoutTimeContainer}>
                <View style={styles.popoutTimeRow}>
                  <Text style={[styles.popoutTime, { color: theme.text }]}>
                    {formatTime(session.dateTime)}
                  </Text>
                  <View 
                    style={[
                      styles.popoutType,
                      { backgroundColor: getTypeColor(session.type) }
                    ]}
                  >
                    <Text style={styles.popoutTypeText}>{session.type.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Main functions for processing and rendering milestone data
export const filteredMilestoneData = (rawMilestoneData: MilestoneData[], rangeDays: number) => {
  const now = new Date();
  const startDate = new Date(`${new Date().toISOString().split('T')[0]}T12:00:00`);
  startDate.setDate(startDate.getDate() - rangeDays + 1);

  return rawMilestoneData
    .filter(milestone => {
      return milestone.dateTime >= startDate && milestone.dateTime <= now;
    })
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
};

export const processMilestoneData = (rawMilestoneData: MilestoneData[], rangeDays: number) => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - rangeDays + 1);
  startDate.setHours(0, 0, 0, 0);

  // Create array of all dates in range
  const allDates = Array.from({ length: rangeDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Process milestone data for each date
  return allDates.map(dateStr => {
    const currentDate = new Date(dateStr);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const daysMilestones = rawMilestoneData.filter(milestone => {
      const milestoneDate = new Date(milestone.dateTime);
      return milestoneDate >= currentDate && milestoneDate < nextDate;
    }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    const milestoneSessions = daysMilestones.map(milestone => ({
      dateTime: milestone.dateTime,
      type: milestone.type
    }));

    // Create stacked data for each day
    const stackedData = milestoneSessions.map((session, index) => ({
      x: dateStr,
      y: 1, // Each milestone has equal height
      type: session.type,
      sessionIndex: index,
      dateTime: session.dateTime
    }));

    return {
      date: dateStr,
      totalMilestones: milestoneSessions.length,
      sessions: stackedData,
      milestoneSessions
    };
  });
};

// Add a simple skeleton component for the graph
const GraphSkeleton = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  return (
    <View style={[styles.skeletonContainer, { backgroundColor: theme.secondaryBackground }]}>
      <View style={styles.skeletonChart}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[styles.skeletonText, { color: theme.secondaryText }]}>Loading milestone data...</Text>
      </View>
    </View>
  );
};

export const MilestoneVisualization: React.FC<MilestoneVisualizationProps> = ({ milestoneData: rawMilestoneData, rangeDays }) => {
  const [selectedBar, setSelectedBar] = useState<any>(null);
  const [popoutPosition, setPopoutPosition] = useState({ x: 0, y: 0 });
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processedData, setProcessedData] = useState<ReturnType<typeof processMilestoneData>>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // Process data when component mounts or data/range changes
  useEffect(() => {
    console.log('[MilestoneVisualization] Processing milestone data...');
    console.log('...[MilestoneVisualization] Raw data entries:', rawMilestoneData?.length || 0);
    console.log('...[MilestoneVisualization] Range days:', rangeDays);
    
    if (!rawMilestoneData || rawMilestoneData.length === 0) {
      console.log('[MilestoneVisualization] No milestone data available, setting loading to false');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    console.log('[MilestoneVisualization] Starting data processing...');
    
    // Process data with a small delay to allow UI to show loading state
    const timer = setTimeout(() => {
      const data = processMilestoneData(rawMilestoneData, rangeDays);
      console.log('[MilestoneVisualization] Data processing completed');
      console.log('...[MilestoneVisualization] Processed data entries:', data.length);
      console.log('...[MilestoneVisualization] Data range:', data[0]?.date, 'to', data[data.length - 1]?.date);
      setProcessedData(data);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [rawMilestoneData, rangeDays]);

  // Effect to scroll to current date once data is loaded
  useEffect(() => {
    if (!isLoading && scrollViewRef.current) {
      console.log('[MilestoneVisualization] Scrolling to current date...');
      // Use a longer duration for the animation so users can see dates flying by
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isLoading]);

  // Check for empty data after hooks
  if (!rawMilestoneData || rawMilestoneData.length === 0) {
    console.log('[MilestoneVisualization] Rendering empty state - no milestone data available');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.emptyStateContainer, { backgroundColor: theme.secondaryBackground }]}>
          <Text style={[styles.emptyStateText, { color: theme.text }]}>
            No milestone data available. Please select a child to view their milestone data.
          </Text>
        </View>
      </View>
    );
  }

  console.log('[MilestoneVisualization] Rendering milestone visualization with', processedData.length, 'processed entries');

  const handleBarPress = (evt: any, target: any) => {
    const nativeEvent = evt.nativeEvent || {};
    const { locationX, locationY } = nativeEvent;

    if (selectedBar?.data?.x === target.datum.x) {
      setSelectedBar(null);
    } else {
      setSelectedBar({
        data: target.datum,
        position: {
          x: locationX - 8,
          y: locationY
        },
      });
    }
  };

  const handleBackgroundPress = () => {
    if (selectedBar) {
      setSelectedBar(null);
    }
  };

  const renderMilestoneGraph = () => {
    const desiredColumnsPerScreen = 7;
    const yAxisWidth = 42;
    const rightMargin = 25;
    const columnWidth = (screenWidth - yAxisWidth - rightMargin) / desiredColumnsPerScreen;
    const chartWidth = Math.max(screenWidth - yAxisWidth, (rangeDays * columnWidth) + rightMargin);

    if (isLoading) {
      return <GraphSkeleton />;
    }

    return (
      <View style={styles.graphWrapper}>
        {/* Fixed Y-Axis */}
        <View style={[styles.yAxisContainer, { marginLeft: -8, backgroundColor: theme.secondaryBackground }]}>
          <VictoryAxis
            dependentAxis
            domain={[0, MAX_MILESTONES_PER_DAY]}
            style={{
              tickLabels: { fontSize: 10, padding: 2, fill: theme.text },
              axis: { stroke: theme.text },
              grid: { stroke: theme.secondaryText, strokeWidth: 1 }
            }}
            tickValues={[1, 2, 3, 4, MAX_MILESTONES_PER_DAY]}
            tickFormat={(t: number) => t === 0 ? '0' : `${t}`}
            containerComponent={<VictoryContainer responsive={false} />}
            width={yAxisWidth}
            height={300}
            padding={{ top: 20, bottom: 40, left: 35, right: 0 }}
          />
        </View>

        {/* Scrollable Chart Area */}
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={[styles.graphContainer, { backgroundColor: theme.secondaryBackground }]}
          >
            <VictoryChart
              width={chartWidth}
              height={300}
              padding={{ top: 20, bottom: 40, left: 0, right: 0 }}
              domainPadding={{ x: columnWidth * 0.67 }}
              scale={{ y: "linear" }}
              containerComponent={<VictoryContainer responsive={false} />}
              style={{
                background: { fill: theme.secondaryBackground }
              }}
            >
              {/* Add horizontal gridlines */}
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: { fill: "transparent" },
                  grid: { stroke: theme.secondaryText, strokeWidth: 1 }
                }}
                tickValues={[0, 1, 2, 3, 4, MAX_MILESTONES_PER_DAY]}
                padding={{ top: 20, bottom: 40, left: 0, right: 0 }}
              />

              {processedData.map((dayData) => (
                <VictoryStack key={dayData.date}>
                  {dayData.sessions.length > 0 ? (
                    dayData.sessions.map((session, sessionIndex) => (
                      <VictoryBar
                        key={`${dayData.date}-${sessionIndex}`}
                        data={[{
                          x: dayData.date,
                          y: session.y,
                          type: session.type,
                          milestoneCount: dayData.totalMilestones,
                          milestoneSessions: dayData.milestoneSessions
                        }]}
                        cornerRadius={{top: 5, bottom: 5}}
                        style={{
                          data: {
                            fill: getTypeColor(session.type),
                            width: columnWidth * 0.7,
                            stroke: selectedBar?.data?.x === dayData.date ? theme.tint : 'transparent',
                            strokeWidth: selectedBar?.data?.x === dayData.date ? 3 : 0,
                            strokeOpacity: 0.8,
                          }
                        }}
                        events={[{
                          target: "data",
                          eventHandlers: {
                            onPressIn: (evt) => handleBarPress(evt, {
                              datum: {
                                x: dayData.date,
                                type: session.type,
                                milestoneCount: dayData.totalMilestones,
                                milestoneSessions: dayData.milestoneSessions
                              }
                            })
                          }
                        }]}
                      />
                    ))
                  ) : (
                    // Add empty bar to maintain spacing
                    <VictoryBar
                      key={`${dayData.date}-empty`}
                      data={[{
                        x: dayData.date,
                        y: 0,
                        type: '',
                        milestoneCount: 0,
                        milestoneSessions: []
                      }]}
                      style={{
                        data: {
                          fill: 'transparent',
                          width: columnWidth * 0.7
                        }
                      }}
                    />
                  )}
                </VictoryStack>
              ))}                

              <VictoryAxis
                tickFormat={(date) => {
                  const d = new Date(`${date}T12:00:00`);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                style={{
                  tickLabels: { fontSize: 10, padding: 5, fill: theme.text },
                  axis: { stroke: theme.text }
                }}
              />
            </VictoryChart>
          </ScrollView>
        </TouchableWithoutFeedback>
        {selectedBar && (
          <BarPopout
            data={selectedBar.data}
            onClose={() => setSelectedBar(null)}
            position={selectedBar.position}
          />
        )}
      </View>
    );
  };

  // The main component's return
  return (
    <View style={[styles.milestoneContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.graphTitle,{ color: theme.text, backgroundColor: theme.secondaryBackground }]}>Milestone Data</Text>
      {renderMilestoneGraph()}
      
      {/* Milestone Entries List */}
      <View>
        <Text style={[styles.listTitle, { color: theme.text, backgroundColor: theme.secondaryBackground }]}>Milestone Entries</Text>
        {isLoading ? (
          <View style={[styles.loadingListContainer, { backgroundColor: theme.secondaryBackground }]}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Loading milestone entries...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMilestoneData(rawMilestoneData, rangeDays)}
            renderItem={({ item }) => <MilestoneEntry milestone={item} />}
            keyExtractor={(item, index) => `milestone-${index}`}
            style={[styles.milestoneList, { backgroundColor: theme.secondaryBackground }]}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  milestoneContainer: {
    flex: 1,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  graphWrapper: {
    flexDirection: 'row',
  },
  yAxisContainer: {
    width: 35,
    zIndex: 1,
  },
  graphContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
  },
  milestoneList: {
    flex: 1,
  },
  milestoneEntry: {
    padding: 12,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
  },
  milestoneEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  timeText: {
    fontSize: 14,
  },
  sessionsList: {
    gap: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
  },
  sessionTime: {
    flex: 1,
    fontSize: 12,
  },
  barTypeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  barTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  popout: {
    position: 'absolute',
    padding: 8,
    borderRadius: 12,
    width: 160,
    borderWidth: 1,
  },
  popoutContent: {
    flex: 1,
  },
  popoutHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  popoutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  popoutSessionItem: {
    padding: 6,
    marginVertical: 2,
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  popoutTimeContainer: {
    flex: 1,
  },
  popoutTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  popoutTime: {
    fontSize: 11,
  },
  popoutType: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popoutTypeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  skeletonContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonChart: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  skeletonText: {
    marginTop: 10,
    fontSize: 16,
  },
  loadingListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MilestoneVisualization; 