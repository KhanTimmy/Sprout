import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from '@/FirebaseConfig';
import CustomButton from '@/components/CustomButton';
import CustomModal from '@/components/CustomModal';
import RadioButton from '@/components/RadioButton';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { ChildService, ChildData } from '@/services/ChildService';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
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