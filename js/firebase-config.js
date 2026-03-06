// Firebase SDK'larını CDN üzerinden dahil ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

Siz şunu dediniz:

const firebaseConfig = {

  apiKey: "AIzaSyAeXIB6ZkeI3YglzZVnS0_m3kyRwd-Kq6k",

  authDomain: "dnd-lobby-system.firebaseapp.com",

  projectId: "dnd-lobby-system",

  storageBucket: "dnd-lobby-system.firebasestorage.app",

  messagingSenderId: "581834512528",

  appId: "1:581834512528:web:d0aa047b01c1823b79e015"

}; 
// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Veri tabanı (Firestore) referansını dışa aktar (diğer dosyalarda kullanmak için)
export const db = getFirestore(app);
