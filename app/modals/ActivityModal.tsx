import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SelectList } from 'react-native-dropdown-select-list';
import { ActivityData } from '@/services/ChildService';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (activityData: ActivityData) => Promise<void>;
  childId: string | undefined; 
}

const ActivityModal = ({
  visible,
  onClose,
  onSave,
  childId,
}: ActivityModalProps) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [type, setType] = useState('');
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const data = [
    {key:'1', value:'bath'},
    {key:'2', value:'tummy time'},
    {key:'3', value:'story time'},
    {key:'4', value:'skin to skin'},
    {key:'5', value:'brush teeth'},
  ];

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    if (!type) {
      Alert.alert('Error', 'Please select activity type');
      return;
    }

    try {
      const activityData: ActivityData = {
        id: childId,
        dateTime: dateTime,
        type: type,
      };
      
      await onSave(activityData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving activity data:', error);
      Alert.alert('Error', 'Could not save activity data');
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
      title="Input Activity Data"
      showCloseButton={false}
      maxHeight="100%"
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
          date={new Date()}
          onConfirm={(date) => {
            setDateTime(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <View style={styles.typeSection}>
          <Text style={styles.label}>Activity Type:</Text>
            <SelectList
            setSelected={(val: any) => setType(val)}
            data={data}
            save="value"
            placeholder='Select activity type'
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

export default ActivityModal;