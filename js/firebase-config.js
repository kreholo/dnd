// Firebase SDK'larını CDN üzerinden dahil ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Kendi Firebase proje ayarlarını buraya yapıştıracaksın
const firebaseConfig = {
  apiKey: "SENIN_API_KEY_IN",
  authDomain: "proje-id.firebaseapp.com",
  projectId: "proje-id",
  storageBucket: "proje-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Veri tabanı (Firestore) referansını dışa aktar (diğer dosyalarda kullanmak için)
export const db = getFirestore(app);