import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import { ChildData } from '@/services/ChildService';
import Colors from '@/constants/Colors';
import ThemedDropdown from '@/components/ThemedDropdown';

interface ChildSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  childrenList: ChildData[];
  selectedChild: ChildData | null;
  onSelectChild: (child: ChildData) => void;
  onClearSelection: () => void;
}

const ChildSelectionModal = ({
  visible,
  onClose,
  childrenList,
  selectedChild,
  onSelectChild,
  onClearSelection,
}: ChildSelectionModalProps) => {
  const dropdownData = childrenList.map((child) => ({
    label: `${child.first_name} ${child.last_name} (${child.type})`,
    value: child.id,
  }));

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Select a Child"
      showCloseButton={false}
      maxHeight="75%"
    >
      <View style={styles.container}>
        <CustomButton
          title="Add Child"
          onPress={() => {
              onClose();
              router.push('/addchild');
          }}
          variant="primary"
        />

        {childrenList.length > 0 ? (
          <ThemedDropdown
            data={dropdownData}
            value={selectedChild?.id || null}
            onValueChange={(val: string | number) => {
              const selected = childrenList.find((child) => child.id === String(val));
              if (selected) onSelectChild(selected);
            }}
            placeholder="Select a child"
          />
        ) : (
          <Text style={[styles.noChildrenText, { color: theme.text }]}>
            No children found. Add a child to get started.
          </Text>
        )}

        <View style={styles.buttonContainer}>
          {childrenList.length > 0 && selectedChild && (
            <CustomButton
              title="Clear Selection"
              onPress={onClearSelection}
              variant="secondary"
              style={styles.button}
            />
          )}
          <CustomButton
            title="Close"
            onPress={onClose}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
  },
  noChildrenText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 10,
  },
  button: {
    width: '100%',
  },
});

export default ChildSelectionModal;
