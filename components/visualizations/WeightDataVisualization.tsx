import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator, PanResponder } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryContainer, VictoryScatter } from 'victory-native';
import { WeightData } from '@/services/ChildService';
import { useTheme } from '@/contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export interface WeightEntry {
  id: string;
  dateTime: Date;
  pounds: number;
  ounces: number;
  totalOunces: number;
}

export interface ProcessedWeightData {
  x: string;
  y: number;
  pounds: number;
  ounces: number;
  totalOunces: number;
  dateTime: Date;
  displayDate: Date;
  isCarriedOver?: boolean;
}

interface WeightEntriesListProps {
  entries: WeightEntry[];
}

interface PointPopoutProps {
  data: {
    x: string;
    pounds: number;
    ounces: number;
    totalOunces: number;
    dateTime: Date;
    displayDate: Date;
    isCarriedOver?: boolean;
  };
  onClose: () => void;
  position: {
    x: number;
    y: number;
  };
}

interface WeightVisualizationProps {
  weightData: WeightData[];
  rangeDays: number;
  onEditRequest?: (payload: WeightData) => void;
  dataVersion?: number;
}

export const formatWeight = (pounds: number, ounces: number) => {
  if (pounds === 0) {
    return `${ounces} oz`;
  }
  if (ounces === 0) {
    return `${pounds} lbs`;
  }
  return `${pounds} lbs ${ounces} oz`;
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

export const convertToTotalOunces = (pounds: number, ounces: number) => {
  return (pounds * 16) + ounces;
};

// Returns YYYY-MM-DD for the device's local timezone
const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Creates a local Date from a YYYY-MM-DD key at a specific hour (default noon)
const createLocalDateFromKey = (dateKey: string, hour: number = 12) => {
  const [y, m, d] = dateKey.split('-').map(n => parseInt(n, 10));
  return new Date(y, (m - 1), d, hour, 0, 0, 0);
};

export const formatWeightForAxis = (totalOunces: number) => {
  const pounds = Math.floor(totalOunces / 16);
  const ounces = totalOunces % 16;
  if (pounds === 0) {
    return `${ounces}oz`;
  }
  if (ounces === 0) {
    return `${pounds}lbs`;
  }
  return `${pounds}lbs ${ounces}oz`;
};

export const WeightEntry = ({ weight }: { weight: WeightData }) => {
  const totalOunces = convertToTotalOunces(weight.pounds, weight.ounces);
  const { theme } = useTheme();

  return (
    <View style={[
      styles.weightEntry, 
      { 
        backgroundColor: theme.secondaryBackground,
        borderBottomColor: theme.tint
      }
    ]}>
      <View style={styles.weightEntryHeader}>
        <Text style={[styles.weightDate, { color: theme.text }]}>{formatDate(weight.dateTime)}</Text>
        <Text style={[styles.weightValue, { color: theme.tint }]}>
          {formatWeight(weight.pounds, weight.ounces)}
        </Text>
      </View>
      <View style={styles.weightDetails}>
        <Text style={[styles.timeText, { color: theme.secondaryText }]}>
          {formatTime(weight.dateTime)}
        </Text>
        <Text style={[styles.totalOuncesText, { color: theme.text }]}>
          {totalOunces} oz total
        </Text>
      </View>
    </View>
  );
};

const WeightEntriesList: React.FC<WeightEntriesListProps> = ({ entries }) => (
  <View style={styles.entriesList}>
    {entries.map((entry, index) => (
      <View 
        key={index} 
        style={styles.entryItem}
      >
        <Text style={styles.entryTime}>
          {formatTime(entry.dateTime)}
        </Text>
        <Text style={styles.entryWeight}>
          {formatWeight(entry.pounds, entry.ounces)}
        </Text>
        <Text style={styles.entryTotalOunces}>
          {entry.totalOunces} oz
        </Text>
      </View>
    ))}
  </View>
);

const PointPopout: React.FC<PointPopoutProps> = ({ data, onClose, position }) => {
  const [popoutPosition, setPopoutPosition] = useState({ x: 0, y: 0 });
  const lastGestureState = useRef({ dx: 0, dy: 0 });
  const { theme } = useTheme();

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
          {formatDate(data.displayDate)}
        </Text>
        <Text style={[styles.popoutWeight, { color: theme.tint }]}>
          {formatWeight(data.pounds, data.ounces)}
        </Text>
        <Text style={[styles.popoutTotalOunces, { color: theme.text }]}>
          {data.totalOunces} oz total
        </Text>
        {data.isCarriedOver && (
          <Text style={[styles.popoutCarriedOver, { color: theme.secondaryText }]}>
            (Carried over from {formatDate(data.dateTime)})
          </Text>
        )}
        <Text style={[styles.popoutTime, { color: theme.secondaryText }]}>
          {data.isCarriedOver ? 'No new measurement' : formatTime(data.dateTime)}
        </Text>
      </View>
    </View>
  );
};

export const filteredWeightData = (rawWeightData: WeightData[], rangeDays: number) => {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - rangeDays + 1);

  return rawWeightData
    .filter(weight => weight.dateTime >= startDate && weight.dateTime <= endOfToday)
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
};

export const processWeightData = (rawWeightData: WeightData[], rangeDays: number) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - rangeDays + 1);

  const allDates = Array.from({ length: rangeDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return getLocalDateKey(date);
  });

  
  // Sort all weight data by date (oldest first)
  const sortedWeights = [...rawWeightData].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  
  // Create a map of local date keys to the last weight entry for that local day
  const weightsByDate = new Map<string, WeightData>();
  sortedWeights.forEach(weight => {
    const key = getLocalDateKey(weight.dateTime);
    const existing = weightsByDate.get(key);
    if (!existing || existing.dateTime <= weight.dateTime) {
      weightsByDate.set(key, weight);
    }
  });

  // Process each day in the range
  let lastKnownWeight: WeightData | null = null;
  let hasFoundFirstWeight = false;
  
  return allDates.map(dateStr => {
    // Get weights for this specific local day by key equality
    const daysWeights = rawWeightData
      .filter(weight => getLocalDateKey(weight.dateTime) === dateStr)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    let weightToUse: WeightData | null = null;

    if (daysWeights.length > 0) {
      // Use the last weight entry for this local day
      weightToUse = daysWeights[daysWeights.length - 1];
      lastKnownWeight = weightToUse;
      hasFoundFirstWeight = true;
    } else if (hasFoundFirstWeight && lastKnownWeight) {
      // Only carry forward weight if we've found at least one weight entry
      weightToUse = lastKnownWeight;
    }
    // If hasFoundFirstWeight is false, weightToUse remains null (blank day)

    const processedWeights = weightToUse ? [{
      x: createLocalDateFromKey(dateStr, 12),
      y: convertToTotalOunces(weightToUse.pounds, weightToUse.ounces),
      pounds: weightToUse.pounds,
      ounces: weightToUse.ounces,
      totalOunces: convertToTotalOunces(weightToUse.pounds, weightToUse.ounces),
      dateTime: weightToUse.dateTime,
      displayDate: createLocalDateFromKey(dateStr, 12), // The date this dot represents (local)
      isCarriedOver: daysWeights.length === 0
    }] : [];

    return {
      date: dateStr,
      weights: processedWeights
    };
  });
};

const GraphSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.skeletonContainer, { backgroundColor: theme.secondaryBackground }]}>
      <View style={styles.skeletonChart}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[styles.skeletonText, { color: theme.secondaryText }]}>Loading weight data...</Text>
      </View>
    </View>
  );
};

export const WeightVisualization: React.FC<WeightVisualizationProps> = ({ weightData: rawWeightData, rangeDays, onEditRequest, dataVersion }) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  
  // Clear selected point when data changes
  React.useEffect(() => {
    setSelectedPoint(null);
  }, [dataVersion]);
  const [popoutPosition, setPopoutPosition] = useState({ x: 0, y: 0 });
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processedData, setProcessedData] = useState<ReturnType<typeof processWeightData>>([]);
  const { theme } = useTheme();

  useEffect(() => {
    console.log('[WeightVisualization] Processing weight data...');
    console.log('...[WeightVisualization] Raw data entries:', rawWeightData?.length || 0);
    console.log('...[WeightVisualization] Range days:', rangeDays);
    
    if (!rawWeightData || rawWeightData.length === 0) {
      console.log('[WeightVisualization] No weight data available, setting loading to false');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    console.log('[WeightVisualization] Starting data processing...');

    const timer = setTimeout(() => {
      const data = processWeightData(rawWeightData, rangeDays);
      console.log('[WeightVisualization] Data processing completed');
      console.log('...[WeightVisualization] Processed data entries:', data.length);
      console.log('...[WeightVisualization] Data range:', data[0]?.date, 'to', data[data.length - 1]?.date);
      setProcessedData(data);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [rawWeightData, rangeDays]);

  useEffect(() => {
    if (!isLoading && scrollViewRef.current) {
      console.log('[WeightVisualization] Scrolling to current date...');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isLoading]);

  if (!rawWeightData || rawWeightData.length === 0) {
    console.log('[WeightVisualization] Rendering empty state - no weight data available');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.emptyStateContainer, { backgroundColor: theme.secondaryBackground }]}>
          <Text style={[styles.emptyStateText, { color: theme.text }]}>
            No weight data available. Please select a child to view their weight data.
          </Text>
        </View>
      </View>
    );
  }

  console.log('[WeightVisualization] Rendering weight visualization with', processedData.length, 'processed entries');

  const handlePointPress = (evt: any, target: any) => {
    const nativeEvent = evt.nativeEvent || {};
    const { locationX, locationY } = nativeEvent;

    if (selectedPoint?.data?.x === target.datum.x) {
      setSelectedPoint(null);
    } else {
      setSelectedPoint({
        data: target.datum,
        position: {
          x: locationX - 8,
          y: locationY
        },
      });
    }
  };

  const handleBackgroundPress = () => {
    if (selectedPoint) {
      setSelectedPoint(null);
    }
  };

  const renderWeightGraph = () => {
    const desiredColumnsPerScreen = 7;
    const yAxisWidth = 42;
    const rightMargin = 25;
    const columnWidth = (screenWidth - yAxisWidth - rightMargin) / desiredColumnsPerScreen;
    const chartWidth = Math.max(screenWidth - yAxisWidth, (rangeDays * columnWidth) + rightMargin);

    // Calculate weight range for Y-axis
    const allWeights = processedData.flatMap(day => day.weights).filter(weight => weight !== null);
    
    let yDomain: [number, number];
    let yTickValues: number[];
    
    if (allWeights.length === 0) {
      // Default range if no data (0 to 6 lbs)
      yDomain = [0, 96]; // 6 lbs = 96 oz
      yTickValues = [0, 16, 32, 48, 64, 80, 96]; // Every 1 lb
    } else {
      const maxWeight = Math.max(...allWeights.map(w => w.totalOunces));
      const minWeight = Math.min(...allWeights.map(w => w.totalOunces));
      const weightRange = maxWeight - minWeight;
      
      // Add 10% padding above and below the data range
      const padding = Math.max(weightRange * 0.1, 16); // At least 1 lb padding
      yDomain = [
        Math.max(0, minWeight - padding), 
        maxWeight + padding
      ];
      
      // Generate tick values every 1 pound (16 ounces)
      const generatePoundTicks = (min: number, max: number) => {
        const minPounds = Math.floor(min / 16);
        const maxPounds = Math.ceil(max / 16);
        const ticks = [];
        for (let pounds = minPounds; pounds <= maxPounds; pounds++) {
          const ounces = pounds * 16;
          if (ounces >= min && ounces <= max) {
            ticks.push(ounces);
          }
        }
        return ticks.length > 1 ? ticks : [min, max];
      };
      
      // Generate half-pound tick values (every 8 ounces)
      const generateHalfPoundTicks = (min: number, max: number) => {
        const start = Math.ceil(min / 8) * 8;
        const end = Math.floor(max / 8) * 8;
        const ticks: number[] = [];
        for (let ounces = start; ounces <= end; ounces += 8) {
          // Skip whole pounds here; we already draw solid lines for those
          if (ounces % 16 !== 0) {
            ticks.push(ounces);
          }
        }
        return ticks;
      };
      
      yTickValues = generatePoundTicks(yDomain[0], yDomain[1]);
    }

    if (isLoading) {
      return <GraphSkeleton />;
    }

    // Flatten all weight data for the line chart, filtering out empty days
    const allWeightData = processedData.flatMap(day => day.weights).filter(weight => weight !== null);

    return (
      <View style={styles.graphWrapper}>
        <View style={[styles.yAxisContainer, { marginLeft: -8, backgroundColor: theme.secondaryBackground }]}>
          <VictoryAxis
            dependentAxis
            domain={yDomain}
            style={{
              tickLabels: { fontSize: 10, padding: 2, fill: theme.text },
              axis: { stroke: theme.text },
              grid: { stroke: theme.secondaryText, strokeWidth: 1 }
            }}
            tickValues={yTickValues}
            tickFormat={(t: number) => formatWeightForAxis(t)}
            containerComponent={<VictoryContainer responsive={false} />}
            width={yAxisWidth}
            height={300}
            padding={{ top: 20, bottom: 40, left: 35, right: 0 }}
          />
        </View>

        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={[styles.graphContainer, { backgroundColor: theme.secondaryBackground }]}
          >
             {(() => {
               const xDomain = processedData.length > 0
                 ? [
                     createLocalDateFromKey(processedData[0].date, 0),
                     createLocalDateFromKey(processedData[processedData.length - 1].date, 23)
                   ] as [Date, Date]
                 : null;

               return (
             <VictoryChart
               width={chartWidth}
               height={300}
               padding={{ top: 20, bottom: 40, left: 0, right: 0 }}
               domainPadding={{ x: columnWidth * 0.67 }}
               scale={{ y: "linear", x: "time" }}
               containerComponent={<VictoryContainer responsive={false} />}
               style={{
                 background: { fill: theme.secondaryBackground }
               }}
               domain={xDomain ? { x: xDomain, y: yDomain } : { y: yDomain }}
             >
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: { fill: "transparent" },
                  grid: { stroke: theme.secondaryText, strokeWidth: 1 }
                }}
                domain={yDomain}
                tickValues={yTickValues}
                padding={{ top: 20, bottom: 40, left: 0, right: 0 }}
              />

              {/* Half-pound dashed grid lines (8 oz increments) */}
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: { fill: "transparent" },
                  grid: { stroke: theme.secondaryText, strokeWidth: 1, strokeDasharray: "4,4", strokeOpacity: 0.6 }
                }}
                domain={yDomain}
                tickValues={(() => {
                  const start = Math.ceil(yDomain[0] / 8) * 8;
                  const end = Math.floor(yDomain[1] / 8) * 8;
                  const ticks: number[] = [];
                  for (let oz = start; oz <= end; oz += 8) {
                    if (oz % 16 !== 0) ticks.push(oz);
                  }
                  return ticks;
                })()}
                padding={{ top: 20, bottom: 40, left: 0, right: 0 }}
              />

              {/* Top border line to visually connect the y-axis */}
              <VictoryAxis
                orientation="top"
                style={{
                  axis: { stroke: theme.text },
                  tickLabels: { fill: "transparent" },
                  ticks: { stroke: "transparent" },
                  grid: { stroke: "transparent" }
                }}
              />

              {allWeightData.length > 0 && (
                <VictoryLine
                  data={allWeightData}
                  style={{
                    data: {
                      stroke: theme.tint,
                      strokeWidth: 3,
                      strokeOpacity: 0.8,
                    }
                  }}
                />
              )}

              {allWeightData.map((weight, index) => (
                <VictoryScatter
                  key={`${weight.x}-${index}`}
                  data={[weight]}
                  style={{
                    data: {
                      fill: weight.isCarriedOver ? theme.secondaryText : theme.tint,
                      stroke: selectedPoint?.data?.x === weight.x ? theme.background : 'transparent',
                      strokeWidth: selectedPoint?.data?.x === weight.x ? 3 : 0,
                      fillOpacity: weight.isCarriedOver ? 0.6 : 0.8,
                    }
                  }}
                  size={weight.isCarriedOver ? 4 : 6}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onPressIn: (evt) => handlePointPress(evt, { datum: weight })
                    }
                  }]}
                />
              ))}

               <VictoryAxis
                 tickValues={processedData.map(day => createLocalDateFromKey(day.date, 12))}
                 tickFormat={(date) => {
                   const d = new Date(date);
                   return `${d.getMonth() + 1}/${d.getDate()}`;
                 }}
                 style={{
                   tickLabels: { fontSize: 10, padding: 5, fill: theme.text },
                   axis: { stroke: theme.text }
                 }}
               />
            </VictoryChart>
               );
             })()}
          </ScrollView>
        </TouchableWithoutFeedback>
        {selectedPoint && (
          <PointPopout
            data={selectedPoint.data}
            onClose={() => setSelectedPoint(null)}
            position={selectedPoint.position}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.weightContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.graphTitle,{ color: theme.text, backgroundColor: theme.secondaryBackground }]}>Weight Data</Text>
      {renderWeightGraph()}
      
      <View>
        <Text style={[styles.listTitle, { color: theme.text, backgroundColor: theme.secondaryBackground }]}>Weight Entries</Text>
        {isLoading ? (
          <View style={[styles.loadingListContainer, { backgroundColor: theme.secondaryBackground }]}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Loading weight entries...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredWeightData(rawWeightData, rangeDays)}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.7} onPress={() => onEditRequest?.(item)}>
                <WeightEntry weight={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `weight-${index}`}
            style={[styles.weightList, { backgroundColor: theme.secondaryBackground }]}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weightContainer: {
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
  weightList: {
    flex: 1,
  },
  weightEntry: {
    padding: 12,
    borderBottomWidth: 1,
  },
  weightEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  weightDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  weightValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  weightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
  },
  totalOuncesText: {
    fontSize: 14,
    fontWeight: '500',
  },
  entriesList: {
    gap: 8,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  entryTime: {
    flex: 1,
    fontSize: 12,
  },
  entryWeight: {
    fontSize: 12,
    marginRight: 8,
    fontWeight: '600',
  },
  entryTotalOunces: {
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 4,
    textAlign: 'center',
  },
  popoutWeight: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  popoutTotalOunces: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  popoutTime: {
    fontSize: 11,
    textAlign: 'center',
  },
  popoutCarriedOver: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 2,
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

export default WeightVisualization; 