
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ▼ 여기 따옴표 안에 .env 파일 내용을 복사해서 넣으세요 ▼
const firebaseConfig = {
  apiKey: "AIzaSyAml5COo4-mvDgpzNHGNPxOJ13ed6KuXFU",
  authDomain: "humanbgm.firebaseapp.com",
  projectId: "humanbgm",
  storageBucket: "humanbgm.firebasestorage.app",
  messagingSenderId: "915431573625",
  appId: "1:915431573625:web:1721a29800da4e1e30eca8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);