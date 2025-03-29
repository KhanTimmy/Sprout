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
    }
  };