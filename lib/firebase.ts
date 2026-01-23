import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Realtime Database

const firebaseConfig = {
    apiKey: "AIzaSyDuJF46OdZQl76PuCPZiVo12_IlBy7X8xY",
    authDomain: "nshotel.firebaseapp.com",
    databaseURL: "https://nshotel-default-rtdb.firebaseio.com",
    projectId: "nshotel",
    storageBucket: "nshotel.firebasestorage.app",
    messagingSenderId: "276227381187",
    appId: "1:276227381187:web:3696a3666115b9b7b5cf76",
    measurementId: "G-RRMSG5BGWB"
};

// Initialize Firebase (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };
