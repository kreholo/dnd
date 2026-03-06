import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeXIB6ZkeI3YglzZVnS0_m3kyRwd-Kq6k",
  authDomain: "dnd-lobby-system.firebaseapp.com",
  projectId: "dnd-lobby-system",
  storageBucket: "dnd-lobby-system.firebasestorage.app",
  messagingSenderId: "581834512528",
  appId: "1:581834512528:web:d0aa047b01c1823b79e015"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
