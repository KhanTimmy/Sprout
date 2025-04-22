import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SleepData } from '@/services/ChildService';

interface SleepGraphProps {
    data: SleepData[];
    rangeDays: number;
}

const getQualityColor = (quality: number) => {
    switch (quality) {
        case 5: return '#00c896'; // green
        case 4: return '#b5d900'; // green-yellow
        case 3: return '#ffd000'; // yellow
        case 2: return '#ff9900'; // orange
        case 1: return '#ff4d4d'; // red
        default: return '#ccc';   // fallback
    }
};

const generateDateRange = (data: SleepData[], rangeDays: number) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - rangeDays + 1); // inclusive of today
    const dateList = [];

    for (let i = 0; i < rangeDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Use local date string to match date range properly
        const localDate = currentDate.toLocaleDateString('en-CA'); // yyyy-mm-dd format (ISO-like format)

        const sleepData = data.find(sleep =>
            sleep.start.toLocaleDateString('en-CA') === localDate
        );

        dateList.push({ date: localDate, sleepData: sleepData || null });
    }

    return dateList; // The date list is in chronological order now
};

const SleepGraph = ({ data, rangeDays }: SleepGraphProps) => {
    const graphHeight = 200;
    const maxVisualDuration = 8 * 60;
    const scrollViewRef = useRef<ScrollView>(null);
    const dateRange = generateDateRange(data, rangeDays); // Oldest to newest

    useEffect(() => {
        // Scroll to the latest date whenever rangeDays changes
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: 9999, animated: false });
            }
        }, 100);
    }, [rangeDays]);

    return (
        <ScrollView
            horizontal
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.graphContainer}>
                {dateRange.map(({ date, sleepData }, index) => {
                    const duration = sleepData ? (sleepData.end.getTime() - sleepData.start.getTime()) / 60000 : 0;
                    const clampedDuration = sleepData ? Math.min(duration, maxVisualDuration) : 0;
                    const scaledHeight = sleepData ? Math.min((clampedDuration / maxVisualDuration) * graphHeight, graphHeight * 0.8) : 0;
                    const barColor = sleepData ? getQualityColor(sleepData.quality) : '#e0e0e0';

                    return (
                        <View key={index} style={styles.barContainer}>
                            <View style={[styles.bar, { height: graphHeight }]}>
                                {sleepData && (
                                    <View style={[styles.barFill, { height: scaledHeight, backgroundColor: barColor }]} />
                                )}
                                {sleepData && (
                                    <Text style={styles.durationLabel}>
                                        {Math.floor(duration / 60)}h {Math.floor(duration % 60)}m
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.monthLabel}>{new Date(date).toISOString().slice(5, 10)}</Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    graphContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 10,
        justifyContent: 'flex-start',
    },
    barContainer: {
        alignItems: 'center',
        marginHorizontal: 4,
    },
    bar: {
        width: 40,
        backgroundColor: '#ccc',
        borderRadius: 4,
        justifyContent: 'flex-end',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    monthLabel: {
        marginTop: 4,
        fontSize: 12,
        color: '#333',
    },
    durationLabel: {
        fontSize: 10,
        color: '#333',
        position: 'absolute',
        top: 2,
        bottom: -20,
    },
});

export default SleepGraph;
