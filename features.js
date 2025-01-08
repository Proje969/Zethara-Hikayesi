// Beğeni Sistemi
async function toggleLike(chapterId) {
    if (!auth.currentUser) {
        alert('Beğenmek için giriş yapmalısınız.');
        return;
    }

    const userId = auth.currentUser.uid;
    const likeRef = db.collection('likes').doc(`${chapterId}_${userId}`);
    const chapterRef = db.collection('chapters').doc(chapterId);

    try {
        const likeDoc = await likeRef.get();
        
        await db.runTransaction(async (transaction) => {
            const chapterDoc = await transaction.get(chapterRef);
            const currentLikes = chapterDoc.data()?.likes || 0;

            if (likeDoc.exists) {
                // Beğeniyi kaldır
                transaction.delete(likeRef);
                transaction.update(chapterRef, { likes: currentLikes - 1 });
                document.getElementById('like-button').classList.remove('liked');
            } else {
                // Beğeni ekle
                transaction.set(likeRef, { 
                    userId,
                    chapterId,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                transaction.update(chapterRef, { likes: currentLikes + 1 });
                document.getElementById('like-button').classList.add('liked');
            }
        });

        updateLikeCount(chapterId);
    } catch (error) {
        console.error('Beğeni hatası:', error);
    }
}

// Beğeni sayısını güncelle
async function updateLikeCount(chapterId) {
    try {
        const chapterDoc = await db.collection('chapters').doc(chapterId).get();
        const likeCount = chapterDoc.data()?.likes || 0;
        document.getElementById('like-count').textContent = likeCount;
    } catch (error) {
        console.error('Beğeni sayısı güncelleme hatası:', error);
    }
}

// Kullanıcının beğeni durumunu kontrol et
async function checkUserLike(chapterId) {
    if (!auth.currentUser) return;

    try {
        const likeDoc = await db.collection('likes')
            .doc(`${chapterId}_${auth.currentUser.uid}`)
            .get();

        if (likeDoc.exists) {
            document.getElementById('like-button').classList.add('liked');
        }
    } catch (error) {
        console.error('Beğeni kontrolü hatası:', error);
    }
}

// Okuma Listesi
async function toggleReadingList(chapterId) {
    if (!auth.currentUser) {
        alert('Okuma listesine eklemek için giriş yapmalısınız.');
        return;
    }

    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);

    try {
        const userDoc = await userRef.get();
        const readingList = userDoc.data()?.readingList || [];
        
        if (readingList.includes(chapterId)) {
            // Listeden çıkar
            await userRef.update({
                readingList: firebase.firestore.FieldValue.arrayRemove(chapterId)
            });
            document.getElementById('reading-list-button').classList.remove('added');
        } else {
            // Listeye ekle
            await userRef.update({
                readingList: firebase.firestore.FieldValue.arrayUnion(chapterId)
            });
            document.getElementById('reading-list-button').classList.add('added');
        }
    } catch (error) {
        console.error('Okuma listesi hatası:', error);
    }
}

// Okuma listesi durumunu kontrol et
async function checkReadingList(chapterId) {
    if (!auth.currentUser) return;

    try {
        const userDoc = await db.collection('users')
            .doc(auth.currentUser.uid)
            .get();

        const readingList = userDoc.data()?.readingList || [];
        if (readingList.includes(chapterId)) {
            document.getElementById('reading-list-button').classList.add('added');
        }
    } catch (error) {
        console.error('Okuma listesi kontrolü hatası:', error);
    }
}

// Okuyucu Profili
async function updateUserProfile(displayName, bio) {
    if (!auth.currentUser) return;

    try {
        await db.collection('users').doc(auth.currentUser.uid).update({
            displayName,
            bio,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Profil güncellendi!');
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
    }
}

// Bildirim Sistemi
async function subscribeToNotifications(chapterId) {
    if (!auth.currentUser) {
        alert('Bildirimleri açmak için giriş yapmalısınız.');
        return;
    }

    try {
        await requestNotificationPermission();
        
        await db.collection('subscriptions').add({
            userId: auth.currentUser.uid,
            chapterId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Bildirimler açıldı!');
    } catch (error) {
        console.error('Bildirim aboneliği hatası:', error);
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    const chapterId = document.body.dataset.chapterId;
    if (chapterId) {
        updateLikeCount(chapterId);
        checkUserLike(chapterId);
        checkReadingList(chapterId);
    }
}); 