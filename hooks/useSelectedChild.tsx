import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChildService, resetQueryCounter, clearChildCache } from '@/services/ChildService';

const checkIfChildExistsInDatabase = async (childId: string): Promise<boolean> => {
  try {
    const children = await ChildService.fetchUserChildren();

    return children.some(child => child.id === childId);
  } catch (error) {
    console.error('Error checking if child exists in the database:', error);
    return false;
  }
};

export interface ChildData {
  id: string;
  first_name: string;
  last_name: string;
  type: string;
  dob: string;
  sex: 'male' | 'female';
  weight?: {
    pounds: number;
    ounces: number;
  };
}

export function useSelectedChild() {
  console.log('[Hooks]useSelectedChild executing');
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchSelectedChild = async () => {
        console.log('[Hooks]fetchSelectedChild executing');
        setLoading(true);
        try {
          const savedChild = await AsyncStorage.getItem('selectedChild');
          if (savedChild) {
            const childData: ChildData = JSON.parse(savedChild);
            console.log('...[fetchSelectedChild] selectedChild fetched from AsyncStorage');

            const childExists = await checkIfChildExistsInDatabase(childData.id);
            if (childExists) {
              setSelectedChild(childData);
            } else {
              console.log('...[fetchSelectedChild] selectedChild DNE in FirestoreDB');
              await AsyncStorage.removeItem('selectedChild');
              console.log('...[fetchSelectedChild] selectedChild removed from AsyncStorage');
              setSelectedChild(null);
              console.log('...[fetchSelectedChild] selectedChild removed from useState');
            }
          } else {
            console.log('...[fetchSelectedChild] selectedChild not found in AsyncStorage');
            setSelectedChild(null);
          }
        } catch (error) {
          console.error('Error fetching selected child:', error);
          setSelectedChild(null);
        } finally {
          setLoading(false);
        }
        console.log('[Hooks]fetchSelectedChild completed');
      };
      console.log('[Hooks]useSelectedChild called [Hooks] fetchSelectedChild');
      fetchSelectedChild();
    }, [])
  );

  const saveSelectedChild = async (child: ChildData | null) => {
    console.log('[Hooks]saveSelectedChild executing');
    try {
      if (child) {
        console.log('...[saveSelectedChild] saving child:', child.first_name, child.last_name);
        await AsyncStorage.setItem('selectedChild', JSON.stringify(child));
      } else {
        console.log('...[saveSelectedChild] clearing selected child');
        await AsyncStorage.removeItem('selectedChild');
      }

      if (selectedChild && (!child || child.id !== selectedChild.id)) {
        await clearChildCache(selectedChild.id);
      }
      
      setSelectedChild(child);
      resetQueryCounter(child?.id || null);
      console.log('...[saveSelectedChild] state updated');
      console.log('[Hooks]saveSelectedChild completed');
    } catch (error) {
      console.error('[Hooks]saveSelectedChild error occurred:', error);
    }
  };

  const clearSelectedChild = async () => {
    console.log('[Hooks]clearSelectedChild executing');
    try {
      if (selectedChild) {
        await clearChildCache(selectedChild.id);
      }
      
      await AsyncStorage.removeItem('selectedChild');
      setSelectedChild(null);
      resetQueryCounter(null);
      console.log('...[clearSelectedChild] child cleared from storage and state');
      console.log('[Hooks]clearSelectedChild completed');
    } catch (error) {
      console.error('[Hooks]clearSelectedChild error occurred:', error);
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
