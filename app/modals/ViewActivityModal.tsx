import React from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { ActivityData } from '@/services/ChildService';

interface ViewActivityModalProps {
  visible: boolean;
  onClose: () => void;
  activities: ActivityData[];
  loading: boolean;
}

const ViewActivityModal = ({ visible, onClose, activities, loading }: ViewActivityModalProps) => {
  // Sort activities by date in descending order (most recent first)
  const sortedActivities = [...activities].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

  // Render item for FlatList
  const renderActivityItem = ({ item }: { item: ActivityData }) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityDateTime}>{item.dateTime.toLocaleString()}</Text>
      <Text style={styles.activityType}>Type: {item.type}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Activity History</Text>
          <CustomButton
            title="Close"
            onPress={onClose}
            variant="primary"
            style={styles.closeButton}
          />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading activities...</Text>
        ) : sortedActivities.length === 0 ? (
          <Text style={styles.noDataText}>No activity data available</Text>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={sortedActivities}
              renderItem={renderActivityItem}
              keyExtractor={(_, index) => `activity-${index}`}
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
  activityItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activityDateTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  activityDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
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

export default ViewActivityModal; 