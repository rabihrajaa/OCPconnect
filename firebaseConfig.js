// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getReactNativePersistence, getAuth, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfvpo7_QVLgbgnO6rNFxJt0ZRTuU4K-G4",
    authDomain: "ocpconnect-d3f80.firebaseapp.com",
    projectId: "ocpconnect-d3f80",
    storageBucket: "ocpconnect-d3f80.appspot.com",
    messagingSenderId: "73339081884",
    appId: "1:73339081884:web:030b71a58a79cfb417c959"
};

// Initialize Firebase if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and Firestore
let auth;
if (getApps().length === 0) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} else {
    auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);

// Firestore references
export const userRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');