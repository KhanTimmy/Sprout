import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SelectList } from 'react-native-dropdown-select-list';
import { SleepData } from '@/services/ChildService';

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (sleepData: SleepData) => Promise<void>;
  childId: string | undefined; 
}

const SleepModal = ({
  visible,
  onClose,
  onSave,
  childId,
}: SleepModalProps) => {
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [quality, setQuality] = useState<number>(0);
  
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);

  const data = [
    {key:'1', value:1},
    {key:'2', value:2},
    {key:'3', value:3},
    {key:'4', value:4},
    {key:'5', value:5},
  ];

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    if (quality === 0) {
      Alert.alert('Error', 'Please select sleep quality');
      return;
    }

    if (startDateTime >= endDateTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    try {
      const sleepData: SleepData = {
        id: childId,
        start: startDateTime,
        end: endDateTime,
        quality: quality,
      };
      
      await onSave(sleepData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving sleep data:', error);
      Alert.alert('Error', 'Could not save sleep data');
    }
  };

  const resetForm = () => {
    setStartDateTime(new Date());
    setEndDateTime(new Date());
    setQuality(0);
  };

  return (
    <CustomModal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Input Sleep Data"
      showCloseButton={false}
    >
      <View style={styles.container}>
        <View style={styles.timeSection}>
          <Text style={styles.label}>Start Time:</Text>
          <Text style={styles.timeDisplay}>
            {startDateTime.toLocaleString()}
          </Text>
          <CustomButton 
            title="Select Start Time" 
            onPress={() => setStartPickerVisibility(true)}
            variant="secondary"
          />
        </View>

        <DateTimePickerModal
          isVisible={isStartPickerVisible}
          mode="datetime"
          onConfirm={(date) => {
            setStartDateTime(date);
            setStartPickerVisibility(false);
          }}
          onCancel={() => setStartPickerVisibility(false)}
        />

        <View style={styles.timeSection}>
          <Text style={styles.label}>End Time:</Text>
          <Text style={styles.timeDisplay}>
            {endDateTime.toLocaleString()}
          </Text>
          <CustomButton 
            title="Select End Time" 
            onPress={() => setEndPickerVisibility(true)}
            variant="secondary"
          />
        </View>

        <DateTimePickerModal
          isVisible={isEndPickerVisible}
          mode="datetime"
          onConfirm={(date) => {
            setEndDateTime(date);
            setEndPickerVisibility(false);
          }}
          onCancel={() => setEndPickerVisibility(false)}
        />

        <View style={styles.qualitySection}>
          <Text style={styles.label}>Sleep Quality:</Text>
          <SelectList
            setSelected={(val: any) => setQuality(val)}
            data={data}
            save="value"
            placeholder='Sleep Quality (1-5)'
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
            search={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title='Save'
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
            variant='primary'
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
  timeSection: {
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
  qualitySection: {
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

export default SleepModal;