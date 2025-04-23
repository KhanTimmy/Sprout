import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import { ChildData } from '@/services/ChildService';
import { SelectList } from 'react-native-dropdown-select-list';

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
    key: child.id,
    value: `${child.first_name} ${child.last_name} (${child.type})`,
  }));

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Select a Child"
      showCloseButton={false}
      maxHeight="100%"
    >
      <View style={styles.container}>
        <CustomButton
          title="Add Child"
          onPress={() => {
              onClose();
              router.push('/addchild');
          }}
          variant="primary"
          style={styles.addChildButton}
        />

        {childrenList.length > 0 ? (
          <SelectList
            setSelected={(id: string) => {
              const selected = childrenList.find((child) => child.id === id);
              if (selected) onSelectChild(selected);
            }}
            data={dropdownData}
            save="key"
            placeholder="Select a child"
            search={false}
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
            defaultOption={
              selectedChild
                ? {
                    key: selectedChild.id,
                    value: `${selectedChild.first_name} ${selectedChild.last_name} (${selectedChild.type})`,
                  }
                : undefined
            }
          />
        ) : (
          <Text style={styles.noChildrenText}>No children found</Text>
        )}

        <View style={styles.buttonContainer}>
          {childrenList.length > 0 && (
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
  },
  addChildButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  addChildButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noChildrenText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  selectBox: {
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ChildSelectionModal;
