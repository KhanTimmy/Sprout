import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';

export default function Settings() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <CustomButton
        title="Access"
        onPress={() => router.push('/access')}
        variant="primary"
      />
      
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