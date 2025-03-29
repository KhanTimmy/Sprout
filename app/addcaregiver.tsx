import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, StyleSheet, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';

export default function AddCaregiver() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCaregiver = async () => {
    setLoading(true);
    try {
      // Fetch currently selected child from AsyncStorage
      const savedChild = await AsyncStorage.getItem('selectedChild');
      if (!savedChild) {
        Alert.alert('Error', 'No selected child found.');
        setLoading(false);
        return;
      }

      const childData = JSON.parse(savedChild);

      if (!childData.id) {
        Alert.alert('Error', 'Selected child has no ID.');
        setLoading(false);
        return;
      }

      // Update the authorized_uid array in Firestore
      const childDocRef = doc(db, 'children', childData.id);
      await updateDoc(childDocRef, {
        authorized_uid: arrayUnion(email.toLowerCase()),
      });

      Alert.alert('Success', 'Caregiver added successfully.');
      router.back();
    } catch (error) {
      console.error('Error adding caregiver:', error);
      Alert.alert('Error', 'Failed to add caregiver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isInputValid = email.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Caregiver</Text>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Enter caregiver's email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomButton
          title="Submit"
          onPress={handleAddCaregiver}
          variant={isInputValid ? "primary" : "secondary"} // Adjust variant dynamically based on validity
          style={isInputValid ? {} : styles.disabledButton} // Additional styling for disabled state
        />
        <CustomButton
          title="Cancel"
          onPress={() => router.back()}
          variant="danger"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
});
