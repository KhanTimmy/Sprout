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
  import AsyncStorage from '@react-native-async-storage/async-storage';

  let queryCounter = 0;
  let currentChildID: string | null = null;

  const CACHE_KEYS = {
    FEED: 'childData_feed',
    SLEEP: 'childData_sleep',
    DIAPER: 'childData_diaper',
    ACTIVITY: 'childData_activity',
    MILESTONE: 'childData_milestone',
    LAST_FETCH: 'childData_lastFetch',
  }

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const isCacheValid = async (childId: string): Promise<boolean> => {
    try {
      const lastFetch = await AsyncStorage.getItem(CACHE_KEYS.LAST_FETCH + childId);
      if (!lastFetch) return false;

      const lastFetchTime = parseInt(lastFetch);
      const now = Date.now();
      return (now - lastFetchTime) < CACHE_DURATION;
    } catch (error) {
      console.error('[Cache] Error checking cache valididty:', error);
      return false;
    }
  };

  const updateCacheTimestamp = async (childId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_FETCH + childId, Date.now().toString());
    } catch (error) {
      console.error('[Cache] Error updating cache timestamp:', error);
    }
  };

  const clearChildCache = async (childId: string): Promise<void> => {
    try {
      const keys = [
        CACHE_KEYS.FEED + childId,
        CACHE_KEYS.SLEEP + childId,
        CACHE_KEYS.DIAPER + childId,
        CACHE_KEYS.ACTIVITY + childId,
        CACHE_KEYS.MILESTONE + childId,
        CACHE_KEYS.LAST_FETCH + childId
      ];
      await AsyncStorage.multiRemove(keys);
      console.log(`[Cache] Cleared cache for child: ${childId}`);
    } catch (error) {
      console.error('[Cache] Error clearing cache:', error);
    }
  };

  const resetQueryCounter = (childId: string | null) => {
    if (currentChildID !== childId) {
      if (currentChildID !== null) {
        console.log(`[QueryCounter] Child changed from ${currentChildID} to ${childId || 'none'}. Resetting counter.`);
      }
      queryCounter = 0;
      currentChildID = childId;
      if (childId) {
        console.log(`[QueryCounter] New child selected: ${childId}. Counter reset to 0.`);
      } else {
        console.log(`[QueryCounter] No child selected. Counter reset to 0.`);
      }
    }
  };

  const incrementQueryCounter = (operation: string, childId?: string) => {
    if (childId) {
      resetQueryCounter(childId);
    }
    queryCounter++;
    console.log(`[QueryCounter] ${operation} - Total queries for current child: ${queryCounter}`);
  };

  export { resetQueryCounter, clearChildCache };  
  
  export interface ChildData {
    id: string;
    first_name: string;
    last_name: string;
    type: string;
    dob: string;
    sex: 'male' | 'female';
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
    dateTime: Date;
    description: string;
    duration: number;
    notes: string;
    type: 'nursing' | 'bottle' | 'solid';
    side?: 'left' | 'right';
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
    async fetchUserChildren(): Promise<ChildData[]> {
      const user = getAuth().currentUser;
      if (!user || !user.email) return [];
      console.log('[ChildService]fetchUserChildren executing');
      console.log('...[fetchUserChildren] fetching children for user email:', user.email);
      
      try {
        const childrenCollection = collection(db, 'children');
        console.log('...[fetchUserChildren] accessing "children" collection from Firestore');

        const authorizedQuery = query(childrenCollection, where('authorized_uid', 'array-contains', user.email));
        const parentQuery = query(childrenCollection, where('parent_uid', '==', user.email));
      
        const authorizedSnapshot = await getDocs(authorizedQuery);
        const parentSnapshot = await getDocs(parentQuery);
      
        let childrenFound: ChildData[] = [];

        parentSnapshot.forEach((doc) => {
          const parentChildData = doc.data();
          if (parentChildData.parent_uid) {
            childrenFound.push({
              id: doc.id,
              first_name: parentChildData.first_name,
              last_name: parentChildData.last_name,
              type: 'Parent',
              dob: parentChildData.dob,
              sex: parentChildData.sex,
            });
          }
        });

        authorizedSnapshot.forEach((doc) => {
          const authChildData = doc.data();
          if (authChildData.authorized_uid) {
            childrenFound.push({
              id: doc.id,
              first_name: authChildData.first_name,
              last_name: authChildData.last_name,
              type: 'Authorized',
              dob: authChildData.dob,
              sex: authChildData.sex,
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
        return {
          first_name: childData.first_name,
          last_name: childData.last_name,
          type: 'Parent',
          id: docRef.id,
          dob: childData.dob,
          sex: childData.sex as "male" | "female",
        };
      } catch (error) {
        console.error('[ChildService]addChild error occurred:', error);
        throw error;
      }
    },

    async removeChildOrAccess(child: ChildData): Promise<void> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]removeChildOrAccess failed: user not authenticated');
        throw new Error('User must be logged in to remove child or access');
      }
  
      try {
        if (child.type === 'Parent') {
          const childDocRef = doc(db, 'children', child.id);
          await deleteDoc(childDocRef);
          console.log(`...[removeChildOrAccess] child removed: ${child.id}`);
        } else if (child.type === 'Authorized') {
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

        await clearChildCache(sleepData.id);
        
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
        
        await clearChildCache(feedData.id);
        
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
        });
        console.log(`...[addDiaper] data created: ${diaperData.id}`);

        await clearChildCache(diaperData.id);
        
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
  
        await clearChildCache(activityData.id);
        
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

        await clearChildCache(milestoneData.id);
        
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
        console.log('[ChildService]getSleep executing for childId:', childId);

        if (await isCacheValid(childId)) {
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.SLEEP + childId);
          if (cachedData) {
            console.log('[Cache] Returning cached sleep data');
            const parsedData = JSON.parse(cachedData);
            return parsedData.map((sleep: any) => ({
              ...sleep,
              start: new Date(sleep.start),
              end: new Date(sleep.end)
            }));
          }
        }

        incrementQueryCounter('getSleep', childId);
        const sleepCollection = collection(db, 'children', childId, 'sleep');
        const snapshot = await getDocs(sleepCollection);
        console.log(`...[getSleep] sleep data returned with ${snapshot.docs.length} entries`);
        
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate()
        })) as SleepData[];

        await AsyncStorage.setItem(CACHE_KEYS.SLEEP + childId, JSON.stringify(data));
        await updateCacheTimestamp(childId);
        console.log('[Cache] Cached sleep data');
        
        return data;
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
        console.log('[ChildService]getFeed executing for childId:', childId);

        if (await isCacheValid(childId)) {
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.FEED + childId);
          if (cachedData) {
            console.log('[Cache] Returning cached feed data');
            const parsedData = JSON.parse(cachedData);
            return parsedData.map((feed: any) => ({
              ...feed,
              dateTime: new Date(feed.dateTime)
            }));
          }
        }

        incrementQueryCounter('getFeed', childId);
        const feedCollection = collection(db, 'children', childId, 'feed');
        const snapshot = await getDocs(feedCollection);
        console.log(`...[getFeed] feed data returned with ${snapshot.docs.length} entries`);
        
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          dateTime: doc.data().dateTime.toDate()
        })) as FeedData[];

        await AsyncStorage.setItem(CACHE_KEYS.FEED + childId, JSON.stringify(data));
        await updateCacheTimestamp(childId);
        console.log('[Cache] Cached feed data');
        
        return data;
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
        console.log('[ChildService]getDiaper executing for childId:', childId);

        if (await isCacheValid(childId)) {
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.DIAPER + childId);
          if (cachedData) {
            console.log('[Cache] Returning cached diaper data');
            const parsedData = JSON.parse(cachedData);
            return parsedData.map((diaper: any) => ({
              ...diaper,
              dateTime: new Date(diaper.dateTime)
            }));
          }
        }

        incrementQueryCounter('getDiaper', childId);
        const diaperCollection = collection(db, 'children', childId, 'diaper');
        const snapshot = await getDocs(diaperCollection);
        console.log(`...[getDiaper] diaper data returned with ${snapshot.docs.length} entries`);
        
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          dateTime: doc.data().dateTime.toDate()
        })) as DiaperData[];

        await AsyncStorage.setItem(CACHE_KEYS.DIAPER + childId, JSON.stringify(data));
        await updateCacheTimestamp(childId);
        console.log('[Cache] Cached diaper data');
        
        return data;
      } catch (error) {
        console.error('[ChildService]getDiaper error occurred:', error);
        throw error;
      }
    },

    async getActivity(childId: string): Promise<ActivityData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]getActivity failed: user not authenticated');
        throw new Error('User must be logged in to get activity data');
      }
      try {
        console.log('[ChildService]getActivity executing for childId:', childId);

        if (await isCacheValid(childId)) {
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.ACTIVITY + childId);
          if (cachedData) {
            console.log('[Cache] Returning cached activity data');
            const parsedData = JSON.parse(cachedData);
            return parsedData.map((activity: any) => ({
              ...activity,
              dateTime: new Date(activity.dateTime)
            }));
          }
        }

        incrementQueryCounter('getActivity', childId);
        const activityCollection = collection(db, 'children', childId, 'activity');
        const snapshot = await getDocs(activityCollection);
        console.log(`...[getActivity] activity data returned with ${snapshot.docs.length} entries`);
        
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          dateTime: doc.data().dateTime.toDate()
        })) as ActivityData[];

        await AsyncStorage.setItem(CACHE_KEYS.ACTIVITY + childId, JSON.stringify(data));
        await updateCacheTimestamp(childId);
        console.log('[Cache] Cached activity data');
        
        return data;
      } catch (error) {
        console.error('[ChildService]getActivity error occurred:', error);
        throw error;
      }
    },

    async getMilestone(childId: string): Promise<MilestoneData[]> {
      const user = getAuth().currentUser;
      if (!user) {
        console.error('[ChildService]getMilestone failed: user not authenticated');
        throw new Error('User must be logged in to get activity data');
      }
      try {
        console.log('[ChildService]getMilestone executing for childId:', childId);

        if (await isCacheValid(childId)) {
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.MILESTONE + childId);
          if (cachedData) {
            console.log('[Cache] Returning cached milestone data');
            const parsedData = JSON.parse(cachedData);
            return parsedData.map((milestone: any) => ({
              ...milestone,
              dateTime: new Date(milestone.dateTime)
            }));
          }
        }

        incrementQueryCounter('getMilestone', childId);
        const milestoneCollection = collection(db, 'children', childId, 'milestone');
        const snapshot = await getDocs(milestoneCollection);
        console.log(`...[getMilestone] milestone data returned with ${snapshot.docs.length} entries`);
        
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          dateTime: doc.data().dateTime.toDate()
        })) as MilestoneData[];
  
        await AsyncStorage.setItem(CACHE_KEYS.MILESTONE + childId, JSON.stringify(data));
        await updateCacheTimestamp(childId);
        console.log('[Cache] Cached milestone data');
        
        return data;
      } catch (error) {
        console.error('[ChildService]getMilestone error occurred:', error);
        throw error;
      }
    }
  };