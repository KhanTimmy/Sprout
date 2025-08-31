import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import CustomButton from '@/components/CustomButton';
import { ChildService, ChildData } from '@/services/ChildService';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase.config';
import { router } from 'expo-router';
import ChildSelectionModal from './modals/ChildSelectionModal';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AccessScreen() {
  const { selectedChild, saveSelectedChild, clearSelectedChild } = useSelectedChild();
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [childrenList, setChildrenList] = useState<ChildData[]>([]);

  // Ensure user is authenticated
  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('/');
  });

  useEffect(() => {
    const fetchChildDetails = async () => {
      setLoading(true);
      try {
        if (selectedChild && selectedChild.id) {
          // Directly fetch the child document from Firestore to get complete data
          const childDocRef = doc(db, 'children', selectedChild.id);
          const childDocSnap = await getDoc(childDocRef);
          
          if (childDocSnap.exists()) {
            const childData = childDocSnap.data();
            // Get the authorized_uid array from the document
            setAuthorizedUsers(childData.authorized_uid || []);
            console.log('Authorized users:', childData.authorized_uid);
          } else {
            console.log('No such child document exists!');
            setAuthorizedUsers([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch child details:', error);
        setAuthorizedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedChild) {
      fetchChildDetails();
    } else {
      setLoading(false);
    }
  }, [selectedChild]);

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

  const handleRemovalButtonPress = async () => {
    if (!selectedChild) {
      Alert.alert('No child selected', 'Please select a child to proceed.');
      return;
    }
  
    const actionType = selectedChild.type === 'Parent' ? 'delete' : 'remove';
    const actionText = selectedChild.type === 'Parent' ? 'Delete Child' : 'Remove Access';
    const confirmationMessage = selectedChild.type === 'Parent'
      ? `Are you sure you want to delete ${selectedChild.first_name} ${selectedChild.last_name}?`
      : `Are you sure you want to remove access for ${selectedChild.first_name} ${selectedChild.last_name}?`;
  
    // Show the confirmation alert
    Alert.alert(
      'Confirm Action',
      confirmationMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await ChildService.removeChildOrAccess(selectedChild);
              
              Alert.alert('Success', `Child has been ${actionType}d successfully.`);
              
              // Clear selected child after action
              await clearSelectedChild();
            } catch (error) {
              console.error('Error performing action:', error);
              Alert.alert('Error', 'There was an issue performing the requested action.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Manage Access</Text>
      
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

      {selectedChild && (
        <CustomButton 
          title={selectedChild.type === 'Parent' ? 'Delete Child' : 'Remove Access'} 
          onPress={handleRemovalButtonPress} // Now with confirmation pop-up
          variant="danger" 
        />
      )}

      {selectedChild && selectedChild.type === 'Parent' && (
        <>
          <Text style={styles.sectionTitle}>Authorized Caregivers</Text>
          
          {authorizedUsers.length > 0 ? (
            <FlatList
              data={authorizedUsers}
              keyExtractor={(item, index) => `user-${index}`}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <Text style={styles.userText}>{item}</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={async () => {
                      try {
                        // Get current document
                        const childDocRef = doc(db, 'children', selectedChild.id);
                        // Update the authorized_uid list
                        await updateDoc(childDocRef, {
                          authorized_uid: arrayRemove(item)
                        });
                        // Update local state
                        setAuthorizedUsers(prev => prev.filter(uid => uid !== item));
                        console.log('Removed user:', item);
                      } catch (error) {
                        console.error('Error removing authorized user:', error);
                      }
                    }}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.userList}
            />
          ) : (
            <Text style={styles.infoText}>No authorized users for this child.</Text>
          )}
          
          <CustomButton 
            title="Add New Authorized Caregiver" 
            onPress={() => {
              router.push('/addcaregiver'),
              console.log('Add new authorized user');
            }} 
            style={styles.addButton}
          />
        </>
      )}

      {/* Child Selection Modal */}
      <ChildSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={(child) => saveSelectedChild(child)}
        onClearSelection={clearSelectedChild}
      />

      <CustomButton
        title="Back"
        onPress={() => router.back()}
        variant="primary"
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  userList: {
    width: '100%',
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  userText: {
    fontSize: 16,
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 20,
    width: '100%',
  },
});