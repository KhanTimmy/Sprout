import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, SafeAreaView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from '@/FirebaseConfig';
import CustomButton from '@/components/CustomButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, SleepData, FeedData, DiaperData, ActivityData, MilestoneData } from '@/services/ChildService';

// Import specialized modal components
import ChildSelectionModal from '@/components/ChildSelectionModal';
import AddActionModal from '@/components/AddActionModal';
import SleepModal from '@/components/SleepModal';
import FeedModal from '@/components/FeedModal';
import DiaperModal from '@/components/DiaperModal';
import ActivityModal from '@/components/ActivityModal';
import MilestoneModal from '@/components/MilestoneModal';

export default function Home() {
  // Child state
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild, loading } = useSelectedChild();

  // Modal visibility states
  const [childSelectionModalVisible, setChildSelectionModalVisible] = useState(false);
  const [addActionModalVisible, setAddActionModalVisible] = useState(false);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [diaperModalVisible, setDiaperModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });
    return () => unsubscribe();
  }, []);

  // Fetch children when modal opens
  const openChildSelectionModal = async () => {
    try {
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
      setChildSelectionModalVisible(true);
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert('Error', 'Could not fetch children list');
    }
  };

  // Handle sleep data submission
  const handleSaveSleep = async (sleepData: SleepData) => {
    try {
      await ChildService.addSleep(sleepData);
      Alert.alert('Success', 'Sleep data added!');
    } catch (error) {
      console.error('Error adding sleep:', error);
      Alert.alert('Error', 'Error adding sleep data. Please try again.');
      throw error; // Propagate error to modal component
    }
  };

  const handleSaveFeed = async (feedData: FeedData) => {
    try {
      await ChildService.addFeed(feedData);
      Alert.alert('Success', 'Feed data added!');
    } catch (error) {
      console.error('Error adding feed:', error);
      Alert.alert('Error', 'Error adding feed data. Please try again.');
      throw error;
    }
  };

  const handleSaveDiaper = async (diaperData: DiaperData) => {
    try {
      await ChildService.addDiaper(diaperData);
      Alert.alert('Success', 'Diaper data added!');
    } catch (error) {
      console.error('Error adding diaper:', error);
      Alert.alert('Error', 'Error adding feed data. Please try again.');
      throw error;
    }
  };

  const handleSaveActivity = async (activityData: ActivityData) => {
    try {
      await ChildService.addActivity(activityData);
      Alert.alert('Success', 'Activity data added!');
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Error adding activity data. Please try again.');
      throw error;
    }
  };

  const handleSaveMilestone = async (milestoneData: MilestoneData) => {
    try {
      await ChildService.addMilestone(milestoneData);
      Alert.alert('Success', 'Milestone data added!');
    } catch (error) {
      console.error('Error adding milestone:', error);
      Alert.alert('Error', 'Error adding milestone data. Please try again.');
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {/* Child Selection Button */}
      <CustomButton
        title={selectedChild ? "Change Child" : "Select Child"}
        onPress={openChildSelectionModal}
        variant="primary"
        style={styles.selectButton}
      />

      {/* Display selected child or info message */}
      {loading ? (
        <Text style={styles.infoText}>Loading...</Text>
      ) : selectedChild ? (
        <View style={styles.childInfoContainer}>
          <Text style={styles.childName}>
            {selectedChild.first_name} {selectedChild.last_name}
          </Text>
          <Text style={styles.childType}>
            {selectedChild.type === 'Parent' ? 'You are the parent' : 'You are authorized'}
          </Text>
        </View>
      ) : (
        <Text style={styles.infoText}>No child selected. Please select a child first.</Text>
      )}

      {/* Record Activity Button */}
      <CustomButton
        title="Add Action"
        onPress={() => setAddActionModalVisible(true)}
        variant="primary"
        disabled={!selectedChild}
      />

      {/* Sign Out Button */}
      <CustomButton 
        title="Sign Out" 
        onPress={() => auth.signOut()} 
        variant="primary"
      />

      {/* Child Selection Modal */}
      <ChildSelectionModal
        visible={childSelectionModalVisible}
        onClose={() => setChildSelectionModalVisible(false)}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={saveSelectedChild}
        onClearSelection={clearSelectedChild}
      />

      {/* Add Action Modal */}
      <AddActionModal
        visible={addActionModalVisible}
        onClose={() => setAddActionModalVisible(false)}
        onSleepPress={() => setSleepModalVisible(true)}
        onFeedPress={() => setFeedModalVisible(true)}
        onDiaperPress={() => setDiaperModalVisible(true)}
        onActivityPress={() => setActivityModalVisible(true)}
        onMilestonePress={() => setMilestoneModalVisible(true)}
      />

      {/* Sleep Data Modal */}
      <SleepModal
        visible={sleepModalVisible}
        onClose={() => setSleepModalVisible(false)}
        onSave={handleSaveSleep}
        childId={selectedChild?.id}
      />
      
      {/* Feed Data Modal */}
      <FeedModal
        visible={feedModalVisible}
        onClose={() => setFeedModalVisible(false)}
        onSave={handleSaveFeed}
        childId={selectedChild?.id}
      />

      {/* Diaper Data Modal */}
      <DiaperModal
        visible={diaperModalVisible}
        onClose={() => setDiaperModalVisible(false)}
        onSave={handleSaveDiaper}
        childId={selectedChild?.id}
      />

      {/* Activity Data Modal */}
      <ActivityModal
        visible={activityModalVisible}
        onClose={() => setActivityModalVisible(false)}
        onSave={handleSaveActivity}
        childId={selectedChild?.id}
      />

      {/* Milestone Data Modal */}
      <MilestoneModal
        visible={milestoneModalVisible}
        onClose={() => setMilestoneModalVisible(false)}
        onSave={handleSaveMilestone}
        childId={selectedChild?.id}
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
  selectButton: {
    marginBottom: 20,
    width: '100%',
  },
  childInfoContainer: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  childType: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
});