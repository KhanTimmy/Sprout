import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput } from 'react-native';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SelectList } from 'react-native-dropdown-select-list';
import { FeedData } from '@/services/ChildService';

interface FeedModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (feedData: FeedData) => Promise<void>;
  childId: string | undefined;
}

const FeedModal = ({
  visible,
  onClose,
  onSave,
  childId,
}: FeedModalProps) => {
  const [amount, setAmount] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [feedType, setFeedType] = useState('');
  const [side, setSide] = useState('');
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const feedTypeData = [
    {key:'1', value:'nursing'},
    {key:'2', value:'bottle'},
    {key:'3', value:'solid'},
  ];

  const sideData = [
    {key:'1', value:'left'},
    {key:'2', value:'right'},
  ];

  const handleSave = async () => {
    const amountNumber = parseFloat(amount);

    if ((feedType === 'bottle' || feedType === 'solid') && (isNaN(amountNumber) || amountNumber <= 0)) {
    Alert.alert('Error', 'Please enter a valid amount');
    return;
    }
    
    if (!childId) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    if (!feedType) {
      Alert.alert('Error', 'Please select feed type');
      return;
    }

    if (feedType === 'nursing' && !side) {
      Alert.alert('Error', 'Please select nursing side');
      return;
    }

    // Validate duration is a number
    const durationNumber = parseInt(duration);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    try {
      const feedData: FeedData = {
        id: childId,
        amount: (feedType === 'bottle' || feedType === 'solid') ? amountNumber : 0,
        dateTime: dateTime,
        description: description,
        duration: durationNumber,
        notes: notes,
        type: feedType as 'nursing' | 'bottle' | 'solid',
        ...(feedType === 'nursing' ? { side } : {})
      };
      
      // Only add side if feed type is nursing
      if (feedType === 'nursing') {
        feedData.side = side;
      }
      
      await onSave(feedData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving feed data:', error);
      Alert.alert('Error', 'Could not save feed data');
    }
  };

  const resetForm = () => {
    setDateTime(new Date());
    setDescription('');
    setDuration('');
    setNotes('');
    setFeedType('');
    setSide('');
  };

  return (
    <CustomModal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Input Feeding Data"
      showCloseButton={false}
      maxHeight="100%"
    >
      <View style={styles.container}>
        <View style={styles.timeSection}>
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
          date={new Date()}
          onConfirm={(date) => {
            setDateTime(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <View style={styles.inputSection}>
          <Text style={styles.label}>Feed Type:</Text>
          <SelectList
            setSelected={(val: string) => {
              setFeedType(val);
              // Reset side if not nursing
              if (val !== 'nursing') {
                setSide('');
              }
            }}
            data={feedTypeData}
            save="value"
            placeholder='Select feed type'
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
            search={false}
          />
        </View>

        {feedType === 'nursing' && (
          <View style={styles.inputSection}>
            <Text style={styles.label}>Side:</Text>
            <SelectList
              setSelected={(val: string) => setSide(val)}
              data={sideData}
              save="value"
              placeholder='Select side'
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdown}
              search={false}
            />
          </View>
        )}

        {(feedType === 'bottle' || feedType === 'solid') && (
        <View style={styles.inputSection}>
            <Text style={styles.label}>Amount (oz or g):</Text>
            <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            />
        </View>
        )}

        <View style={styles.inputSection}>
          <Text style={styles.label}>Duration (minutes):</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="Enter duration in minutes"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Notes:</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter additional notes"
            multiline={true}
            numberOfLines={3}
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
    gap: 10,
  },
  timeSection: {
    marginBottom: 10,
  },
  inputSection: {
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
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
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
    marginTop: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default FeedModal;