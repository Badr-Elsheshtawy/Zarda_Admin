import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWGpi3vwyRQM_CSeHfHPIrlIeecJ2kSg8",
  authDomain: "zarda-travel-agency.firebaseapp.com",
  projectId: "zarda-travel-agency",
  storageBucket: "zarda-travel-agency.firebasestorage.app",
  messagingSenderId: "930592221984",
  appId: "1:930592221984:web:150984784421ca1d3a8545",
  measurementId: "G-ZPPHJYE81X"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

