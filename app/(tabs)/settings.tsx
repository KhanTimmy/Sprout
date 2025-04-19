import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, FeedData, SleepData, DiaperData, ActivityData, MilestoneData } from '@/services/ChildService';
// REMOVE_BEFORE_DEPLOYMENT: Remove test data import
import testData from '@/testData.json';

// WARNING I DID A THING HERE THAT IS PROBABLY NOT SAFE TEEHE
// Test data button should be removed before deployment along with the testData.json file.
// It is for testing. For adding alot of data to the current selected child. 
// The file "testData.json" should be alterred to include your desired test data.
// I suggest using a model to generate the file and throughouly verify it with json linter like https://jsonlint.com/ or similar.

// notes on the testData.json file:
// This test data file should contain arrays of objects for each category (sleep, feed, diaper, activity, milestone)
// Each object should match the interfaces defined in ChildService.tsx
// Ask me for clarification if you want help making test json data. Theres some quirks to it. Basic sample data is in the file.
// - Bowen

// the one weird thing i ran into is that the amount field in the feed object must be present no matter what type it is
// the code adds a value of 0 if it is not needed in that type
// so the json you create should do the same.

// REMOVE_BEFORE_DEPLOYMENT: Remove test data interface and related code
interface TestData {
  sleep: Array<{
    start: string;
    end: string;
    quality: number;
  }>;
  feed: Array<{
    amount: number;
    dateTime: string;
    description: string;
    duration: number;
    notes: string;
    type: 'bottle' | 'nursing' | 'solid';
    side?: 'left' | 'right';
  }>;
  diaper: Array<{
    dateTime: string;
    type: 'pee' | 'mixed' | 'poo' | 'dry';
    peeAmount?: 'medium' | 'little' | 'big';
    pooAmount?: 'medium' | 'little' | 'big';
    pooColor?: 'yellow' | 'brown' | 'black' | 'green' | 'red';
    pooConsistency?: 'solid' | 'loose' | 'runny' | 'mucousy' | 'hard' | 'pebbles' | 'diarrhea';
    hasRash: boolean;
  }>;
  activity: Array<{
    dateTime: string;
    type: 'tummy time' | 'bath' | 'story time' | 'skin to skin' | 'brush teeth';
  }>;
  milestone: Array<{
    dateTime: string;
    type: 'smiling' | 'rolling over' | 'sitting up' | 'crawling' | 'walking';
  }>;
}

export default function Settings() {
  const { selectedChild } = useSelectedChild();

  // REMOVE_BEFORE_DEPLOYMENT: Remove test data generation function
  const generateTestData = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'Please select a child first');
      return;
    }

    try {
      // Add sleep data
      for (const sleep of (testData as TestData).sleep) {
        await ChildService.addSleep({
          id: selectedChild.id,
          start: new Date(sleep.start),
          end: new Date(sleep.end),
          quality: sleep.quality
        });
      }

      // Add feed data
      for (const feed of (testData as TestData).feed) {
        await ChildService.addFeed({
          id: selectedChild.id,
          amount: feed.amount,
          dateTime: new Date(feed.dateTime),
          description: feed.description,
          duration: feed.duration,
          notes: feed.notes,
          type: feed.type,
          ...(feed.side && { side: feed.side })
        });
      }

      // Add diaper data
      for (const diaper of (testData as TestData).diaper) {
        await ChildService.addDiaper({
          id: selectedChild.id,
          dateTime: new Date(diaper.dateTime),
          type: diaper.type,
          peeAmount: diaper.peeAmount,
          pooAmount: diaper.pooAmount,
          pooColor: diaper.pooColor,
          pooConsistency: diaper.pooConsistency,
          hasRash: diaper.hasRash
        });
      }

      // Add activity data
      for (const activity of (testData as TestData).activity) {
        await ChildService.addActivity({
          id: selectedChild.id,
          dateTime: new Date(activity.dateTime),
          type: activity.type
        });
      }

      // Add milestone data
      for (const milestone of (testData as TestData).milestone) {
        await ChildService.addMilestone({
          id: selectedChild.id,
          dateTime: new Date(milestone.dateTime),
          type: milestone.type
        });
      }

      Alert.alert('Success', 'Test data generated successfully!');
    } catch (error) {
      console.error('Error generating test data:', error);
      Alert.alert('Error', 'Failed to generate test data. Please try again.');
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

      {/* REMOVE_BEFORE_DEPLOYMENT: Remove test data button */}
      <CustomButton
        title="Generate Test Data"
        onPress={generateTestData}
        variant="secondary"
        disabled={!selectedChild}
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