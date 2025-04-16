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
  childId 
}: DiaperModalProps) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [diaperType, setDiaperType] = useState('');
  const [peeAmount, setPeeAmount] = useState('');
  const [pooAmount, setPooAmount] = useState('');
  const [pooColor, setPooColor] = useState('');
  const [pooConsistency, setPooConsistency] = useState('');
  const [hasRash, setHasRash] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const diaperTypeData = [
    { key: '1', value: 'pee' },
    { key: '2', value: 'poo' },
    { key: '3', value: 'mixed' },
    { key: '4', value: 'dry' },
  ];

  const amountData = [
    { key: '1', value: 'little' },
    { key: '2', value: 'medium' },
    { key: '3', value: 'big' },
  ];

  const colorData = [
    { key: '1', value: 'yellow' },
    { key: '2', value: 'brown' },
    { key: '3', value: 'black' },
    { key: '4', value: 'green' },
    { key: '5', value: 'red' },
  ];

  const consistencyData = [
    { key: '1', value: 'solid' },
    { key: '2', value: 'loose' },
    { key: '3', value: 'runny' },
    { key: '4', value: 'mucousy' },
    { key: '5', value: 'hard' },
    { key: '6', value: 'pebbles' },
    { key: '7', value: 'diarrhea' },
  ];

  const handleSave = async () => {
    if (!childId) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    if (!diaperType) {
      Alert.alert('Error', 'Please select a diaper type');
      return;
    }

    if (diaperType === 'pee' && !peeAmount) {
      Alert.alert('Error', 'Please select pee amount');
      return;
    }

    if (diaperType === 'poo' && (!pooAmount || !pooColor || !pooConsistency)) {
      Alert.alert('Error', 'Please fill in all poo details');
      return;
    }

    if (diaperType === 'mixed' && (!peeAmount || !pooAmount || !pooColor || !pooConsistency)) {
      Alert.alert('Error', 'Please fill in all details for mixed diaper');
      return;
    }

    try {
      const diaperData: DiaperData = {
        id: childId,
        dateTime,
        type: diaperType as 'pee' | 'poo' | 'mixed' | 'dry',
        ...(diaperType === 'pee' || diaperType === 'mixed' ? { peeAmount } : {}),
        ...(diaperType === 'poo' || diaperType === 'mixed' ? { pooAmount, pooColor, pooConsistency } : {}),
        hasRash,
      };

      if (diaperType === 'pee' || diaperType === 'mixed') {
        diaperData.peeAmount = peeAmount;
      }

      if (diaperType === 'poo' || diaperType === 'mixed') {
        diaperData.pooAmount = pooAmount;
        diaperData.pooColor = pooColor;
        diaperData.pooConsistency = pooConsistency;
      }

      await onSave(diaperData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving diaper data:', error);
      Alert.alert('Error', 'Failed to save diaper data');
    }
  };

  const resetForm = () => {
    setDateTime(new Date());
    setDiaperType('');
    setPeeAmount('');
    setPooAmount('');
    setPooColor('');
    setPooConsistency('');
    setHasRash(false);
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
          <Text style={styles.label}>Date and Time:</Text>
          <Text style={styles.timeDisplay}>
            {dateTime.toLocaleString()}
          </Text>
          <CustomButton 
            title="Select Date and Time" 
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
            setSelected={(val: string) => {
              setDiaperType(val);
              // reset nonapplicable values for diaper change types
              if (val === 'dry') {
                setPeeAmount('');
                setPooAmount('');
                setPooColor('');
                setPooConsistency('');
              } else if (val === 'pee') {
                setPooAmount('');
                setPooColor('');
                setPooConsistency('');
              } else if (val === 'poo') {
                setPeeAmount('');
              }
            }}
            data={diaperTypeData}
            save="value"
            placeholder="Select diaper type"
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
            search={false}
          />
        </View>

        {(diaperType === 'pee' || diaperType === 'mixed') && (
          <View style={styles.section}>
            <Text style={styles.label}>Pee Amount:</Text>
            <SelectList
              setSelected={(val: string) => setPeeAmount(val)}
              data={amountData}
              save="value"
              placeholder="Select pee amount"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdown}
              search={false}
            />
          </View>
        )}

        {(diaperType === 'poo' || diaperType === 'mixed') && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Poo Amount:</Text>
              <SelectList
                setSelected={(val: string) => setPooAmount(val)}
                data={amountData}
                save="value"
                placeholder="Select poo amount"
                boxStyles={styles.selectBox}
                dropdownStyles={styles.dropdown}
                search={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Poo Color:</Text>
              <SelectList
                setSelected={(val: string) => setPooColor(val)}
                data={colorData}
                save="value"
                placeholder="Select poo color"
                boxStyles={styles.selectBox}
                dropdownStyles={styles.dropdown}
                search={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Poo Consistency:</Text>
              <SelectList
                setSelected={(val: string) => setPooConsistency(val)}
                data={consistencyData}
                save="value"
                placeholder="Select poo consistency"
                boxStyles={styles.selectBox}
                dropdownStyles={styles.dropdown}
                search={false}
              />
            </View>
          </>
        )}

        <View style={styles.rashSection}>
          <Text style={styles.label}>Diaper Rash:</Text>
          <View style={styles.rashButtons}>
            <CustomButton
              title="Yes"
              onPress={() => setHasRash(true)}
              variant={hasRash ? "success" : "secondary"}
              style={styles.rashButton}
            />
            <CustomButton
              title="No"
              onPress={() => setHasRash(false)}
              variant={!hasRash ? "success" : "secondary"}
              style={styles.rashButton}
            />
          </View>
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
  typeSection: {
    marginVertical: 10,
  },
  section: {
    marginVertical: 10,
  },
  rashSection: {
    marginVertical: 10,
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
  selectBox: {
    borderColor: '#cccccc',
    marginTop: 5,
  },
  dropdown: {
    borderColor: '#cccccc',
  },
  rashButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  rashButton: {
    flex: 1,
    marginHorizontal: 5,
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