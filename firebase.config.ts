// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6VYt_8KSDjOLg3gSFPgn8BwCWj9erQoI",
  authDomain: "sprout-ed446.firebaseapp.com",
  projectId: "sprout-ed446",
  storageBucket: "sprout-ed446.firebasestorage.app",
  messagingSenderId: "792033994499",
  appId: "1:792033994499:web:83a7036b8eef018598eb36"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);