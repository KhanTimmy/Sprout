import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SelectList } from 'react-native-dropdown-select-list';
import { DiaperData } from '@/services/ChildService';

interface DiaperModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (diaperData: DiaperData) => Promise<void>;
  childId: string | undefined; 
}

const DiaperModal = ({
  visible,
  onClose,
  onSave,
  childId,
}: DiaperModalProps) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [type, setType] = useState('');
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const data = [
    {key:'1', value:'pee'},
    {key:'2', value:'poo'},
    {key:'3', value:'mixed'},
    {key:'4', value:'dry'},
  ];

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    if (!type) {
      Alert.alert('Error', 'Please select diaper type');
      return;
    }

    try {
      const diaperData: DiaperData = {
        id: childId,
        dateTime: dateTime,
        type: type,
      };
      
      await onSave(diaperData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving diaper data:', error);
      Alert.alert('Error', 'Could not save diaper data');
    }
  };

  const resetForm = () => {
    setDateTime(new Date());
    setType('');
  };

  return (
    <CustomModal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Input Diaper Data"
      showCloseButton={false}
    >
      <View style={styles.container}>
        <View style={styles.dateTimeSection}>
          <Text style={styles.label}>Date & Time:</Text>
          <Text style={styles.timeDisplay}>
            {dateTime.toLocaleString()}
          </Text>
          <CustomButton 
            title="Select Date & Time" 
            onPress={() => setDatePickerVisibility(true)}
            variant="secondary"
          />
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={(date) => {
            setDateTime(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <View style={styles.typeSection}>
          <Text style={styles.label}>Diaper Type:</Text>
            <SelectList
            setSelected={(val: any) => setType(val)}
            data={data}
            save="value"
            placeholder='Select diaper type'
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
            search={false}
            />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Save"
            onPress={handleSave}
            variant="success"
            style={styles.button}
          />
          <CustomButton
            title="Cancel"
            onPress={() => {
              resetForm();
              onClose();
            }}
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
    gap: 15,
  },
  dateTimeSection: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timeDisplay: {
    fontSize: 16,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  typeSection: {
    marginVertical: 10,
  },
  selectBox: {
    borderColor: '#cccccc',
    marginTop: 5,
  },
  dropdown: {
    borderColor: '#cccccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default DiaperModal;