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
  storageBucket: "atesin-kanatlari.appspot.com",
  messagingSenderId: "593486762776",
  appId: "1:593486762776:web:445bb1d4be7ae1214bc46d",
  measurementId: "G-0W24TQECMF"
};

// Firebase'i başlat
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);

  // Servisler
  const auth = firebase.auth();
  const db = firebase.firestore();
  const messaging = firebase.messaging();
  const analytics = firebase.analytics();

  // Google Sign-in yapılandırması
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  // Oturum durumu değişikliğini dinle
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Kullanıcı oturum açtığında
      console.log('Oturum açıldı:', user.displayName);
      updateUserUI(user);
      syncUserData(user);
    } else {
      // Kullanıcı oturumu kapattığında
      console.log('Oturum kapalı');
      updateUserUI(null);
    }
  });

  // Kullanıcı arayüzünü güncelle
  function updateUserUI(user) {
    const userInfo = document.getElementById('user-info');
    const signInButton = document.getElementById('signin-button');
    const commentForm = document.getElementById('comment-form');
    
    if (user && userInfo && signInButton && commentForm) {
      userInfo.textContent = `${user.displayName} olarak giriş yapıldı`;
      signInButton.style.display = 'none';
      commentForm.style.display = 'block';
    } else if (userInfo && signInButton && commentForm) {
      userInfo.textContent = '';
      signInButton.style.display = 'block';
      commentForm.style.display = 'none';
    }
  }

  // Kullanıcı verilerini senkronize et
  async function syncUserData(user) {
    if (!user) return;

    const userRef = db.collection('users').doc(user.uid);
    try {
      const doc = await userRef.get();
      if (!doc.exists) {
        // Yeni kullanıcı oluştur
        await userRef.set({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          readingList: [],
          likes: [],
          comments: []
        });
      }
    } catch (error) {
      console.error('Kullanıcı senkronizasyon hatası:', error);
    }
  }

  // Bildirim izinleri için
  async function requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await messaging.getToken({
          vapidKey: 'BPYqVL8aX8JZQyXmYQn_ZQKbE9_kq-lCEZY6ZY6XZY6ZY6XZY' // Firebase Console'dan alınacak
        });
        if (auth.currentUser) {
          await db.collection('users').doc(auth.currentUser.uid).update({
            notificationToken: token
          });
        }
        return token;
      }
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
    }
  }
} else {
  console.error('Firebase yüklenemedi!');
} 