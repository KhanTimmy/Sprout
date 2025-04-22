import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, SafeAreaView,
    ScrollView, TouchableOpacity, FlatList
} from 'react-native';
import CustomButton from '@/components/CustomButton';
import { SleepData } from '@/services/ChildService';
import SleepGraph from '@/components/SleepGraph';

interface ViewSleepModalProps {
    visible: boolean;
    onClose: () => void;
    sleeps: SleepData[];
    loading: boolean;
}

const timeRanges = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '60D', days: 60 },
    { label: '90D', days: 90 }
];

const ViewSleepModal = ({ visible, onClose, sleeps = [], loading }: ViewSleepModalProps) => {
    const [selectedRange, setSelectedRange] = useState(7);

    const filterDataByRange = (days: number) => {
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);

        return sleeps
            .filter(sleep => sleep.start >= startDate && sleep.start <= now)
            .sort((a, b) => b.start.getTime() - a.start.getTime());
    };

    const filteredSleepData = filterDataByRange(selectedRange);

    const renderSleepItem = ({ item }: { item: SleepData }) => {
        const durationMs = item.end.getTime() - item.start.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        return (
            <View style={styles.sleepItem}>
                <Text style={styles.sleepTime}>
                    {item.start.toLocaleString()} - {item.end.toLocaleString()}
                </Text>
                <Text style={styles.sleepDuration}>
                    Duration: {durationHours}h {durationMinutes}m
                </Text>
                <Text style={styles.sleepQuality}>
                    Quality: {item.quality}/5
                </Text>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sleep History</Text>
                    <CustomButton title="Close" onPress={onClose} variant="primary" style={styles.closeButton} />
                </View>
    
                {/* Keep SleepGraph static */}
                <View style={styles.graphContainer}>
                    <SleepGraph data={filteredSleepData} rangeDays={selectedRange} />
                </View>
    
                <View style={styles.rangeSelector}>
                    {timeRanges.map(range => (
                        <TouchableOpacity
                            key={range.label}
                            onPress={() => setSelectedRange(range.days)}
                            style={[
                                styles.rangeButton,
                                selectedRange === range.days && styles.activeRangeButton
                            ]}
                        >
                            <Text
                                style={[
                                    styles.rangeText,
                                    selectedRange === range.days && styles.activeRangeText
                                ]}
                            >
                                {range.label}
                            </Text>
                            </TouchableOpacity>
                    ))}
                </View>
    
                {/* Use FlatList directly without ScrollView */}
                {loading ? (
                    <Text style={styles.loadingText}>Loading sleep data...</Text>
                ) : filteredSleepData.length === 0 ? (
                    <Text style={styles.noDataText}>No sleep data available for this time range</Text>
                ) : (
                    <FlatList
                        data={filteredSleepData}
                        renderItem={renderSleepItem}
                        keyExtractor={(item, index) => item.id || `sleep-${index}`}
                        contentContainerStyle={styles.listContent}
                        style={{ flex: 1 }} // Ensures it takes full space
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
    
};

const styles = StyleSheet.create({
    listContainer: { 
        flexGrow: 1 
    },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: { fontSize: 24, fontWeight: 'bold' },
    closeButton: { width: 100 },
    rangeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    rangeButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginHorizontal: 6,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeRangeButton: {
        backgroundColor: '#00c896',
    },
    rangeText: { color: '#333' },
    activeRangeText: { color: '#fff', fontWeight: 'bold' },
    sleepItem: {
        padding: 10,
        marginVertical: 4,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    sleepTime: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
    sleepDuration: { fontSize: 14, marginBottom: 5 },
    sleepQuality: { fontSize: 14, color: '#666' },
    loadingText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
    noDataText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
    listContent: { padding: 10 },
});

export default ViewSleepModal;
