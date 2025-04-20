import React from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { MilestoneData } from '@/services/ChildService';

interface ViewMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  milestones: MilestoneData[];
  loading: boolean;
}

const ViewMilestonesModal = ({ visible, onClose, milestones, loading }: ViewMilestoneModalProps) => {
  // Sort activities by date in descending order (most recent first)
  const sortedMilestones = [...milestones].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

  // Render item for FlatList
  const renderMilestoneItem = ({ item }: { item: MilestoneData }) => (
    <View style={styles.milestoneItem}>
      <Text style={styles.milestoneDateTime}>{item.dateTime.toLocaleString()}</Text>
      <Text style={styles.milestoneType}>Type: {item.type}</Text>
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
          <Text style={styles.modalTitle}>Milestone History</Text>
          <CustomButton
            title="Close"
            onPress={onClose}
            variant="primary"
            style={styles.closeButton}
          />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading milestones...</Text>
        ) : sortedMilestones.length === 0 ? (
          <Text style={styles.noDataText}>No milestone data available</Text>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={sortedMilestones}
              renderItem={renderMilestoneItem}
              keyExtractor={(_, index) => `milestone-${index}`}
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
  milestoneItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  milestoneDateTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  milestoneType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  milestoneDetail: {
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

export default ViewMilestonesModal; 