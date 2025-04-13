import { SafeAreaView, StyleSheet } from 'react-native';
import { Text, View } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, FeedData} from '@/services/ChildService';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// import specialized modal components
import ChildSelectionModal from '@/components/ChildSelectionModal';
import ViewFeedModal from '@/components/ViewFeedModal';

export default function Reports() {
  // Child state
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild, loading } = useSelectedChild();

  // modal visibility states
  const [childSelectionModalVisible, setChildSelectionModalVisible] = useState(false);
  const [feedingsModalVisible, setFeedingsModalVisible] = useState(false);
  const [feedings, setFeedings] = useState<FeedData[]>([]);
  const [loadingFeedings, setLoadingFeedings] = useState(false);

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

  // Fetch feedings when modal opens
  const openFeedingsModal = async () => {
    if (!selectedChild) return;
    
    setLoadingFeedings(true);
    try {
      const feedingsData = await ChildService.getFeed(selectedChild.id);
      setFeedings(feedingsData);
      setFeedingsModalVisible(true);
    } catch (error) {
      console.error('Error fetching feedings:', error);
      Alert.alert('Error', 'Could not fetch feeding data');
    } finally {
      setLoadingFeedings(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reports</Text>
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

      {/* View Feedings Button */}
      <CustomButton
        title="View Feedings"
        onPress={openFeedingsModal}
        variant="primary"
        disabled={!selectedChild}
      />

      {/* View Sleep Button */}
      <CustomButton
        title="View Sleep"
        onPress={() => {}}
        variant="primary"
        disabled={!selectedChild}
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

      {/* Feedings Modal */}
      <ViewFeedModal
        visible={feedingsModalVisible}
        onClose={() => setFeedingsModalVisible(false)}
        feedings={feedings}
        loading={loadingFeedings}
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
