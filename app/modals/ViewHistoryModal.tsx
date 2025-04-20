import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';

interface ViewHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onViewSleep: () => void;
  onViewFeedings: () => void;
  onViewDiapers: () => void;
  onViewActivities: () => void;
  onViewMilestones: () => void;
}

const ViewHistoryModal = ({
  visible,
  onClose,
  onViewSleep,
  onViewFeedings,
  onViewDiapers,
  onViewActivities,
  onViewMilestones,
}: ViewHistoryModalProps) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="View History"
      showCloseButton={false}
      maxHeight="100%"
    >
      <View style={styles.container}>
        <CustomButton
          title="Sleep History"
          onPress={() => {
            onClose();
            onViewSleep();
          }}
          variant="primary"
        />
        <CustomButton
          title="Feeding History"
          onPress={() => {
            onClose();
            onViewFeedings();
          }}
          variant="primary"
        />
        <CustomButton
          title="Diaper History"
          onPress={() => {
            onClose();
            onViewDiapers();
          }}
          variant="primary"
        />
        <CustomButton
          title="Activities History"
          onPress={() => {
            onClose();
            onViewActivities();
          }}
          variant="primary"
        />
        <CustomButton
          title="Milestone History"
          onPress={() => {
            onClose();
            onViewMilestones();
          }}
          variant="primary"
        />
        <CustomButton
          title="Cancel"
          onPress={onClose}
          variant="primary"
          style={styles.closeButton}
        />
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
  closeButton: {
    marginTop: 15,
  },
});

export default ViewHistoryModal; 