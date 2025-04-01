import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from '@/FirebaseConfig';
import CustomButton from '@/components/CustomButton';
import CustomModal from '@/components/CustomModal';
import RadioButton from '@/components/RadioButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData } from '@/services/ChildService';
import DateTimePickerModal from "react-native-modal-datetime-picker";


export default function Home() {

  // date picker functions
  const [isDatePickerVisible, setDatePickerVisibility] =useState(false);

  // modal functions
  const [modalVisible, setModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [sleepModalVisible, setSleepModalVisible] =useState(false);
  
  // child functions
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);
  const { selectedChild, saveSelectedChild, clearSelectedChild } = useSelectedChild();

  // Ensure user is authenticated
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  // Fetch children and show modal
  const checkChildren = async () => {
    try {
      const children = await ChildService.fetchUserChildren();
      setChildrenList(children);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  // show modal to select type of activity to be recorded
  const activityModal = () => {
    try {
      setActivityModalVisible(true);
    } catch (error) {
      console.error('Error activity modal:', error);
    }
  }

  // show sleep modal to record sleep activity
  const sleepActivityModal = () => {
    try {
      setSleepModalVisible(true);
    } catch (error) {
      console.error('Error activity modal:', error);
    }
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleDatePickerConfirm = (datetime: Date) => {
    console.warn("This has been picked: ", datetime);
    setDatePickerVisibility(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {/* Select Child Button */}
      {/* Child Selection Button */}
      <CustomButton
        title={selectedChild ? "Change Child" : "Select Child"}
        onPress={checkChildren}
        variant="primary"
        style={styles.selectButton}
      />

      {selectedChild ? (
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
        title="New Activity"
        onPress={activityModal}
        variant="primary"
      />

      {/* Sign Out Button */}
      <CustomButton 
        title="Sign Out" 
        onPress={() => auth.signOut()} 
        variant="primary"
      />

      {/* Child Selection Modal */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Select a Child"
      >
        <TouchableOpacity
          style={styles.addChildButton}
          onPress={() => {
            setModalVisible(false);
            router.push('/addchild');
          }}
        >
          <Text style={styles.addChildButtonText}>Add Child</Text>
        </TouchableOpacity>
        
        {childrenList.length > 0 ? (
          childrenList.map((child, index) => (
            <RadioButton
              key={index}
              label={`${child.first_name} ${child.last_name} (${child.type})`}
              selected={selectedChild?.id === child.id}
              onPress={() => saveSelectedChild(child)}
              labelPosition="left"
            />
          ))
        ) : (
          <Text>No children found</Text>
        )}
        
        {childrenList.length > 0 && (
          <CustomButton
            title="Clear Selection"
            onPress={clearSelectedChild}
            variant="secondary"
          />
        )}
        
        <CustomButton
          title="Close"
          onPress={() => setModalVisible(false)}
          variant="primary"
        />
      </CustomModal>

      { /* Select activity type modal */ }
      <CustomModal
        visible={activityModalVisible}
        onClose={() => setActivityModalVisible(false)}
        title="Select Activity Type"
        >
          <CustomButton
            title="Sleep"
            onPress={() => {
              setActivityModalVisible(false)
              setSleepModalVisible(true)
            }}
            variant="primary"
            />
          <CustomButton
            title="Feed"
            onPress={() => setActivityModalVisible(false)}
            variant="primary"
            />
          <CustomButton
            title="Diaper Change"
            onPress={() => setActivityModalVisible(false)}
            variant="primary"
            />
          <CustomButton
            title="Close"
            onPress={() => setActivityModalVisible(false)}
            variant="primary"
            />
        </CustomModal>

        {/* Sleep Modal */}
        <CustomModal
          visible={sleepModalVisible}
          onClose={() => setSleepModalVisible(false)}
          title="Input Sleep Data"
          >
            <CustomButton title="Start Time" onPress={showDatePicker}/>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleDatePickerConfirm}
              onCancel={hideDatePicker}
              />
            <CustomButton title="End Time" onPress={showDatePicker}/>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleDatePickerConfirm}
              onCancel={hideDatePicker}
              />
            <CustomButton
              title="Cancel"
              onPress={() => setSleepModalVisible(false)}
              variant='primary'
              />
          </CustomModal>
        {/* Feeding Modal */}

        {/* Diaper Change modal */}
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
  selectButton: {
    marginBottom: 20,
    width: '100%',
  },
  addChildButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  addChildButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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