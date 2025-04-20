import React from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { DiaperData } from '@/services/ChildService';

interface ViewDiaperModalProps {
  visible: boolean;
  onClose: () => void;
  diapers: DiaperData[];
  loading: boolean;
}

const ViewDiaperModal = ({ visible, onClose, diapers, loading }: ViewDiaperModalProps) => {
  // Sort diapers by date in descending order (most recent first)
  const sortedDiapers = [...diapers].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

  // Render item for FlatList
  const renderDiaperItem = ({ item }: { item: DiaperData }) => (
    <View style={styles.diaperItem}>
      <Text style={styles.diaperDateTime}>{item.dateTime.toLocaleString()}</Text>
      <Text style={styles.diaperType}>Type: {item.type}</Text>
      {item.peeAmount && <Text style={styles.diaperDetail}>Pee Amount: {item.peeAmount}</Text>}
      {item.pooAmount && <Text style={styles.diaperDetail}>Poo Amount: {item.pooAmount}</Text>}
      {item.pooColor && <Text style={styles.diaperDetail}>Poo Color: {item.pooColor}</Text>}
      {item.pooConsistency && <Text style={styles.diaperDetail}>Poo Consistency: {item.pooConsistency}</Text>}
      <Text style={styles.diaperDetail}>Rash: {item.hasRash ? 'Yes' : 'No'}</Text>
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
          <Text style={styles.modalTitle}>Diaper Change History</Text>
          <CustomButton
            title="Close"
            onPress={onClose}
            variant="primary"
            style={styles.closeButton}
          />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading diaper changes...</Text>
        ) : sortedDiapers.length === 0 ? (
          <Text style={styles.noDataText}>No diaper change data available</Text>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={sortedDiapers}
              renderItem={renderDiaperItem}
              keyExtractor={(_, index) => `diaper-${index}`}
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
  diaperItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  diaperDateTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  diaperType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  diaperDetail: {
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

export default ViewDiaperModal; 