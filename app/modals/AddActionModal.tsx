import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';

interface AddActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSleepPress: () => void;
  onFeedPress: () => void;
  onDiaperPress: () => void;
  onActivityPress: () => void;
  onMilestonePress: () => void;
}

const AddActionModal = ({
  visible,
  onClose,
  onSleepPress,
  onFeedPress,
  onDiaperPress,
  onActivityPress,
  onMilestonePress,
}: AddActionModalProps) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Select Action Type"
      showCloseButton={false}
      maxHeight="100%"
    >
      <View style={styles.container}>
        <CustomButton
          title="Sleep"
          onPress={() => {
            onClose();
            onSleepPress();
            console.log("Sleep button pressed");
          }}
          variant="primary"
        />
        <CustomButton
          title="Feed"
          onPress={() => {
            onClose();
            onFeedPress();
            console.log("Feed button pressed");
          }}
          variant="primary"
        />
        <CustomButton
          title="Diaper"
          onPress={() => {
            onClose();
            onDiaperPress();
            console.log("Diaper button pressed");
          }}
          variant="primary"
        />
        <CustomButton
          title="Activity"
          onPress={() => {
            onClose();
            onActivityPress();
            console.log("Activity button pressed");
          }}
          variant="primary"
        />
        <CustomButton
          title="Milestone"
          onPress={() => {
            onClose();
            onMilestonePress();
            console.log("Milestone button pressed");
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

export default AddActionModal;