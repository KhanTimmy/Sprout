import { SafeAreaView, StyleSheet } from 'react-native';
import { Text, View } from 'react-native';
import CustomButton from '@/components/CustomButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData, FeedData, SleepData, DiaperData } from '@/services/ChildService';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// import specialized modal components
import ChildSelectionModal from '@/components/ChildSelectionModal';
import ViewFeedModal from '@/components/ViewFeedModal';
import ViewSleepModal from '@/components/ViewSleepModal';
import ViewDiaperModal from '@/components/ViewDiaperModal';
import ViewHistoryModal from '@/components/ViewHistoryModal';
import AtAGlanceSection from '@/components/AtAGlanceSection';

export default function Reports() {
  // Child state
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild, loading } = useSelectedChild();

  // modal visibility states
  const [childSelectionModalVisible, setChildSelectionModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [feedingsModalVisible, setFeedingsModalVisible] = useState(false);
  const [sleepsModalVisible, setSleepsModalVisible] = useState(false);
  const [diapersModalVisible, setDiapersModalVisible] = useState(false);
  
  // data states
  const [feedings, setFeedings] = useState<FeedData[]>([]);
  const [sleeps, setSleeps] = useState<SleepData[]>([]);
  const [diapers, setDiapers] = useState<DiaperData[]>([]);
  
  // loading states
  const [loadingFeedings, setLoadingFeedings] = useState(false);
  const [loadingSleeps, setLoadingSleeps] = useState(false);
  const [loadingDiapers, setLoadingDiapers] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) router.replace('/');
    });
    return () => unsubscribe();
  }, []);

  // Fetch all data when child is selected
  useEffect(() => {
    if (selectedChild) {
      fetchAllData();
    }
  }, [selectedChild]);

  const fetchAllData = async () => {
    if (!selectedChild) return;
    
    setLoadingSummary(true);
    try {
      await Promise.all([
        fetchSleepData(),
        fetchDiaperData(),
      ]);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      Alert.alert('Error', 'Could not fetch summary data');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchSleepData = async () => {
    if (!selectedChild) return;
    
    setLoadingSleeps(true);
    try {
      const sleepsData = await ChildService.getSleep(selectedChild.id);
      setSleeps(sleepsData);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      Alert.alert('Error', 'Could not fetch sleep data');
    } finally {
      setLoadingSleeps(false);
    }
  };

  const fetchDiaperData = async () => {
    if (!selectedChild) return;
    
    setLoadingDiapers(true);
    try {
      const diapersData = await ChildService.getDiaper(selectedChild.id);
      setDiapers(diapersData);
    } catch (error) {
      console.error('Error fetching diaper data:', error);
      Alert.alert('Error', 'Could not fetch diaper data');
    } finally {
      setLoadingDiapers(false);
    }
  };

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

  // Fetch sleeps when modal opens
  const openSleepsModal = async () => {
    if (!selectedChild) return;
    setSleepsModalVisible(true);
  };

  // Fetch diapers when modal opens
  const openDiapersModal = async () => {
    if (!selectedChild) return;
    setDiapersModalVisible(true);
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

      {/* At a Glance Section */}
      {selectedChild && (
        <AtAGlanceSection
          sleeps={sleeps}
          diapers={diapers}
          loading={loadingSummary}
        />
      )}

      {/* View History Button */}
      <CustomButton
        title="View History"
        onPress={() => setHistoryModalVisible(true)}
        variant="primary"
        disabled={!selectedChild}
        style={styles.historyButton}
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

      {/* History Modal */}
      <ViewHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        onViewSleep={openSleepsModal}
        onViewFeedings={openFeedingsModal}
        onViewDiapers={openDiapersModal}
      />

      {/* Feedings Modal */}
      <ViewFeedModal
        visible={feedingsModalVisible}
        onClose={() => setFeedingsModalVisible(false)}
        feedings={feedings}
        loading={loadingFeedings}
      />

      {/* Sleep Modal */}
      <ViewSleepModal
        visible={sleepsModalVisible}
        onClose={() => setSleepsModalVisible(false)}
        sleeps={sleeps}
        loading={loadingSleeps}
      />

      {/* Diaper Modal */}
      <ViewDiaperModal
        visible={diapersModalVisible}
        onClose={() => setDiapersModalVisible(false)}
        diapers={diapers}
        loading={loadingDiapers}
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
  historyButton: {
    width: '100%',
    marginTop: 20,
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
