import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TextInput } from 'react-native';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import RadioButton from '@/components/RadioButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, NewChildData } from '@/services/ChildService';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Import the date-time picker

export default function AddChild() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // State to control the modal visibility
  const { saveSelectedChild } = useSelectedChild();

  const validateDob = (dob: string) => {
    if (!dob) {
      return 'Date of Birth is required';
    }
    return '';
  };

  const saveChild = async () => {
    const dobValidationError = validateDob(dob);
    if (dobValidationError) {
      Alert.alert('Invalid Date of Birth', dobValidationError);
      return;
    }

    try {
      const childData: NewChildData = {
        first_name: firstName,
        last_name: lastName,
        dob: dob,
        sex: sex,
      };

      const newChild = await ChildService.addChild(childData);
      
      // Save this child as the selected child
      await saveSelectedChild(newChild);
      
      Alert.alert('Success', 'Child added successfully!');
      router.back();
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Error adding child. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Child</Text>
      
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      
      {/* Date of Birth (DOB) Section */}
      <CustomButton
        title={dob ? `Date of Birth: ${dob}` : "Select Date of Birth"}
        onPress={() => setDatePickerVisibility(true)} // Show the date picker
        variant="secondary"
        style={styles.input} // Use the same styling for consistency
      />

      {/* Sex Selection */}
      <Text style={styles.radioLabel}>Sex</Text>
      <View style={styles.radioGroup}>
        <RadioButton
          label="Male"
          selected={sex === 'male'}
          onPress={() => setSex('male')}
          labelPosition="right"
        />
        <RadioButton
          label="Female"
          selected={sex === 'female'}
          onPress={() => setSex('female')}
          labelPosition="right"
        />
      </View>

      <CustomButton 
        title="Save Child" 
        onPress={saveChild} 
        variant="success"
      />
      
      <CustomButton 
        title="Cancel" 
        onPress={() => router.back()} 
        variant="danger"
      />

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          const formattedDate = new Date(date).toLocaleDateString('en-CA'); // Format the date as YYYY-MM-DD
          setDob(formattedDate); // Set the date
          setDatePickerVisibility(false); // Hide the date picker after selection
        }}
        onCancel={() => setDatePickerVisibility(false)} // Hide the date picker if canceled
        maximumDate={new Date()} // Limit date selection to today or earlier
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
});
