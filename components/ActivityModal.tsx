import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSleepPress: () => void;
  onFeedPress: () => void;
  onDiaperPress: () => void;
}

const ActivityModal = ({
  visible,
  onClose,
  onSleepPress,
  onFeedPress,
  onDiaperPress,
}: ActivityModalProps) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Select Activity Type"
    >
      <View style={styles.container}>
        <CustomButton
          title="Sleep"
          onPress={() => {
            onClose();
            onSleepPress();
          }}
          variant="primary"
        />
        <CustomButton
          title="Feed"
          onPress={() => {
            onClose();
            onFeedPress();
          }}
          variant="primary"
        />
        <CustomButton
          title="Diaper Change"
          onPress={() => {
            onClose();
            onDiaperPress();
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

export default ActivityModal;