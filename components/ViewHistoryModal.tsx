import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';

interface ViewHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onViewSleep: () => void;
  onViewFeedings: () => void;
  onViewDiapers: () => void;
}

const ViewHistoryModal = ({
  visible,
  onClose,
  onViewSleep,
  onViewFeedings,
  onViewDiapers,
}: ViewHistoryModalProps) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="View History"
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
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
});

export default ViewHistoryModal; 