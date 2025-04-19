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
    peeAmount?: 'little' | 'medium' | 'big';
    pooAmount?: 'little' | 'medium' | 'big';
    pooColor?: 'yellow' | 'brown' | 'black' | 'green' | 'red';
    pooConsistency?: 'solid' | 'loose' | 'runny' | 'mucousy' | 'hard' | 'pebbles' | 'diarrhea';
    hasRash: boolean;
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
      console.log('[ChildService]fetchUserChildren executing');
      console.log('...[fetchUserChildren] fetching children for user email:', user.email);
      
      try {
        const childrenCollection = collection(db, 'children');
        console.log('...[fetchUserChildren] accessing "children" collection from Firestore');
      
        // Queries for children (authorized and parent relationships)
        const authorizedQuery = query(childrenCollection, where('authorized_uid', 'array-contains', user.email));
        const parentQuery = query(childrenCollection, where('parent_uid', '==', user.email));
      
        const authorizedSnapshot = await getDocs(authorizedQuery);
        const parentSnapshot = await getDocs(parentQuery);
      
        let childrenFound: ChildData[] = [];
      
        // Process parent matches
        console.log('...[fetchUserChildren] processing parent_uid documents');
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
        console.log('...[fetchUserChildren] processing authorized_uid documents');
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
        console.log('[ChildService]fetchUserChildren completed');
        return childrenFound;
      } catch (error) {
        console.error('[ChildService]fetchUserChildren error occurred:', error);
        throw error;
      }
    },
  
    // Add a new child
    async addChild(childData: NewChildData): Promise<ChildData> {
      console.log('[ChildService]addChild executing');
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]addChild failed: user not authenticated');
        throw new Error('User must be logged in to add child');
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
        console.log(`...[addChild] child created: ${docRef.id}`);
        // Return the new child with the correct format
        return {
          first_name: childData.first_name,
          last_name: childData.last_name,
          type: 'Parent',
          id: docRef.id,
        };
      } catch (error) {
        console.error('[ChildService]addChild error occurred:', error);
        throw error;
      }
    },
  
    // Delete a child or remove access
    async removeChildOrAccess(child: ChildData): Promise<void> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]removeChildOrAccess failed: user not authenticated');
        throw new Error('User must be logged in to remove child or access');
      }
  
      try {
        if (child.type === 'Parent') {
          // Parent: Delete the entire document
          const childDocRef = doc(db, 'children', child.id);
          await deleteDoc(childDocRef);
          console.log(`...[removeChildOrAccess] child removed: ${child.id}`);
        } else if (child.type === 'Authorized') {
          // Authorized: Remove user's UID from authorized_uid array
          const childDocRef = doc(db, 'children', child.id);
          await updateDoc(childDocRef, {
            authorized_uid: arrayRemove(user.email),
          });
          console.log(`...[removeChildOrAccess] access removed: ${child.id}`);
        }
      } catch (error) {
        console.error('[ChildService]removeChildOrAccess error occurred:', error);
        throw error;
      }
    },

    async addSleep(sleepData: SleepData): Promise<SleepData> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]addSleep failed: user not authenticated');
        throw new Error('User must be logged in to add sleep data');
      }
      try {
        const docRef = await addDoc(collection(db, 'children', sleepData.id, 'sleep'), {
          start: sleepData.start,
          end: sleepData.end,
          quality: sleepData.quality
        });
        console.log(`...[addSleep] data created: ${sleepData.id}`);
        return {
          id: sleepData.id,
          start: sleepData.start,
          end: sleepData.end,
          quality: sleepData.quality,
        }
      } catch (error) {
        console.error('[ChildService]addSleep error occurred:', error);
        throw error;
      }
    },

    async addFeed(feedData: FeedData): Promise<FeedData> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]addFeed failed: user not authenticated');
        throw new Error('User must be logged in to add feed data');
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
        console.log(`...[addFeed] data created: ${feedData.id}`);
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
        console.error('[ChildService]addFeed error occurred:', error);
        throw error;
      }
    },

    async addDiaper(diaperData: DiaperData): Promise<DiaperData> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]addDiaper failed: user not authenticated');
        throw new Error('User must be logged in to add diaper data');
      }
    
      try {
        const docRef = await addDoc(collection(db, 'children', diaperData.id, 'diaper'), {
          dateTime: diaperData.dateTime,
          type: diaperData.type,
          hasRash: diaperData.hasRash,
          ...(diaperData.type === 'mixed' || diaperData.type === 'pee' && diaperData.peeAmount ? {peeAmount: diaperData.peeAmount } : {}),
          ...(diaperData.type === 'mixed' || diaperData.type === 'poo' && diaperData.pooAmount ? {pooAmount: diaperData.pooAmount } : {}),
          ...(diaperData.type === 'mixed' || diaperData.type === 'poo' && diaperData.pooColor ? {pooColor: diaperData.pooColor } : {}),
          ...(diaperData.type === 'mixed' || diaperData.type === 'poo' && diaperData.pooConsistency ? {pooConsistency: diaperData.pooConsistency } : {})
         // peeAmount: diaperData.peeAmount,
         // pooAmount: diaperData.pooAmount,
         // pooColor: diaperData.pooColor,
         // pooConsistency: diaperData.pooConsistency,
        });
        console.log(`...[addDiaper] data created: ${diaperData.id}`);
        return {
          id: diaperData.id,
          dateTime: diaperData.dateTime,
          type: diaperData.type,
          peeAmount: diaperData.peeAmount,
          pooAmount: diaperData.pooAmount,
          pooColor: diaperData.pooColor,
          pooConsistency: diaperData.pooConsistency,
          hasRash: diaperData.hasRash
        };
      } catch (error) {
        console.error('[ChildService]addDiaper error occurred:', error);
        throw error;
      }
    },

    async addActivity(activityData: ActivityData): Promise<ActivityData> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]addActivity failed: user not authenticated');
        throw new Error('User must be logged in to add activity data');
      }
    
      try {
        const docRef = await addDoc(collection(db, 'children', activityData.id, 'activity'), {
          dateTime: activityData.dateTime,
          type: activityData.type
        });
        console.log(`...[addActivity] data created: ${activityData.id}`);
        return {
          id: activityData.id,
          dateTime: activityData.dateTime,
          type: activityData.type,
        };
      } catch (error) {
        console.error('[ChildService]addActivity error occurred:', error);
        throw error;
      }
    },

    async addMilestone(milestoneData: MilestoneData): Promise<MilestoneData> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]addMilestone failed: user not authenticated');
        throw new Error('User must be logged in to add milestone data');
      }
    
      try {
        const docRef = await addDoc(collection(db, 'children', milestoneData.id, 'milestone'), {
          dateTime: milestoneData.dateTime,
          type: milestoneData.type
        });
        console.log(`...[addMilestone] data created: ${milestoneData.id}`);
        return {
          id: milestoneData.id,
          dateTime: milestoneData.dateTime,
          type: milestoneData.type,
        };
      } catch (error) {
        console.error('[ChildService]addMilestone error occurred:', error);
        throw error;
      }
    },

    async getSleep(childId: string): Promise<SleepData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]getSleep failed: user not authenticated');
        throw new Error('User must be logged in to get sleep data');
      }
      try {
        const sleepCollection = collection(db, 'children', childId, 'sleep');
        const snapshot = await getDocs(sleepCollection);
        console.log(`...[getSleep] sleep data returned`);
        return snapshot.docs.map((doc) => ({
          ...doc.data(),
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate()
        })) as SleepData[];
      } catch (error) {
        console.error('[ChildService]getSleep error occurred:', error);
        throw error;
      }
    },

    async getFeed(childId: string): Promise<FeedData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]getFeed failed: user not authenticated');
        throw new Error('User must be logged in to get feed data');
      }
      try {
        const feedCollection = collection(db, 'children', childId, 'feed');
        const snapshot = await getDocs(feedCollection);
        console.log(`...[getFeed] feed data returned`);
        return snapshot.docs.map((doc) => ({
          ...doc.data(),
          dateTime: doc.data().dateTime.toDate()
        })) as FeedData[];
      } catch (error) {
        console.error('[ChildService]getFeed error occurred:', error);
        throw error;
      }
    },

    async getDiaper(childId: string): Promise<DiaperData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]getDiaper failed: user not authenticated');
        throw new Error('User must be logged in to get diaper data');
      }
      try {
        const diaperCollection = collection(db, 'children', childId, 'diaper');
        const snapshot = await getDocs(diaperCollection);
        console.log(`...[getDiaper] diaper data returned`);
        return snapshot.docs.map((doc) => ({
          ...doc.data(),
          dateTime: doc.data().dateTime.toDate()
        })) as DiaperData[];
      } catch (error) {
        console.error('[ChildService]getDiaper error occurred:', error);
        throw error;
      }
    }    
  };

