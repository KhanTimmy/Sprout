import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService } from '@/services/ChildService';

export default function Settings() {
  const { selectedChild, clearSelectedChild } = useSelectedChild();

  const handleActionButtonPress = async () => {
    if (!selectedChild) {
      Alert.alert('No child selected', 'Please select a child to proceed.');
      return;
    }

    try {
      await ChildService.removeChildOrAccess(selectedChild);
      
      const actionType = selectedChild.type === 'Parent' ? 'deleted' : 'removed';
      Alert.alert('Success', `Child has been ${actionType} successfully.`);
      
      // Clear selected child after action
      await clearSelectedChild();
    } catch (error) {
      console.error('Error performing action:', error);
      Alert.alert('Error', 'There was an issue performing the requested action.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <CustomButton
        title="Access"
        onPress={() => router.push('/access')}
        variant="primary"
      />
      
      {selectedChild && (
        <CustomButton 
          title={selectedChild.type === 'Parent' ? 'Delete Child' : 'Remove Access'} 
          onPress={handleActionButtonPress}
          variant="danger" // Makes it 80% width like in original
        />
      )}
    </View>
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
});