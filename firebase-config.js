import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeoTN9ePaS6vli-XP5jZ6mi3uy59vOfjs",
  authDomain: "atesin-kanatlari.firebaseapp.com",
  projectId: "atesin-kanatlari",
  storageBucket: "atesin-kanatlari.firebasestorage.app",
  messagingSenderId: "593486762776",
  appId: "1:593486762776:web:445bb1d4be7ae1214bc46d",
  measurementId: "G-0W24TQECMF"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Servisler
const auth = firebase.auth();
const db = firebase.firestore();
const messaging = firebase.messaging();
const analytics = firebase.analytics();

// Bildirim izinleri için
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await messaging.getToken({
                vapidKey: 'YOUR_VAPID_KEY' // Firebase Console'dan alınacak
            });
            await db.collection('users').doc(auth.currentUser.uid).update({
                notificationToken: token
            });
        }
    } catch (error) {
        console.error('Bildirim izni hatası:', error);
    }
} 