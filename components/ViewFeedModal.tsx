import React from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList } from 'react-native';
import CustomButton from './CustomButton';
import { FeedData } from '@/services/ChildService';

interface ViewFeedModalProps {
  visible: boolean;
  onClose: () => void;
  feedings: FeedData[];
  loading: boolean;
}

const ViewFeedModal = ({ visible, onClose, feedings, loading }: ViewFeedModalProps) => {
  // Render item for FlatList
  const renderFeedItem = ({ item }: { item: FeedData }) => (
    <View style={styles.feedItem}>
      <Text style={styles.feedType}>{item.type}</Text>
      <Text style={styles.feedDateTime}>{item.dateTime.toLocaleString()}</Text>
      <Text style={styles.feedAmount}>Amount: {item.amount} {item.type === 'nursing' ? 'minutes' : 'oz'}</Text>
      {item.type === 'nursing' && item.side && (
        <Text style={styles.feedSide}>Side: {item.side}</Text>
      )}
      {item.notes && <Text style={styles.feedNotes}>Notes: {item.notes}</Text>}
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
          <Text style={styles.modalTitle}>Feeding History</Text>
          <CustomButton
            title="Close"
            onPress={onClose}
            variant="primary"
            style={styles.closeButton}
          />
        </View>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading feedings...</Text>
        ) : feedings.length === 0 ? (
          <Text style={styles.noDataText}>No feeding data available</Text>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={feedings}
              renderItem={renderFeedItem}
              keyExtractor={(item: FeedData) => `${item.id}-${item.dateTime.getTime()}`}
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
  feedItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  feedType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  feedDateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  feedAmount: {
    fontSize: 16,
    marginBottom: 5,
  },
  feedNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  feedSide: {
    fontSize: 16,
    marginBottom: 5,
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

export default ViewFeedModal;
