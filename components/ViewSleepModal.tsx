import React from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList } from 'react-native';
import CustomButton from './CustomButton';
import { SleepData } from '@/services/ChildService';

interface ViewSleepModalProps {
    visible: boolean;
    onClose: () => void;
    sleeps: SleepData[];
    loading: boolean;
}

const ViewSleepModal = ({ visible, onClose, sleeps, loading }: ViewSleepModalProps) => {
    // Render item for FlatList
    const renderSleepItem = ({ item }: { item: SleepData }) => {
        // Calculate duration in hours and minutes
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
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sleep History</Text>
                    <CustomButton
                        title="Close"
                        onPress={onClose}
                        variant="primary"
                        style={styles.closeButton}
                    />
                </View> 

                {loading ? (
                    <Text style={styles.loadingText}>Loading sleep data...</Text>
                ) : sleeps.length === 0 ? (
                    <Text style={styles.noDataText}>No sleep data available</Text>
                ) : (
                    <View style={styles.listContainer}>
                        <FlatList
                            data={sleeps}
                            renderItem={renderSleepItem}
                            keyExtractor={(_, index) => `sleep-${index}`}
                            contentContainerStyle={styles.listContent}
                        />
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
        padding: 10,
    },
    sleepItem: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    sleepTime: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    sleepDuration: {
        fontSize: 16,
        marginBottom: 5,
    },  
    sleepQuality: {
        fontSize: 16,
        color: '#666',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        padding: 10,
    },
    closeButton: {
        width: 100,
    },
});

export default ViewSleepModal;


