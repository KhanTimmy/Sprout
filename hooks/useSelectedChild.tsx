import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChildService } from '@/services/ChildService';

const checkIfChildExistsInDatabase = async (childId: string): Promise<boolean> => {
  try {
    // Fetch all children associated with the current user
    const children = await ChildService.fetchUserChildren();
    
    // Check if any child matches the provided childId
    return children.some(child => child.id === childId);
  } catch (error) {
    console.error('Error checking if child exists in the database:', error);
    return false; // Return false if an error occurs or if no child exists
  }
};

export interface ChildData {
  id: string;
  first_name: string;
  last_name: string;
  type: string;
  authorized_uid?: string[];
}

export function useSelectedChild() {
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the selected child whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchSelectedChild = async () => {
        setLoading(true);
        try {
          const savedChild = await AsyncStorage.getItem('selectedChild');
          if (savedChild) {
            const childData: ChildData = JSON.parse(savedChild);
            console.log('Fetched selected child:', childData);

            // Check if the child exists in the database
            const childExists = await checkIfChildExistsInDatabase(childData.id);
            if (childExists) {
              setSelectedChild(childData);
            } else {
              console.log('Child does not exist in the database, clearing selected child');
              await AsyncStorage.removeItem('selectedChild');
              setSelectedChild(null); // Explicitly reset the selected child state
            }
          } else {
            console.log('No selected child found in AsyncStorage');
            setSelectedChild(null);
          }
        } catch (error) {
          console.error('Error fetching selected child:', error);
          setSelectedChild(null);
        } finally {
          setLoading(false);
        }
      };

      fetchSelectedChild();
    }, [])
  );

  // Save selected child to AsyncStorage
  const saveSelectedChild = async (child: ChildData | null) => {
    try {
      if (child) {
        console.log('Saving selected child:', child);
        await AsyncStorage.setItem('selectedChild', JSON.stringify(child));
      } else {
        await AsyncStorage.removeItem('selectedChild');
        console.log('Cleared selected child');
      }
      setSelectedChild(child);
    } catch (error) {
      console.error('Error saving selected child:', error);
    }
  };

  // Clear selected child
  const clearSelectedChild = async () => {
    try {
      await AsyncStorage.removeItem('selectedChild');
      setSelectedChild(null);
      console.log('Cleared selected child');
    } catch (error) {
      console.error('Error clearing selected child:', error);
    }
  };

  return { 
    selectedChild, 
    saveSelectedChild, 
    clearSelectedChild,
    loading
  };
}

const ChildComponent = () => {
  const { selectedChild, loading } = useSelectedChild();

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#555',
  },
  childInfoContainer: {
    alignItems: 'center',
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  childType: {
    fontSize: 18,
    color: '#888',
  },
});

export default ChildComponent;
