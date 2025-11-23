// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAml5COo4-mvDgpzNHGNPxOJ13ed6KuXFU",
  authDomain: "humanbgm.firebaseapp.com",
  projectId: "humanbgm",
  storageBucket: "humanbgm.firebasestorage.app",
  messagingSenderId: "915431573625",
  appId: "1:915431573625:web:1721a29800da4e1e30eca8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);