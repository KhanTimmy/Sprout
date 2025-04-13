import { 
    collection, 
    getDocs, 
    query, 
    where, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    arrayRemove,
    doc 
  } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { db } from '@/FirebaseConfig';
  
  export interface ChildData {
    id: string;
    first_name: string;
    last_name: string;
    type: string;
  }
  
  export interface NewChildData {
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
  }

  export interface SleepData {
    id: string;
    start: Date;
    end: Date;
    quality: number;
  }

  export interface FeedData {
    id: string; // child ID
    amount: number;
    dateTime: Date; // Firebase will store it as a timestamp
    description: string;
    duration: number;
    notes: string;
    type: 'nursing' | 'bottle' | 'solid';
    side?: 'left' | 'right'; // only used if type === 'nursing'
  }
  
  export interface DiaperData {
    id: string;
    dateTime: Date;
    type: 'pee' | 'poo' | 'mixed' | 'dry';
  }

  export interface ActivityData {
    id: string;
    dateTime: Date;
    type: 'bath' | 'tummy time' | 'story time' | 'skin to skin' | 'brush teeth';
  }

  export interface MilestoneData {
    id: string;
    dateTime: Date;
    type: 'smiling' | 'rolling over' | 'sitting up' | 'crawling' | 'walking';
  }

  export const ChildService = {
    // Fetch children associated with current user
    async fetchUserChildren(): Promise<ChildData[]> {
      const user = getAuth().currentUser;
      if (!user || !user.email) return [];
      
      console.log('Fetching children for user email:', user.email);
      
      try {
        const childrenCollection = collection(db, 'children');
      
        // Queries for children (authorized and parent relationships)
        const authorizedQuery = query(childrenCollection, where('authorized_uid', 'array-contains', user.email));
        const parentQuery = query(childrenCollection, where('parent_uid', '==', user.email));
      
        const authorizedSnapshot = await getDocs(authorizedQuery);
        const parentSnapshot = await getDocs(parentQuery);
      
        let childrenFound: ChildData[] = [];
      
        // Process parent matches
        parentSnapshot.forEach((doc) => {
          const parentChildData = doc.data();
          if (parentChildData.parent_uid) {
            childrenFound.push({
              first_name: parentChildData.first_name,
              last_name: parentChildData.last_name,
              type: 'Parent',
              id: doc.id,
            });
          }
        });
      
        // Process authorized matches
        authorizedSnapshot.forEach((doc) => {
          const authChildData = doc.data();
          if (authChildData.authorized_uid) {
            childrenFound.push({
              first_name: authChildData.first_name,
              last_name: authChildData.last_name,
              type: 'Authorized',
              id: doc.id,
            });
          }
        });
      
        return childrenFound;
      } catch (error) {
        console.error('Error fetching children:', error);
        throw error;
      }
    },
  
    // Add a new child
    async addChild(childData: NewChildData): Promise<ChildData> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to add a child');
      }
  
      try {
        const docRef = await addDoc(collection(db, 'children'), {
          first_name: childData.first_name,
          last_name: childData.last_name,
          dob: childData.dob,
          sex: childData.sex,
          parent_uid: user.email,
          authorized_uid: [],
        });
  
        // Return the new child with the correct format
        return {
          first_name: childData.first_name,
          last_name: childData.last_name,
          type: 'Parent',
          id: docRef.id,
        };
      } catch (error) {
        console.error('Error adding child:', error);
        throw error;
      }
    },
  
    // Delete a child or remove access
    async removeChildOrAccess(child: ChildData): Promise<void> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in');
      }
  
      try {
        if (child.type === 'Parent') {
          // Parent: Delete the entire document
          const childDocRef = doc(db, 'children', child.id);
          await deleteDoc(childDocRef);
        } else if (child.type === 'Authorized') {
          // Authorized: Remove user's UID from authorized_uid array
          const childDocRef = doc(db, 'children', child.id);
          await updateDoc(childDocRef, {
            authorized_uid: arrayRemove(user.email),
          });
        }
      } catch (error) {
        console.error('Error performing action:', error);
        throw error;
      }
    },

    async addSleep(sleepData: SleepData): Promise<SleepData> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to add a sleep activity.');
      }
      try {
        const docRef = await addDoc(collection(db, 'children', sleepData.id, 'sleep'), {
          start: sleepData.start,
          end: sleepData.end,
          quality: sleepData.quality
        });
        return {
          id: sleepData.id,
          start: sleepData.start,
          end: sleepData.end,
          quality: sleepData.quality,
        }
      } catch (error) {
        console.error('Error adding sleep activity:', error);
        throw error;
      }
    },

    async addFeed(feedData: FeedData): Promise<FeedData> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to add a feed activity.');
      }
      try {
        const docRef = await addDoc(collection(db, 'children', feedData.id, 'feed'), {
          amount: feedData.amount,
          dateTime: feedData.dateTime,
          description: feedData.description,
          duration: feedData.duration,
          notes: feedData.notes,
          type: feedData.type,
          ...(feedData.type === 'nursing' && feedData.side ? { side: feedData.side } : {})
        });
    
        return {
          id: feedData.id,
          amount: feedData.amount,
          dateTime: feedData.dateTime,
          description: feedData.description,
          duration: feedData.duration,
          notes: feedData.notes,
          type: feedData.type,
          ...(feedData.type === 'nursing' && feedData.side ? { side: feedData.side } : {}),
        };
      } catch (error) {
        console.error('Error adding feed activity:', error);
        throw error;
      }
    },

    async addDiaper(diaperData: DiaperData): Promise<DiaperData> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to add a diaper activity.');
      }
    
      try {
        const docRef = await addDoc(collection(db, 'children', diaperData.id, 'diaper'), {
          dateTime: diaperData.dateTime,
          type: diaperData.type
        });
    
        return {
          id: diaperData.id,
          dateTime: diaperData.dateTime,
          type: diaperData.type,
        };
      } catch (error) {
        console.error('Error adding diaper activity:', error);
        throw error;
      }
    },

    async addActivity(activityData: ActivityData): Promise<ActivityData> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to add a activity activity.');
      }
    
      try {
        const docRef = await addDoc(collection(db, 'children', activityData.id, 'activity'), {
          dateTime: activityData.dateTime,
          type: activityData.type
        });
    
        return {
          id: activityData.id,
          dateTime: activityData.dateTime,
          type: activityData.type,
        };
      } catch (error) {
        console.error('Error adding activity activity:', error);
        throw error;
      }
    },

    async addMilestone(milestoneData: MilestoneData): Promise<MilestoneData> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to add a milestone activity.');
      }
    
      try {
        const docRef = await addDoc(collection(db, 'children', milestoneData.id, 'milestone'), {
          dateTime: milestoneData.dateTime,
          type: milestoneData.type
        });
    
        return {
          id: milestoneData.id,
          dateTime: milestoneData.dateTime,
          type: milestoneData.type,
        };
      } catch (error) {
        console.error('Error adding milestone activity:', error);
        throw error;
      }
    },

    async getSleep(childId: string): Promise<SleepData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to get sleep activities.');
      }
      try {
        const sleepCollection = collection(db, 'children', childId, 'sleep');
        const snapshot = await getDocs(sleepCollection);
        return snapshot.docs.map((doc) => doc.data() as SleepData);
      } catch (error) {
        console.error('Error getting sleep activities:', error);
        throw error;
      }
      },

    async getFeed(childId: string): Promise<FeedData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User must be logged in to get feed activities.');
      }
      try {
        const feedCollection = collection(db, 'children', childId, 'feed');
        const snapshot = await getDocs(feedCollection);
        return snapshot.docs.map((doc) => doc.data() as FeedData);
      } catch (error) {
        console.error('Error getting feed activities:', error);
        throw error;
      }
    }
  };

