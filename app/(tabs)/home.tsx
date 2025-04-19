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

  // Modal visibility state consolidated
  const [modalVisibility, setModalVisibility] = useState({
    childSelection: false,
    addAction: false,
    sleep: false,
    feed: false,
    diaper: false,
    activity: false,
    milestone: false,
  });

  // Authentication check
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });
    return () => unsubscribe();
  }, []);

  // Fetch children when modal opens
  const openChildSelectionModal = async () => {
    console.log('CustomButton called openChildSelectionModal');
    try {
      console.log('[home] openChildSelectionModal called [ChildService]fetchUserChildren');
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
      setModalVisibility(prev => ({ ...prev, childSelection: true }));
      console.log('[Components] ChildSelectionModal set to visible');
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert('Error', 'Could not fetch children list');
    }
  };

  // Generalized save function for all types of data (sleep, feed, diaper, activity, milestone)
  const handleSave = async (data: SleepData | FeedData | DiaperData | ActivityData | MilestoneData, saveFunction: Function, successMessage: string, errorMessage: string) => {
    try {
      await saveFunction(data);
      Alert.alert('Success', successMessage);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      Alert.alert('Error', errorMessage);
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
        onPress={() => {
          setModalVisibility(prev => ({ ...prev, addAction: true }));
          console.log('[Components] AddActionModal set to visible');
        }}
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
        visible={modalVisibility.childSelection}
        onClose={() => setModalVisibility(prev => ({ ...prev, childSelection: false }))}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={saveSelectedChild}
        onClearSelection={clearSelectedChild}
      />

      {/* Add Action Modal */}
      <AddActionModal
        visible={modalVisibility.addAction}
        onClose={() => setModalVisibility(prev => ({ ...prev, addAction: false }))}
        onSleepPress={() => setModalVisibility(prev => ({ ...prev, sleep: true }))}
        onFeedPress={() => setModalVisibility(prev => ({ ...prev, feed: true }))}
        onDiaperPress={() => setModalVisibility(prev => ({ ...prev, diaper: true }))}
        onActivityPress={() => setModalVisibility(prev => ({ ...prev, activity: true }))}
        onMilestonePress={() => setModalVisibility(prev => ({ ...prev, milestone: true }))}
      />

      {/* Sleep Data Modal */}
      <SleepModal
        visible={modalVisibility.sleep}
        onClose={() => setModalVisibility(prev => ({ ...prev, sleep: false }))}
        onSave={(data) => handleSave(data, ChildService.addSleep, 'Sleep data added!', 'Error adding sleep data. Please try again.')}
        childId={selectedChild?.id}
      />
      
      {/* Feed Data Modal */}
      <FeedModal
        visible={modalVisibility.feed}
        onClose={() => setModalVisibility(prev => ({ ...prev, feed: false }))}
        onSave={(data) => handleSave(data, ChildService.addFeed, 'Feed data added!', 'Error adding feed data. Please try again.')}
        childId={selectedChild?.id}
      />

      {/* Diaper Data Modal */}
      <DiaperModal
        visible={modalVisibility.diaper}
        onClose={() => setModalVisibility(prev => ({ ...prev, diaper: false }))}
        onSave={(data) => handleSave(data, ChildService.addDiaper, 'Diaper data added!', 'Error adding diaper data. Please try again.')}
        childId={selectedChild?.id}
      />

      {/* Activity Data Modal */}
      <ActivityModal
        visible={modalVisibility.activity}
        onClose={() => setModalVisibility(prev => ({ ...prev, activity: false }))}
        onSave={(data) => handleSave(data, ChildService.addActivity, 'Activity data added!', 'Error adding activity data. Please try again.')}
        childId={selectedChild?.id}
      />

      {/* Milestone Data Modal */}
      <MilestoneModal
        visible={modalVisibility.milestone}
        onClose={() => setModalVisibility(prev => ({ ...prev, milestone: false }))}
        onSave={(data) => handleSave(data, ChildService.addMilestone, 'Milestone data added!', 'Error adding milestone data. Please try again.')}
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